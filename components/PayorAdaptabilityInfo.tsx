'use client';

import { Insurance } from '@/lib/types';
import insurancesData from '@/data/insurances.json';

interface PayorAdaptabilityInfoProps {
  insuranceType?: string;
}

export default function PayorAdaptabilityInfo({ insuranceType }: PayorAdaptabilityInfoProps) {
  const selectedInsurance = insuranceType 
    ? insurancesData.find((ins: Insurance) => ins.id === insuranceType)
    : null;

  return (
    <div className="payor-adaptability">
      <div className="adaptability-header">
        <h3>💼 Works with All Major Insurance Providers</h3>
        <p className="adaptability-subtitle">
          BillHarmony adapts to your insurance plan to show you accurate, personalized pricing
        </p>
      </div>

      {selectedInsurance ? (
        <div className="selected-insurance-info">
          <div className="insurance-badge">
            <span className="badge-icon">✓</span>
            <span>Selected: {selectedInsurance.name} ({selectedInsurance.type})</span>
          </div>
          <div className="insurance-benefits">
            <h4>Your Insurance Benefits</h4>
            <p>
              BillHarmony automatically calculates prices based on your {selectedInsurance.name} plan.
              Prices shown include your deductible, copay, and coinsurance where applicable.
            </p>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-label">Network Status:</span>
                <span className="benefit-value">In-Network & Out-of-Network</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">Price Calculation:</span>
                <span className="benefit-value">Automatic</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-label">Plan Type:</span>
                <span className="benefit-value">{selectedInsurance.type}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-insurance-selected">
          <p>
            <strong>No insurance selected?</strong> No problem! BillHarmony shows you prices for all options.
            Select your insurance provider to see personalized pricing with your benefits applied.
          </p>
        </div>
      )}

      <div className="adaptability-features">
        <h4>How BillHarmony Adapts to Your Insurance</h4>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h5>Real-Time Price Updates</h5>
            <p>Prices automatically adjust based on your selected insurance provider</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h5>Cost Breakdown</h5>
            <p>See detailed breakdowns of deductible, copay, and coinsurance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h5>Network Status</h5>
            <p>Clear indicators of in-network vs. out-of-network facilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h5>Savings Calculation</h5>
            <p>See exactly how much you save with insurance vs. cash payment</p>
          </div>
        </div>
      </div>

      <div className="insurance-types">
        <h4>Supported Insurance Types</h4>
        <div className="types-list">
          <div className="type-badge">PPO</div>
          <div className="type-badge">HMO</div>
          <div className="type-badge">EPO</div>
          <div className="type-badge">POS</div>
          <div className="type-badge">Medicare</div>
          <div className="type-badge">Medicaid</div>
        </div>
        <p className="types-note">
          BillHarmony works with all major insurance providers including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, Humana, and more.
        </p>
      </div>

      <div className="educational-content">
        <h4>💡 Understanding Your Insurance</h4>
        <div className="education-grid">
          <div className="education-item">
            <strong>In-Network:</strong> Hospitals that have agreements with your insurance. Lower costs and better coverage.
          </div>
          <div className="education-item">
            <strong>Out-of-Network:</strong> Hospitals without agreements. Higher costs, may not be covered.
          </div>
          <div className="education-item">
            <strong>Deductible:</strong> Amount you pay before insurance starts covering costs.
          </div>
          <div className="education-item">
            <strong>Copay:</strong> Fixed amount you pay for a service (e.g., $20 for a visit).
          </div>
          <div className="education-item">
            <strong>Coinsurance:</strong> Percentage of costs you pay after meeting your deductible.
          </div>
          <div className="education-item">
            <strong>Out-of-Pocket Max:</strong> Maximum amount you'll pay in a year. After this, insurance covers 100%.
          </div>
        </div>
      </div>

      <style jsx>{`
        .payor-adaptability {
          padding: 0;
        }

        .adaptability-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .adaptability-header h3 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .adaptability-subtitle {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
        }

        .selected-insurance-info {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border: 2px solid #2196f3;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .insurance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #2196f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .badge-icon {
          font-size: 1.2rem;
        }

        .insurance-benefits h4 {
          margin: 1rem 0 0.5rem 0;
          color: #1976d2;
        }

        .insurance-benefits p {
          color: #333;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .benefit-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .benefit-label {
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }

        .benefit-value {
          color: #1976d2;
          font-weight: 600;
        }

        .no-insurance-selected {
          background: #fff3e0;
          border: 2px solid #ff9800;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .no-insurance-selected p {
          color: #333;
          line-height: 1.6;
          margin: 0;
        }

        .adaptability-features {
          margin-bottom: 2rem;
        }

        .adaptability-features h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .feature-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .feature-card h5 {
          margin: 0.5rem 0;
          color: #333;
          font-size: 1rem;
        }

        .feature-card p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .insurance-types {
          margin-bottom: 2rem;
        }

        .insurance-types h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .types-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .type-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .types-note {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .educational-content {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .educational-content h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .education-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .education-item {
          background: white;
          border-left: 4px solid #667eea;
          padding: 1rem;
          border-radius: 4px;
          color: #333;
          line-height: 1.6;
        }

        .education-item strong {
          color: #667eea;
        }

        @media (max-width: 768px) {
          .features-grid,
          .education-grid {
            grid-template-columns: 1fr;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

