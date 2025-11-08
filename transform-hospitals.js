// Script to transform hospitals.json to CSV-like structure
const fs = require('fs');
const path = require('path');

// Procedure mapping
const procedureMap = {
  'MRI': {
    description: 'MRI Scan - Brain without contrast',
    code: '70551',
    type: 'CPT'
  },
  'CT Scan': {
    description: 'CT Scan - Chest without contrast',
    code: '71250',
    type: 'CPT'
  },
  'X-Ray': {
    description: 'X-Ray - Chest, 2 views',
    code: '71046',
    type: 'CPT'
  },
  'Blood Test': {
    description: 'Complete Blood Count (CBC) with differential',
    code: '85025',
    type: 'CPT'
  },
  'Ultrasound': {
    description: 'Ultrasound - Abdomen complete',
    code: '76700',
    type: 'CPT'
  }
};

// Insurance ID to payer name mapping
const insuranceMap = {
  'bluecross': 'Blue Cross Blue Shield',
  'aetna': 'Aetna',
  'cigna': 'Cigna',
  'unitedhealthcare': 'UnitedHealthcare',
  'humana': 'Humana',
  'kaiser': 'Kaiser Permanente'
};

// Insurance ID to plan name mapping (default plans)
const insurancePlanMap = {
  'bluecross': 'PPO',
  'aetna': 'Standard',
  'cigna': 'PPO',
  'unitedhealthcare': 'Choice Plus',
  'humana': 'HMO',
  'kaiser': 'HMO'
};

// Read the current hospitals.json
const hospitalsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hospitals.json'), 'utf8'));

// Transform each hospital
const transformedHospitals = hospitalsData.map(hospital => {
  const standardChargeInformation = [];
  
  // Process each procedure
  Object.entries(hospital.procedures).forEach(([procedureName, procedureData]) => {
    const procedureInfo = procedureMap[procedureName];
    if (!procedureInfo) return;
    
    // Get all payer-specific charges
    const payerCharges = [];
    const charges = [];
    
    // Add payer-specific charges
    Object.entries(procedureData.withInsurance).forEach(([insuranceId, price]) => {
      const payerName = insuranceMap[insuranceId];
      const planName = insurancePlanMap[insuranceId];
      
      if (payerName) {
        payerCharges.push({
          payer_name: payerName,
          plan_name: planName,
          standard_charge: price,
          standard_charge_methodology: 'fee schedule',
          estimated_allowed_amount: price
        });
        charges.push(price);
      }
    });
    
    // Calculate min/max negotiated charges
    const minNegotiated = charges.length > 0 ? Math.min(...charges) : procedureData.withoutInsurance;
    const maxNegotiated = charges.length > 0 ? Math.max(...charges) : procedureData.withoutInsurance;
    
    // Create standard charge information entry
    standardChargeInformation.push({
      description: procedureInfo.description,
      code_information: [{
        code: procedureInfo.code,
        type: procedureInfo.type
      }],
      setting: 'outpatient',
      modifiers: [],
      drug_unit_of_measurement: '',
      drug_type_of_measurement: '',
      standard_charges: {
        gross_charge: procedureData.withoutInsurance,
        discounted_cash_price: procedureData.withoutInsurance,
        de_identified_minimum_negotiated_charge: minNegotiated,
        de_identified_maximum_negotiated_charge: maxNegotiated,
        payer_specific_negotiated_charges: payerCharges
      }
    });
  });
  
  // Build full address string
  const fullAddress = `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state} ${hospital.address.zip}`;
  
  // Generate EIN (using hospital ID as part of it)
  const ein = `95-${String(hospital.id).padStart(6, '0')}`;
  
  // Return transformed hospital
  return {
    hospital_id: hospital.id,
    hospital_name: hospital.name,
    hospital_location: 'Main Campus',
    hospital_address: fullAddress,
    hospital_ein: ein,
    last_updated_on: new Date().toISOString().split('T')[0],
    version: '2.0.0',
    phone: hospital.phone,
    coordinates: hospital.coordinates,
    in_network_insurances: hospital.inNetworkInsurances,
    affirmation: {
      affirmation: 'To the best of its knowledge and belief, the hospital has included all applicable standard charge information in accordance with the requirements of 45 CFR 180.50, and the information encoded is accurate as of the date indicated.',
      confirm_affirmation: true
    },
    standard_charge_information: standardChargeInformation
  };
});

// Write transformed data
fs.writeFileSync(
  path.join(__dirname, 'data', 'hospitals.json'),
  JSON.stringify(transformedHospitals, null, 2),
  'utf8'
);

console.log('Transformation complete!');

