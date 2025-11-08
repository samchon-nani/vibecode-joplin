# EPIC Integration Documentation

## Overview

BillHarmony seamlessly integrates with EPIC MyChart, providing patients with financial navigation tools directly within their patient portal. This integration enables a unified experience where patients can manage both their health records and financial planning in one place.

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Technical Architecture](#technical-architecture)
3. [API Specifications](#api-specifications)
4. [Security and Compliance](#security-and-compliance)
5. [Implementation Timeline](#implementation-timeline)
6. [Support Resources](#support-resources)

## Integration Overview

### Purpose

The EPIC integration allows BillHarmony to:
- Access patient procedure information from EPIC MyChart
- Retrieve insurance details automatically
- Display financial navigation tools within the MyChart interface
- Save financial assistance results back to patient records
- Provide proactive notifications about financial assistance opportunities

### Benefits

- **Unified Experience**: Patients access financial tools without leaving MyChart
- **Time Savings**: Automatic data population eliminates manual entry
- **Enhanced Security**: Leverages EPIC's robust authentication systems
- **Mobile Access**: Available through MyChart mobile app
- **Integrated Records**: Financial assistance information stored alongside medical records

## Technical Architecture

### Integration Method

BillHarmony integrates with EPIC through the **EPIC App Orchard**, which provides:
- Standardized integration framework
- OAuth 2.0 authentication
- FHIR R4 API access
- Secure data exchange protocols

### Authentication

**Method**: OAuth 2.0 with EPIC MyChart

**Flow**:
1. Patient logs into EPIC MyChart
2. Patient navigates to BillHarmony section
3. EPIC redirects to BillHarmony with authorization code
4. BillHarmony exchanges code for access token
5. BillHarmony uses access token for API calls

**Security**:
- All tokens encrypted in transit (TLS 1.3)
- Tokens stored securely with encryption at rest
- Token refresh mechanism for long sessions
- Automatic token expiration and renewal

### Data Exchange

**Protocol**: FHIR R4 API

**Data Retrieved**:
- Patient demographics
- Scheduled procedures
- Insurance information
- Appointment details
- Medical record numbers

**Data Sent**:
- Financial assistance eligibility results
- Price comparison results
- Payment plan recommendations
- Financial navigation history

## API Specifications

### Endpoints

#### Get Patient Information
```
GET /fhir/Patient/{patientId}
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "resourceType": "Patient",
  "id": "patient-id",
  "name": [{
    "family": "Doe",
    "given": ["John"]
  }],
  "birthDate": "1980-01-01",
  "address": [{
    "line": ["123 Main St"],
    "city": "Beverly Hills",
    "state": "CA",
    "postalCode": "90210"
  }]
}
```

#### Get Scheduled Procedures
```
GET /fhir/Procedure?patient={patientId}&status=planned
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "resourceType": "Bundle",
  "entry": [{
    "resource": {
      "resourceType": "Procedure",
      "code": {
        "coding": [{
          "system": "CPT",
          "code": "70551",
          "display": "MRI Brain"
        }]
      },
      "status": "planned",
      "performedDateTime": "2024-12-15"
    }
  }]
}
```

#### Get Insurance Coverage
```
GET /fhir/Coverage?beneficiary={patientId}
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "resourceType": "Bundle",
  "entry": [{
    "resource": {
      "resourceType": "Coverage",
      "status": "active",
      "payor": [{
        "display": "BlueCross BlueShield"
      }],
      "type": {
        "coding": [{
          "code": "PPO",
          "display": "Preferred Provider Organization"
        }]
      }
    }
  }]
}
```

#### Save Financial Assistance Results
```
POST /fhir/Observation
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://billharmony.com/codes",
      "code": "financial-assistance",
      "display": "Financial Assistance Eligibility"
    }]
  },
  "subject": {
    "reference": "Patient/{patientId}"
  },
  "valueString": "Eligible for Hospital Financial Assistance Program",
  "component": [{
    "code": {
      "coding": [{
        "code": "eligibility-score",
        "display": "Eligibility Score"
      }]
    },
    "valueInteger": 85
  }]
}
```

## Security and Compliance

### HIPAA Compliance

- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest
- Access logs maintained for audit purposes
- Business Associate Agreement (BAA) with EPIC
- Regular security audits and penetration testing

### CMS Compliance

- Price transparency data provided in machine-readable format
- Standard charges available via API
- Compliance with Hospital Price Transparency Rule

### Data Privacy

- Patient data only accessed with explicit consent
- Data minimization principles applied
- Right to access and deletion supported
- Regular privacy impact assessments

## Implementation Timeline

### Phase 1: Setup (Weeks 1-2)
- EPIC App Orchard application submission
- OAuth 2.0 configuration
- Development environment setup
- Security review and approval

### Phase 2: Development (Weeks 3-6)
- FHIR API integration
- Authentication flow implementation
- Data synchronization logic
- UI/UX integration with MyChart

### Phase 3: Testing (Weeks 7-8)
- Unit testing
- Integration testing
- User acceptance testing
- Security testing

### Phase 4: Deployment (Weeks 9-10)
- Staging environment deployment
- Production deployment
- User training and documentation
- Go-live support

## Support Resources

### Technical Support

**Email**: support@billharmony.com
**Phone**: 1-800-BILL-HARMONY
**Hours**: Monday-Friday, 8 AM - 6 PM EST

### Documentation

- [EPIC App Orchard Documentation](https://apporchard.epic.com/)
- [FHIR R4 API Guide](https://www.hl7.org/fhir/R4/)
- [BillHarmony API Documentation](/docs/API.md)

### Training Resources

- Integration setup guide
- User training materials
- Video tutorials
- FAQ and troubleshooting guide

## Frequently Asked Questions

### Q: How do patients access BillHarmony through EPIC?
A: Patients log into EPIC MyChart and navigate to the BillHarmony section in the main menu.

### Q: What data does BillHarmony access from EPIC?
A: BillHarmony only accesses procedure information, insurance details, and basic demographics necessary for financial navigation. All access is logged and audited.

### Q: Is the integration secure?
A: Yes, the integration uses OAuth 2.0 authentication, TLS 1.3 encryption, and complies with HIPAA and CMS regulations.

### Q: Can patients opt out of the integration?
A: Yes, patients can disable BillHarmony access through their MyChart privacy settings at any time.

### Q: How often is data synchronized?
A: Data is synchronized in real-time when patients access BillHarmony, ensuring the most up-to-date information.

## Contact

For questions about EPIC integration, please contact:
- **Integration Team**: integrations@billharmony.com
- **Technical Support**: support@billharmony.com
- **Sales**: sales@billharmony.com

---

**Last Updated**: December 2024
**Version**: 1.0.0

