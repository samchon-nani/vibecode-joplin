export interface Hospital {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  inNetworkInsurances: string[];
  procedures: {
    [procedureName: string]: {
      withInsurance: {
        [insuranceId: string]: number;
      };
      withoutInsurance: number;
    };
  };
}

export interface InsurancePlan {
  id: string;
  name: string;
  description?: string;
  benefits: {
    deductible: number;
    copay: number;
    coinsurance: number; // percentage (e.g., 20 means 20%)
    outOfPocketMax: number;
  };
  networkType: 'in-network' | 'out-of-network' | 'both';
}

export interface Insurance {
  id: string;
  name: string;
  type: string;
  plans: InsurancePlan[];
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  code_information?: {
    code: string;
    type: string;
  }[];
}

export interface ProcedurePrice {
  procedureId: string;
  procedureName: string;
  priceWithInsurance: number | null;
  priceWithoutInsurance: number;
}

export interface SearchResult {
  hospital: Hospital;
  distance: number;
  inNetwork: boolean;
  priceWithInsurance: number | null;
  priceWithoutInsurance: number;
  insurancePlan?: InsurancePlan;
  procedures?: ProcedurePrice[]; // Breakdown by procedure for multiple procedures
  totalPriceWithInsurance?: number | null;
  totalPriceWithoutInsurance?: number;
}

export interface CostBreakdown {
  total: number;
  deductible?: number;
  copay?: number;
  coinsurance?: number;
  explanation: string;
  plainLanguage: string;
}

export interface CharityEligibilityRequest {
  householdIncome: number;
  familySize: number;
  employmentStatus: string;
  zipCode: string;
  hospitalId: string;
  procedureCost: number;
}

export interface CharityProgram {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: {
    maxIncome?: number;
    maxIncomePercentOfFPL?: number; // Federal Poverty Level
    familySize?: number;
    employmentStatus?: string[];
  };
  coverageAmount: number | 'full';
  coverageType: 'percentage' | 'fixed' | 'full';
}

export interface CharityEligibilityResult {
  eligibilityScore: number; // 0-100
  qualifiedPrograms: CharityProgram[];
  estimatedAssistance: number;
  reasoning: string; // AI explanation
  recommendedProgram?: CharityProgram;
}

export interface PaymentPlan {
  id: string;
  name: string;
  durationMonths: number;
  monthlyPayment: number;
  totalCost: number;
  interestRate?: number;
  description: string;
}

export interface FinancialAssistanceProgram {
  id: string;
  name: string;
  type: 'charity' | 'medicaid' | 'state' | 'federal' | 'hospital';
  description: string;
  eligibilityCriteria: string;
  coverageAmount: number | 'full';
  applicationProcess: string;
}

export interface PayorAdaptabilityInfo {
  insuranceType: string;
  networkStatus: 'in-network' | 'out-of-network';
  benefits: {
    deductible: number;
    copay: number;
    coinsurance: number;
    outOfPocketMax: number;
  };
  adaptabilityFeatures: string[];
}

export interface CommunicationPreferences {
  preferredMethod: 'email' | 'sms' | 'phone' | 'in-app';
  frequency: 'realtime' | 'daily' | 'weekly';
  notificationTypes: {
    newAssistancePrograms: boolean;
    paymentReminders: boolean;
    billUpdates: boolean;
    eligibilityChanges: boolean;
    paymentPlanReminders: boolean;
  };
  smartAlerts: boolean;
  quietHours: { start: string; end: string };
  priorityLevel: 'high' | 'medium' | 'low';
}

export interface AITransparencyBreakdown {
  factorsConsidered: {
    factor: string;
    value: any;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  calculationSteps: {
    step: number;
    description: string;
    result: any;
  }[];
  confidenceScore: number;
  limitations: string[];
}

export interface UserProfile {
  insurance?: string;
  insurancePlan?: string;
  zipCode?: string;
  city?: string;
  state?: string;
}

