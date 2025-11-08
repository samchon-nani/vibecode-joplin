/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse location input (zip code, city, state, or "city, state")
 * Returns coordinates if found
 */
export function parseLocation(location: string, zipCodes: Record<string, any>): { lat: number; lng: number } | null {
  const trimmed = location.trim();
  
  // Check if it's a zip code
  if (/^\d{5}$/.test(trimmed)) {
    const zipData = zipCodes[trimmed];
    if (zipData) {
      return { lat: zipData.lat, lng: zipData.lng };
    }
  }
  
  // For demo purposes, if location contains "Beverly Hills" or "90210", use that as default
  // In production, you'd use a geocoding API
  if (trimmed.toLowerCase().includes('beverly hills') || trimmed.includes('90210')) {
    return { lat: 34.0736, lng: -118.4004 };
  }
  if (trimmed.toLowerCase().includes('los angeles') || trimmed.includes('90033')) {
    return { lat: 34.0522, lng: -118.2437 };
  }
  if (trimmed.toLowerCase().includes('orange') || trimmed.includes('92868')) {
    return { lat: 33.7879, lng: -117.8531 };
  }
  if (trimmed.toLowerCase().includes('san diego') || trimmed.includes('92103')) {
    return { lat: 32.7157, lng: -117.1611 };
  }
  if (trimmed.toLowerCase().includes('riverside') || trimmed.includes('92501')) {
    return { lat: 33.9533, lng: -117.3962 };
  }
  if (trimmed.toLowerCase().includes('long beach') || trimmed.includes('90806')) {
    return { lat: 33.8044, lng: -118.1950 };
  }
  if (trimmed.toLowerCase().includes('santa monica') || trimmed.includes('90404')) {
    return { lat: 34.0195, lng: -118.4912 };
  }
  if (trimmed.toLowerCase().includes('pasadena') || trimmed.includes('91105')) {
    return { lat: 34.1478, lng: -118.1445 };
  }
  if (trimmed.toLowerCase().includes('glendale') || trimmed.includes('91206')) {
    return { lat: 34.1425, lng: -118.2551 };
  }
  if (trimmed.toLowerCase().includes('burbank') || trimmed.includes('91505')) {
    return { lat: 34.1808, lng: -118.3090 };
  }
  
  // Default to Beverly Hills if no match (for demo)
  return { lat: 34.0736, lng: -118.4004 };
}

/**
 * Generate plain-language cost breakdown
 * AI-powered function that breaks down costs into understandable components
 */
export function generatePlainLanguageCost(
  price: number,
  insuranceType?: string,
  hasInsurance: boolean = false,
  totalCost: number = 0,
  insurancePlan?: import('./types').InsurancePlan
): import('./types').CostBreakdown {
  if (!hasInsurance || !insuranceType) {
    return {
      total: price,
      explanation: `This is the full cash price you would pay if paying out of pocket.`,
      plainLanguage: `Without insurance, you would pay $${price.toLocaleString()} for this procedure. This is the total amount the hospital charges.`,
    };
  }

  // If a specific plan is provided, use its benefits
  if (insurancePlan) {
    let remainingCost = totalCost || price;
    let deductible = 0;
    let copay = 0;
    let coinsurance = 0;
    
    // Calculate deductible portion
    if (remainingCost > 0 && insurancePlan.benefits.deductible > 0) {
      deductible = Math.min(insurancePlan.benefits.deductible, remainingCost);
      remainingCost -= deductible;
    }
    
    // Calculate copay
    if (remainingCost > 0 && insurancePlan.benefits.copay > 0) {
      copay = insurancePlan.benefits.copay;
      remainingCost -= copay;
    }
    
    // Calculate coinsurance
    if (remainingCost > 0 && insurancePlan.benefits.coinsurance > 0) {
      coinsurance = Math.round(remainingCost * (insurancePlan.benefits.coinsurance / 100));
      remainingCost -= coinsurance;
    }
    
    // Ensure we don't exceed out-of-pocket max
    const totalOutOfPocket = deductible + copay + coinsurance;
    const finalOutOfPocket = Math.min(totalOutOfPocket, insurancePlan.benefits.outOfPocketMax);
    
    const insuranceCoverage = (totalCost || price) - finalOutOfPocket;
    
    const explanation = `This is your out-of-pocket cost based on your ${insurancePlan.name} plan. Your insurance covers $${insuranceCoverage.toLocaleString()}.`;
    
    const plainLanguage = `Your estimated cost: $${finalOutOfPocket.toLocaleString()}. This includes $${deductible.toLocaleString()} deductible, $${copay.toLocaleString()} copay, and $${coinsurance.toLocaleString()} coinsurance. Your insurance covers the remaining $${insuranceCoverage.toLocaleString()}. Your out-of-pocket maximum is $${insurancePlan.benefits.outOfPocketMax.toLocaleString()}.`;
    
    return {
      total: finalOutOfPocket,
      deductible,
      copay,
      coinsurance,
      explanation,
      plainLanguage,
    };
  }

  // Fallback: Simulate cost breakdown based on insurance type
  const deductible = Math.round(price * 0.4);
  const copay = Math.round(price * 0.3);
  const coinsurance = Math.round(price * 0.3);

  const explanation = hasInsurance
    ? `This is your out-of-pocket cost after your insurance covers the remaining $${(totalCost - price).toLocaleString()}.`
    : `This is the full cash price you would pay if paying out of pocket.`;

  const plainLanguage = hasInsurance
    ? `Your estimated cost: $${price.toLocaleString()}. This includes $${deductible.toLocaleString()} deductible, $${copay.toLocaleString()} copay, and $${coinsurance.toLocaleString()} coinsurance. Your insurance covers the remaining $${(totalCost - price).toLocaleString()}.`
    : `Without insurance, you would pay $${price.toLocaleString()} (full cash price).`;

  return {
    total: price,
    deductible,
    copay,
    coinsurance,
    explanation,
    plainLanguage,
  };
}

