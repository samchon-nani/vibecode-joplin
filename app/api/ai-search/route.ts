import { NextRequest, NextResponse } from 'next/server';
import proceduresData from '@/data/procedures.json';
import insurancesData from '@/data/insurances.json';
import hospitalsData from '@/data/hospitals.json';
import zipCodesData from '@/data/zipCodes.json';
import { calculateDistance, parseLocation } from '@/lib/utils';
import { Hospital, SearchResult, Insurance, InsurancePlan, ProcedurePrice } from '@/lib/types';
import { convertHospitalToLegacyFormat, findProcedureInHospital } from '@/lib/hospital-utils';

/**
 * Calculate price based on insurance plan benefits
 */
function calculatePriceWithPlan(basePrice: number, plan: InsurancePlan): number {
  let remainingCost = basePrice;
  let outOfPocket = 0;
  
  if (remainingCost > 0 && plan.benefits.deductible > 0) {
    const deductibleAmount = Math.min(plan.benefits.deductible, remainingCost);
    outOfPocket += deductibleAmount;
    remainingCost -= deductibleAmount;
  }
  
  if (remainingCost > 0 && plan.benefits.copay > 0) {
    outOfPocket += plan.benefits.copay;
    remainingCost -= plan.benefits.copay;
  }
  
  if (remainingCost > 0 && plan.benefits.coinsurance > 0) {
    const coinsuranceAmount = Math.round(remainingCost * (plan.benefits.coinsurance / 100));
    outOfPocket += coinsuranceAmount;
    remainingCost -= coinsuranceAmount;
  }
  
  outOfPocket = Math.min(outOfPocket, plan.benefits.outOfPocketMax);
  return Math.min(outOfPocket, basePrice);
}

/**
 * AI-powered query parser
 * Extracts procedures, insurance, location, and distance from natural language
 */
