import { NextRequest, NextResponse } from 'next/server';
import hospitalsData from '@/data/hospitals.json';
import zipCodesData from '@/data/zipCodes.json';
import insurancesData from '@/data/insurances.json';
import { calculateDistance, parseLocation } from '@/lib/utils';
import { Hospital, SearchResult, Insurance, InsurancePlan, ProcedurePrice } from '@/lib/types';
import proceduresData from '@/data/procedures.json';
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
    const { procedure, procedures: proceduresArray, location, insurance, insurancePlan, maxDistance } = body;

    // Parse procedures - support both comma-separated string and array
    let procedureList: string[] = [];
    if (proceduresArray && Array.isArray(proceduresArray)) {
      procedureList = proceduresArray;
    } else if (procedure) {
      procedureList = procedure.includes(',') ? procedure.split(',').map(p => p.trim()) : [procedure];
    }

    if (procedureList.length === 0 || !location || !maxDistance) {
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
    const insurances = insurancesData as Insurance[];

    // Filter hospitals by distance and procedure availability
    for (const hospital of hospitals) {
      // Convert hospital to legacy format if needed
      const legacyHospital = convertHospitalToLegacyFormat(hospital);
      
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

      // Process each procedure
      const procedurePrices: ProcedurePrice[] = [];
      let totalPriceWithInsurance: number | null = null;
      let totalPriceWithoutInsurance = 0;
      let selectedPlan: InsurancePlan | undefined = undefined;
      let hospitalHasAllProcedures = true;

      for (const procId of procedureList) {
        const procedureData = findProcedureInHospital(hospital, procId);
        if (!procedureData) {
          hospitalHasAllProcedures = false;
          break; // Hospital doesn't offer all procedures
        }

        const procInfo = proceduresData.find(p => p.id === procId);
        const procName = procInfo?.name || procId;

        // Get prices for this procedure
        let procPriceWithInsurance: number | null = null;
        
        if (insurance && inNetwork) {
          if (insurancePlan) {
            const selectedInsurance = insurances.find((ins) => ins.id === insurance);
            selectedPlan = selectedInsurance?.plans.find((plan) => plan.id === insurancePlan);
            
            if (selectedPlan) {
              const basePrice = procedureData.withInsurance[insurance] || procedureData.withoutInsurance;
              procPriceWithInsurance = calculatePriceWithPlan(basePrice, selectedPlan);
            } else {
              procPriceWithInsurance = procedureData.withInsurance[insurance] || null;
            }
          } else {
            procPriceWithInsurance = procedureData.withInsurance[insurance] || null;
          }
        }

        const procPriceWithoutInsurance = procedureData.withoutInsurance;

        // Add to procedure breakdown
        procedurePrices.push({
          procedureId: procId,
          procedureName: procName,
          priceWithInsurance: procPriceWithInsurance,
          priceWithoutInsurance: procPriceWithoutInsurance,
        });

        // Accumulate totals
        if (procPriceWithInsurance !== null) {
          totalPriceWithInsurance = (totalPriceWithInsurance || 0) + procPriceWithInsurance;
        }
        totalPriceWithoutInsurance += procPriceWithoutInsurance;
      }

      // Only add hospital if it offers all requested procedures
      if (!hospitalHasAllProcedures) {
        continue;
      }

      results.push({
        hospital: legacyHospital as Hospital,
        distance,
        inNetwork,
        priceWithInsurance: totalPriceWithInsurance,
        priceWithoutInsurance: totalPriceWithoutInsurance,
        insurancePlan: selectedPlan,
        procedures: procedureList.length > 1 ? procedurePrices : undefined,
        totalPriceWithInsurance: totalPriceWithInsurance,
        totalPriceWithoutInsurance: totalPriceWithoutInsurance,
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