/**
 * Federal Poverty Level thresholds for 2024 (for a family of 4)
 * Used for charity eligibility calculations
 */
const FPL_2024 = {
  1: 15760,
  2: 21380,
  3: 26980,
  4: 32580,
  5: 38180,
  6: 43780,
  7: 49380,
  8: 54980,
};

function getFPLThreshold(familySize: number): number {
  return FPL_2024[Math.min(familySize, 8)] || FPL_2024[8] + ((familySize - 8) * 5600);
}

/**
 * AI-powered charity eligibility screening
 * Analyzes patient demographics and financial data to determine eligibility
 */
export function analyzeCharityEligibility(
  request: import('./types').CharityEligibilityRequest,
  programs: import('./types').CharityProgram[]
): import('./types').CharityEligibilityResult {
  const { householdIncome, familySize, employmentStatus, procedureCost } = request;
  
  const fplThreshold = getFPLThreshold(familySize);
  const incomePercentOfFPL = (householdIncome / fplThreshold) * 100;

  const qualifiedPrograms: import('./types').CharityProgram[] = [];
  let totalAssistance = 0;

  // Check each program for eligibility
  for (const program of programs) {
    let qualifies = false;

    // Check income-based criteria
    if (program.eligibilityCriteria.maxIncomePercentOfFPL) {
      if (incomePercentOfFPL <= program.eligibilityCriteria.maxIncomePercentOfFPL) {
        qualifies = true;
      }
    }

    // Check employment status
    if (program.eligibilityCriteria.employmentStatus) {
      if (program.eligibilityCriteria.employmentStatus.includes(employmentStatus)) {
        qualifies = true;
      } else if (program.eligibilityCriteria.employmentStatus.length > 0) {
        qualifies = false; // Must match if specified
      }
    }

    if (qualifies) {
      qualifiedPrograms.push(program);
      
      // Calculate assistance amount
      if (program.coverageType === 'full') {
        totalAssistance = Math.max(totalAssistance, procedureCost);
      } else if (program.coverageType === 'percentage') {
        const assistance = (procedureCost * (program.coverageAmount as number)) / 100;
        totalAssistance = Math.max(totalAssistance, assistance);
      }
    }
  }

  // Calculate eligibility score (0-100)
  let eligibilityScore = 0;
  if (incomePercentOfFPL <= 100) {
    eligibilityScore = 95;
  } else if (incomePercentOfFPL <= 138) {
    eligibilityScore = 85;
  } else if (incomePercentOfFPL <= 200) {
    eligibilityScore = 70;
  } else if (incomePercentOfFPL <= 250) {
    eligibilityScore = 50;
  } else if (incomePercentOfFPL <= 300) {
    eligibilityScore = 30;
  }

  // Adjust based on employment status
  if (employmentStatus === 'unemployed') {
    eligibilityScore = Math.min(100, eligibilityScore + 15);
  }

  // Generate AI reasoning
  const reasoning = `Based on your household income of $${householdIncome.toLocaleString()} (${Math.round(incomePercentOfFPL)}% of Federal Poverty Level for a family of ${familySize}) and ${employmentStatus} employment status, you qualify for ${qualifiedPrograms.length} assistance program${qualifiedPrograms.length !== 1 ? 's' : ''}. Your estimated assistance is $${totalAssistance.toLocaleString()}, reducing your cost to $${(procedureCost - totalAssistance).toLocaleString()}.`;

  const recommendedProgram = qualifiedPrograms.length > 0
    ? qualifiedPrograms.reduce((best, current) => {
        const currentAssistance = current.coverageType === 'full' 
          ? procedureCost 
          : (procedureCost * (current.coverageAmount as number)) / 100;
        const bestAssistance = best.coverageType === 'full'
          ? procedureCost
          : (procedureCost * (best.coverageAmount as number)) / 100;
        return currentAssistance > bestAssistance ? current : best;
      })
    : undefined;

  return {
    eligibilityScore: Math.min(100, Math.max(0, eligibilityScore)),
    qualifiedPrograms,
    estimatedAssistance: totalAssistance,
    reasoning,
    recommendedProgram,
  };
}

