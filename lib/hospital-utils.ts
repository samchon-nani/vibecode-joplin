import proceduresData from '@/data/procedures.json';
import { Procedure } from './types';

// Map procedure IDs to CPT codes
const procedureToCodeMap: Record<string, string> = {
  'MRI': '70551',
  'CT Scan': '71250',
  'X-Ray': '71046',
  'Blood Test': '85025',
  'Ultrasound': '76700',
};

// Map CPT codes to procedure IDs
const codeToProcedureMap: Record<string, string> = {
  '70551': 'MRI',
  '71250': 'CT Scan',
  '71046': 'X-Ray',
  '85025': 'Blood Test',
  '76700': 'Ultrasound',
};

// Map insurance IDs to payer names
const insuranceToPayerMap: Record<string, string> = {
  'bluecross': 'Blue Cross Blue Shield',
  'aetna': 'Aetna',
  'cigna': 'Cigna',
  'unitedhealthcare': 'UnitedHealthcare',
  'humana': 'Humana',
  'kaiser': 'Kaiser Permanente',
};

// Map insurance IDs to plan names
const insuranceToPlanMap: Record<string, string> = {
  'bluecross': 'PPO',
  'aetna': 'Standard',
  'cigna': 'PPO',
  'unitedhealthcare': 'Choice Plus',
  'humana': 'HMO',
  'kaiser': 'HMO',
};

/**
 * Convert new hospital structure to old format for compatibility
 */
export function convertHospitalToLegacyFormat(hospital: any) {
  const procedures: Record<string, any> = {};
  
  if (hospital.standard_charge_information && Array.isArray(hospital.standard_charge_information)) {
    for (const chargeInfo of hospital.standard_charge_information) {
      // Find the procedure ID by CPT code
      const cptCode = chargeInfo.code_information?.[0]?.code;
      if (cptCode && codeToProcedureMap[cptCode]) {
        const procedureId = codeToProcedureMap[cptCode];
        
        // Build withInsurance object
        const withInsurance: Record<string, number> = {};
        
        if (chargeInfo.standard_charges?.payer_specific_negotiated_charges) {
          for (const payerCharge of chargeInfo.standard_charges.payer_specific_negotiated_charges) {
            // Find insurance ID by payer name
            const insuranceId = Object.keys(insuranceToPayerMap).find(
              id => insuranceToPayerMap[id] === payerCharge.payer_name
            );
            
            if (insuranceId) {
              withInsurance[insuranceId] = payerCharge.standard_charge || payerCharge.estimated_allowed_amount;
            }
          }
        }
        
        procedures[procedureId] = {
          withInsurance,
          withoutInsurance: chargeInfo.standard_charges?.gross_charge || chargeInfo.standard_charges?.discounted_cash_price || 0,
        };
      }
    }
  }
  
  // Convert hospital structure to legacy format
  return {
    id: hospital.hospital_id || hospital.id,
    name: hospital.hospital_name || hospital.name,
    address: hospital.hospital_address ? {
      street: hospital.hospital_address,
      city: '',
      state: '',
      zip: '',
    } : hospital.address,
    coordinates: hospital.coordinates,
    phone: hospital.phone,
    inNetworkInsurances: hospital.in_network_insurances || hospital.inNetworkInsurances || [],
    procedures,
  };
}

/**
 * Find procedure in standard_charge_information by procedure ID or CPT code
 */
export function findProcedureInHospital(hospital: any, procedureId: string) {
  const cptCode = procedureToCodeMap[procedureId];
  
  if (!hospital.standard_charge_information || !Array.isArray(hospital.standard_charge_information)) {
    return null;
  }
  
  // Find by CPT code
  const chargeInfo = hospital.standard_charge_information.find((info: any) => {
    const code = info.code_information?.[0]?.code;
    return code === cptCode || code === procedureId;
  });
  
  if (!chargeInfo) {
    return null;
  }
  
  // Build withInsurance object
  const withInsurance: Record<string, number> = {};
  
  if (chargeInfo.standard_charges?.payer_specific_negotiated_charges) {
    for (const payerCharge of chargeInfo.standard_charges.payer_specific_negotiated_charges) {
      const insuranceId = Object.keys(insuranceToPayerMap).find(
        id => insuranceToPayerMap[id] === payerCharge.payer_name
      );
      
      if (insuranceId) {
        withInsurance[insuranceId] = payerCharge.standard_charge || payerCharge.estimated_allowed_amount;
      }
    }
  }
  
  return {
    withInsurance,
    withoutInsurance: chargeInfo.standard_charges?.gross_charge || chargeInfo.standard_charges?.discounted_cash_price || 0,
    setting: chargeInfo.setting === 'inpatient' ? 'inpatient' : 'outpatient', // Extract setting from hospital data
  };
}

