import { NextRequest, NextResponse } from 'next/server';
import hospitalsData from '@/data/hospitals.json';
import zipCodesData from '@/data/zipCodes.json';
import insurancesData from '@/data/insurances.json';
import { calculateDistance, parseLocation } from '@/lib/utils';
import { Hospital, SearchResult, Insurance, InsurancePlan } from '@/lib/types';
import { convertHospitalToLegacyFormat, findProcedureInHospital } from '@/lib/hospital-utils';

/**
 * Calculate price based on insurance plan benefits
 */
function calculatePriceWithPlan(basePrice: number, plan: InsurancePlan): number {
  // Start with base price
  let remainingCost = basePrice;
  let outOfPocket = 0;
  
  // Apply deductible (if not already met)
  // For simplicity, we'll assume deductible hasn't been met yet
  if (remainingCost > 0 && plan.benefits.deductible > 0) {
    const deductibleAmount = Math.min(plan.benefits.deductible, remainingCost);
    outOfPocket += deductibleAmount;
    remainingCost -= deductibleAmount;
  }
  
  // Apply copay (if applicable and cost remains)
  if (remainingCost > 0 && plan.benefits.copay > 0) {
    outOfPocket += plan.benefits.copay;
    remainingCost -= plan.benefits.copay;
  }
  
  // Apply coinsurance (percentage of remaining cost)
  if (remainingCost > 0 && plan.benefits.coinsurance > 0) {
    const coinsuranceAmount = Math.round(remainingCost * (plan.benefits.coinsurance / 100));
    outOfPocket += coinsuranceAmount;
    remainingCost -= coinsuranceAmount;
  }
  
  // Ensure we don't exceed out-of-pocket maximum
  outOfPocket = Math.min(outOfPocket, plan.benefits.outOfPocketMax);
  
  // Ensure we don't exceed the base price
  return Math.min(outOfPocket, basePrice);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { procedure, location, insurance, insurancePlan, maxDistance } = body;

    if (!procedure || !location || !maxDistance) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse location to get coordinates
    const userLocation = parseLocation(location, zipCodesData);
    if (!userLocation) {
      return NextResponse.json(
        { error: 'Invalid location. Please enter a valid zip code or city, state.' },
        { status: 400 }
      );
    }

    const hospitals = hospitalsData as any[];
    const results: SearchResult[] = [];

    // Filter hospitals by distance and procedure availability
    for (const hospital of hospitals) {
      // Convert hospital to legacy format if needed
      const legacyHospital = convertHospitalToLegacyFormat(hospital);
      
      // Check if hospital offers this procedure
      const procedureData = findProcedureInHospital(hospital, procedure);
      if (!procedureData) {
        continue;
      }

      // Calculate distance
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.coordinates.lat,
        hospital.coordinates.lng
      );

      // Filter by max distance
      if (distance > maxDistance) {
        continue;
      }

      // Check if in network
      const inNetworkInsurances = hospital.in_network_insurances || hospital.inNetworkInsurances || [];
      const inNetwork = insurance
        ? inNetworkInsurances.includes(insurance)
        : false;

      // Get prices
      let priceWithInsurance: number | null = null;
      let selectedPlan: InsurancePlan | undefined = undefined;
      
      if (insurance && inNetwork) {
        // If a specific plan is selected, calculate price based on plan benefits
        if (insurancePlan) {
          const insurances = insurancesData as Insurance[];
          const selectedInsurance = insurances.find((ins) => ins.id === insurance);
          selectedPlan = selectedInsurance?.plans.find((plan) => plan.id === insurancePlan);
          
          if (selectedPlan) {
            // Calculate price based on plan benefits
            const basePrice = procedureData.withInsurance[insurance] || procedureData.withoutInsurance;
            priceWithInsurance = calculatePriceWithPlan(basePrice, selectedPlan);
          } else {
            // Fallback to default insurance price
            priceWithInsurance = procedureData.withInsurance[insurance] || null;
          }
        } else {
          // Use default insurance price
          priceWithInsurance = procedureData.withInsurance[insurance] || null;
        }
      }
      
      const priceWithoutInsurance = procedureData.withoutInsurance;

      results.push({
        hospital: legacyHospital as Hospital,
        distance,
        inNetwork,
        priceWithInsurance,
        priceWithoutInsurance,
        insurancePlan: selectedPlan,
      });
    }

    // Sort by distance (closest first)
    results.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