function parseAIQuery(query: string): {
  procedures: string[];
  insurance: string;
  insurancePlan?: string;
  location: string;
  maxDistance: number;
  explicitlyNoInsurance: boolean;
} {
  const lowerQuery = query.toLowerCase();
  
  // Extract procedures by name or CPT code
  const procedures: string[] = [];
  const procedureKeywords: Record<string, string> = {
    'mri': 'MRI',
    'cat scan': 'CT Scan',
    'ct scan': 'CT Scan',
    'computed tomography': 'CT Scan',
    'x-ray': 'X-Ray',
    'xray': 'X-Ray',
    'ultrasound': 'Ultrasound',
    'blood test': 'Blood Test',
    'lab test': 'Blood Test',
    'cbc': 'Blood Test',
    'complete blood count': 'Blood Test',
  };
  
  // First, check for CPT codes in the query
  const cptCodeMap: Record<string, string> = {
    '70551': 'MRI',
    '71250': 'CT Scan',
    '71046': 'X-Ray',
    '85025': 'Blood Test',
    '76700': 'Ultrasound',
  };
  
  // Search for multiple CPT codes (5-digit numbers)
  const cptCodeMatches = query.match(/\b(\d{5})\b/g);
  if (cptCodeMatches) {
    for (const code of cptCodeMatches) {
      if (cptCodeMap[code] && !procedures.includes(cptCodeMap[code])) {
        procedures.push(cptCodeMap[code]);
      }
    }
  }
  
  // Also check for CPT codes mentioned in text (e.g., "CPT 70551" or "code 70551")
  for (const [code, procedureId] of Object.entries(cptCodeMap)) {
    if (lowerQuery.includes(code) || query.includes(code)) {
      if (!procedures.includes(procedureId)) {
        procedures.push(procedureId);
      }
    }
  }
  
  // Then check for procedure name keywords (can match multiple)
  for (const [keyword, procedureId] of Object.entries(procedureKeywords)) {
    if (lowerQuery.includes(keyword)) {
      if (!procedures.includes(procedureId)) {
        procedures.push(procedureId);
      }
    }
  }
  
  // Check for common multiple procedure patterns like "and", "plus", ","
  const multiplePatterns = [
    /\b(?:and|plus|with|,)\b/i,
  ];
  
  // If we find multiple procedure keywords, try to extract all
  const andMatch = lowerQuery.match(/\b(?:and|plus|with)\b/i);
  if (andMatch) {
    // Split query by "and", "plus", "with" and check each part
    const parts = lowerQuery.split(/\b(?:and|plus|with)\b/i);
    for (const part of parts) {
      for (const [keyword, procedureId] of Object.entries(procedureKeywords)) {
        if (part.includes(keyword) && !procedures.includes(procedureId)) {
          procedures.push(procedureId);
        }
      }
      // Check for CPT codes in each part
      const partCptMatches = part.match(/\b(\d{5})\b/g);
      if (partCptMatches) {
        for (const code of partCptMatches) {
          if (cptCodeMap[code] && !procedures.includes(cptCodeMap[code])) {
            procedures.push(cptCodeMap[code]);
          }
        }
      }
    }
  }
  
  // If no procedures found, default to all
  if (procedures.length === 0) {
    procedures.push(...proceduresData.map(p => p.id));
  }
  
  // Check for explicit "no insurance" keywords first
  // Use both exact matches and flexible patterns to handle typos
  const noInsuranceKeywords = [
    'no insurance',
    'without insurance',
    'uninsured',
    'self-pay',
    'self pay',
    'cash pay',
    'cash payment',
    'cash only',
    'paying cash',
    'no coverage',
    'without coverage',
    'did not provide insurance',
    'they did not provide insurance',
    'they did not provide an insurance',
    'did not provide an insurance',
  ];
  
  // Check for exact keyword matches
  let explicitlyNoInsurance = noInsuranceKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  // Also check for flexible patterns that handle typos like "insureance", "insuranc", etc.
  // Pattern: "did not provide" followed by optional "an" followed by something like "insurance"
  // This pattern is more flexible to catch common typos: insuranc, insureance, insurence, etc.
  const didNotProvidePattern = /did\s+not\s+provide\s+(?:an\s+)?insur[ae][a-z]*/i;
  if (didNotProvidePattern.test(query)) {
    explicitlyNoInsurance = true;
  }
  
  // Check for "they did not provide" pattern with typos
  const theyDidNotProvidePattern = /they\s+did\s+not\s+provide\s+(?:an\s+)?insur[ae][a-z]*/i;
  if (theyDidNotProvidePattern.test(query)) {
    explicitlyNoInsurance = true;
  }
  
  // Extract insurance
  let insurance = '';
  let insurancePlan: string | undefined = undefined;
  
  // Only look for insurance if user didn't explicitly say no insurance
  if (!explicitlyNoInsurance) {
    const insuranceKeywords: Record<string, string> = {
      'bluecross': 'bluecross',
      'blue cross': 'bluecross',
      'aetna': 'aetna',
      'cigna': 'cigna',
      'unitedhealthcare': 'unitedhealthcare',
      'united healthcare': 'unitedhealthcare',
      'humana': 'humana',
      'kaiser': 'kaiser',
      'kaiser permanente': 'kaiser',
      'medicare': 'medicare',
      'medicaid': 'medicaid',
    };
    
    for (const [keyword, insuranceId] of Object.entries(insuranceKeywords)) {
      if (lowerQuery.includes(keyword)) {
        insurance = insuranceId;
        
        // Check for plan names
        const insurances = insurancesData as Insurance[];
        const selectedInsurance = insurances.find(ins => ins.id === insuranceId);
        
        if (selectedInsurance) {
          // Look for plan keywords
          const planKeywords: Record<string, string> = {
            'premium': 'premium',
            'gold': 'gold',
            'basic': 'basic',
            'select': 'select',
            'choice': 'choice',
            'advantage': 'advantage',
            'elite': 'elite',
            'plus': 'plus',
            'value': 'value',
            'enhanced': 'enhanced',
          };
          
          for (const [planKeyword, planName] of Object.entries(planKeywords)) {
            if (lowerQuery.includes(planKeyword)) {
              const plan = selectedInsurance.plans.find(p => 
                p.name.toLowerCase().includes(planName) ||
                p.id.toLowerCase().includes(planName)
              );
              if (plan) {
                insurancePlan = plan.id;
                break;
              }
            }
          }
        }
        break;
      }
    }
  }
  
  // Extract location (zip code or city, state)
  let location = '';
  
  // Try to find zip code (5 digits)
  const zipMatch = query.match(/\b\d{5}\b/);
  if (zipMatch) {
    location = zipMatch[0];
  } else {
    // Try to find city, state pattern
    const cityStateMatch = query.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/);
    if (cityStateMatch) {
      location = `${cityStateMatch[1]}, ${cityStateMatch[2]}`;
    } else {
      // Try to find just city name
      const cityMatch = query.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
      if (cityMatch && !insuranceKeywords[cityMatch[1].toLowerCase()]) {
        // Check if it's a known city
        const possibleCity = cityMatch[1];
        // For now, use it as-is (could enhance with city database lookup)
        location = possibleCity;
      }
    }
  }
  
  // Extract distance/radius
  let maxDistance = 100; // default
  const distanceMatch = query.match(/(\d+)\s*(?:mile|mi|miles|mile radius|radius)/i);
  if (distanceMatch) {
    maxDistance = parseInt(distanceMatch[1], 10);
  } else {
    // Look for "within X" pattern
    const withinMatch = query.match(/within\s+(\d+)/i);
    if (withinMatch) {
      maxDistance = parseInt(withinMatch[1], 10);
    }
  }
  
  return {
    procedures,
    insurance,
    insurancePlan,
    location,
    maxDistance: Math.min(500, Math.max(1, maxDistance)),
    explicitlyNoInsurance,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiQuery, userProfile } = body;

    if (!aiQuery || typeof aiQuery !== 'string' || !aiQuery.trim()) {
      return NextResponse.json(
        { error: 'AI query is required' },
        { status: 400 }
      );
    }

    // Parse the AI query
    const parsed = parseAIQuery(aiQuery);
    
    // Check if query is about cost/price (requires insurance for accurate pricing)
    const lowerQuery = aiQuery.toLowerCase();
    const isCostQuery = lowerQuery.includes('cost') || 
                       lowerQuery.includes('price') || 
                       lowerQuery.includes('how much') || 
                       lowerQuery.includes('will cost') ||
                       lowerQuery.includes('pricing');
    
    // Use insurance from query, user profile, or request body
    // BUT: If user explicitly said no insurance, don't use profile insurance
    let insurance = parsed.insurance;
    let insurancePlan = parsed.insurancePlan;
    
    // If user explicitly said no insurance, clear any insurance values
    if (parsed.explicitlyNoInsurance) {
      insurance = '';
      insurancePlan = undefined;
    } else if (!insurance && userProfile?.insurance) {
      insurance = userProfile.insurance;
      insurancePlan = userProfile.insurancePlan || insurancePlan;
    }
    
    // If this is a cost query and no insurance is provided AND user didn't explicitly say no insurance,
    // return missing info response
    if (isCostQuery && !insurance && !parsed.explicitlyNoInsurance) {
      return NextResponse.json({
        missingInfo: {
          required: ['insurance'],
          message: 'To provide accurate cost estimates, we need to know your insurance provider. What insurance do you have?',
          context: 'cost_query'
        },
        parsedData: {
          procedures: parsed.procedures,
          location: parsed.location,
          maxDistance: parsed.maxDistance,
        },
        aiQuery,
      }, { status: 200 });
    }
    
    if (!parsed.location) {
      // Check user profile for location
      if (userProfile?.zipCode) {
        parsed.location = userProfile.zipCode;
      } else if (userProfile?.city && userProfile?.state) {
        parsed.location = `${userProfile.city}, ${userProfile.state}`;
      } else {
        return NextResponse.json(
          { error: 'Could not determine location from your query. Please specify a zip code or city, state.' },
          { status: 400 }
        );
      }
    }

    // Parse location to get coordinates
    const userLocation = parseLocation(parsed.location, zipCodesData);
    if (!userLocation) {
      return NextResponse.json(
        { error: `Could not find location: ${parsed.location}. Please try a different location format.` },
        { status: 400 }
      );
    }

    const hospitals = hospitalsData as any[];
    const results: SearchResult[] = [];
    const insurances = insurancesData as Insurance[];

    // Process hospitals - check if they offer all requested procedures
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
      if (distance > parsed.maxDistance) {
        continue;
      }

      // Check if in network (only if not explicitly no insurance)
      const inNetworkInsurances = hospital.in_network_insurances || hospital.inNetworkInsurances || [];
      const inNetwork = (!parsed.explicitlyNoInsurance && insurance)
        ? inNetworkInsurances.includes(insurance)
        : false;

      // Process each procedure and calculate totals
      const procedurePrices: ProcedurePrice[] = [];
      let totalPriceWithInsurance: number | null = null;
      let totalPriceWithoutInsurance = 0;
      let selectedPlan: InsurancePlan | undefined = undefined;
      let hospitalHasAllProcedures = true;

      for (const procedure of parsed.procedures) {
        // Check if hospital offers this procedure
        const procedureData = findProcedureInHospital(hospital, procedure);
        if (!procedureData) {
          hospitalHasAllProcedures = false;
          break; // Hospital doesn't offer all procedures
        }

        const procInfo = proceduresData.find(p => p.id === procedure);
        const procName = procInfo?.name || procedure;

        // Get prices for this procedure
        let procPriceWithInsurance: number | null = null;
        
        // If user explicitly said no insurance, always set priceWithInsurance to null
        if (parsed.explicitlyNoInsurance) {
          procPriceWithInsurance = null;
        } else if (insurance && inNetwork) {
          // Only calculate insurance prices if not explicitly no insurance
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
          procedureId: procedure,
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
        procedures: parsed.procedures.length > 1 ? procedurePrices : undefined,
        totalPriceWithInsurance: totalPriceWithInsurance,
        totalPriceWithoutInsurance: totalPriceWithoutInsurance,
      });
    }

    // Sort by cash price (lowest first) if explicitly no insurance, otherwise by distance
    if (parsed.explicitlyNoInsurance) {
      results.sort((a, b) => a.priceWithoutInsurance - b.priceWithoutInsurance);
    } else {
      results.sort((a, b) => a.distance - b.distance);
    }

    // Extract zip code for response
    const zipMatch = parsed.location.match(/^\d{5}$/);
    const zipCode = zipMatch ? zipMatch[0] : '';

    return NextResponse.json({
      results,
      parsedData: {
        procedures: parsed.procedures,
        insurance: parsed.explicitlyNoInsurance ? '' : (insurance || parsed.insurance),
        insurancePlan: parsed.explicitlyNoInsurance ? undefined : (insurancePlan || parsed.insurancePlan),
        location: parsed.location,
        maxDistance: parsed.maxDistance,
        zipCode,
        cashOnly: parsed.explicitlyNoInsurance,
      },
      aiQuery,
    });
  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

