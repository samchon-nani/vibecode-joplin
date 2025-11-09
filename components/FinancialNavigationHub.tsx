'use client';

import { useState } from 'react';
import { SearchResult } from '@/lib/types';
import { generatePlainLanguageCost } from '@/lib/utils';
import ResultsList from './ResultsList';
import PayorAdaptabilityInfo from './PayorAdaptabilityInfo';

interface FinancialNavigationHubProps {
  results: SearchResult[];
  insuranceType?: string;
  zipCode?: string;
  cashOnly?: boolean;
}

type TabType = 'prices' | 'assistance' | 'payment-plans' | 'insurance';

export default function FinancialNavigationHub({
  results,
  insuranceType,
  zipCode,
  cashOnly = false,
}: FinancialNavigationHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('prices');

  // Calculate best option recommendation using the same cost calculation as the grid
  const bestOption = results.length > 0
    ? results.reduce((best, current) => {
        // Calculate actual out-of-pocket cost for best option
        const bestCostWithInsurance = best.priceWithInsurance !== null
          ? generatePlainLanguageCost(best.priceWithInsurance, insuranceType, true, best.priceWithoutInsurance, best.insurancePlan)
          : null;
        const bestCostWithoutInsurance = generatePlainLanguageCost(best.priceWithoutInsurance, undefined, false);
        const bestPrice = bestCostWithInsurance?.total || bestCostWithoutInsurance.total;
        
        // Calculate actual out-of-pocket cost for current option
        const currentCostWithInsurance = current.priceWithInsurance !== null
          ? generatePlainLanguageCost(current.priceWithInsurance, insuranceType, true, current.priceWithoutInsurance, current.insurancePlan)
          : null;
        const currentCostWithoutInsurance = generatePlainLanguageCost(current.priceWithoutInsurance, undefined, false);
        const currentPrice = currentCostWithInsurance?.total || currentCostWithoutInsurance.total;
        
        return currentPrice < bestPrice ? current : best;
      })
    : null;

  return (
    <div className="hub-container">
      <div className="hub-header">
        <h2>Financial Navigation Hub</h2>
        <p className="hub-subtitle">
          Compare all your options: prices, assistance programs, and payment plans
        </p>
      </div>

      {bestOption && (() => {
        // Calculate the same cost breakdown as shown in the grid
        const bestCostWithInsurance = bestOption.priceWithInsurance !== null
          ? generatePlainLanguageCost(bestOption.priceWithInsurance, insuranceType, true, bestOption.priceWithoutInsurance, bestOption.insurancePlan)
          : null;
        const bestCostWithoutInsurance = generatePlainLanguageCost(bestOption.priceWithoutInsurance, undefined, false);
        const bestDisplayPrice = bestCostWithInsurance?.total || bestCostWithoutInsurance.total;
        
        return (
          <div className="recommendation-banner">
            <div className="recommendation-icon">🎯</div>
            <div className="recommendation-content">
              <h3>Your Best Option</h3>
              <p>
                <strong>{bestOption.hospital.name}</strong> - 
                ${bestDisplayPrice.toLocaleString()}
                {bestOption.priceWithInsurance && ' (with insurance)'}
              </p>
              <p className="recommendation-hint">
                Based on your search criteria, this hospital offers the best price.
              </p>
            </div>
          </div>
        );
      })()}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          💰 Price Comparison
        </button>
        <button
          className={`tab ${activeTab === 'assistance' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistance')}
        >
          🤝 Financial Assistance
        </button>
        <button
          className={`tab ${activeTab === 'payment-plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-plans')}
        >
          📅 Payment Plans
        </button>
        <button
          className={`tab ${activeTab === 'insurance' ? 'active' : ''}`}
          onClick={() => setActiveTab('insurance')}
        >
          💼 Insurance Info
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'prices' && (
          <div className="tab-panel">
            <ResultsList 
              results={results} 
              insuranceType={insuranceType}
              zipCode={zipCode}
              cashOnly={cashOnly}
            />
          </div>
        )}

        {activeTab === 'assistance' && (
          <div className="tab-panel">
            <div className="assistance-programs">
              <h3>Available Financial Assistance Programs</h3>
              <p className="section-description">
                Check charity eligibility for each hospital using the "Check Charity Eligibility" button on each hospital card.
              </p>
              
              <div className="programs-grid">
                <div className="program-card">
                  <div className="program-icon">🏥</div>
                  <h4>Hospital Financial Assistance</h4>
                  <p>Hospital-based charity care programs for low-income patients. Eligibility based on income and family size.</p>
                  <div className="program-details">
                    <span className="detail-label">Coverage:</span>
                    <span className="detail-value">Up to 100%</span>
                  </div>
                </div>

                <div className="program-card">
                  <div className="program-icon">🏛️</div>
                  <h4>Medicaid Expansion</h4>
                  <p>State Medicaid expansion programs for low-income individuals and families. Available in most states.</p>
                  <div className="program-details">
                    <span className="detail-label">Coverage:</span>
                    <span className="detail-value">Full Coverage</span>
                  </div>
                </div>

                <div className="program-card">
                  <div className="program-icon">📊</div>
                  <h4>Sliding Scale Discount</h4>
                  <p>Income-based discount programs that reduce costs based on your household income level.</p>
                  <div className="program-details">
                    <span className="detail-label">Coverage:</span>
                    <span className="detail-value">30-75%</span>
                  </div>
                </div>

                <div className="program-card">
                  <div className="program-icon">💼</div>
                  <h4>Unemployment Assistance</h4>
                  <p>Special assistance programs for unemployed individuals. Additional support during job transitions.</p>
                  <div className="program-details">
                    <span className="detail-label">Coverage:</span>
                    <span className="detail-value">Up to 75%</span>
                  </div>
                </div>
              </div>

              <div className="assistance-info">
                <h4>💡 How to Apply</h4>
                <ol>
                  <li>Click "Check Charity Eligibility" on any hospital card</li>
                  <li>Enter your household income and family size</li>
                  <li>Our AI will analyze your eligibility for all programs</li>
                  <li>Review your qualified programs and estimated assistance</li>
                  <li>Contact the hospital to complete your application</li>
                </ol>
              </div>

              <div className="proactive-communication-note">
                <h4>📧 Proactive Communication</h4>
                <p>
                  We'll proactively notify you via email or SMS when new financial assistance programs become available, 
                  payment reminders are due, or your eligibility status changes. You'll receive tailored options and 
                  guidance to help you navigate your healthcare financial journey.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment-plans' && (
          <div className="tab-panel">
            <div className="payment-plans">
              <h3>Payment Plan Options</h3>
              <div className="payment-disclaimer">
                <strong>⚠️ Estimated Prices Only:</strong> Payment plan calculations are based on estimated prices. 
                Actual costs may vary. Always confirm pricing with the hospital before committing to a payment plan.
              </div>
              <p className="section-description">
                Many hospitals offer payment plans to help you manage medical costs over time.
              </p>

              <div className="plans-grid">
                {results.map((result) => {
                  const totalCost = result.priceWithInsurance || result.priceWithoutInsurance;
                  const monthly12 = Math.round(totalCost / 12);
                  const monthly24 = Math.round(totalCost / 24);
                  
                  return (
                    <div key={result.hospital.id} className="plan-card">
                      <h4>{result.hospital.name}</h4>
                      <div className="plan-options">
                        <div className="plan-option">
                          <div className="plan-duration">12 Months</div>
                          <div className="plan-payment">${monthly12.toLocaleString()}/month</div>
                          <div className="plan-total">Total: ${totalCost.toLocaleString()}</div>
                        </div>
                        <div className="plan-option">
                          <div className="plan-duration">24 Months</div>
                          <div className="plan-payment">${monthly24.toLocaleString()}/month</div>
                          <div className="plan-total">Total: ${totalCost.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="plan-contact">
                        <p>📞 Contact: {result.hospital.phone}</p>
                        <p>📍 {result.hospital.address.city}, {result.hospital.address.state}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="payment-info">
                <h4>💡 Payment Plan Details</h4>
                <ul>
                  <li>Most hospitals offer interest-free payment plans</li>
                  <li>Plans typically range from 6-24 months</li>
                  <li>No credit check required for most plans</li>
                  <li>Contact the hospital's billing department to set up a plan</li>
                  <li>You can often negotiate the payment amount and duration</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="tab-panel">
            <PayorAdaptabilityInfo insuranceType={insuranceType} />
          </div>
        )}
      </div>

      <style jsx>{`
        .hub-container {
          margin-top: 2rem;
        }

        .hub-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .hub-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .hub-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .recommendation-banner {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 2px solid #4caf50;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .recommendation-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .recommendation-content h3 {
          margin: 0 0 0.5rem 0;
          color: #2e7d32;
          font-size: 1.25rem;
        }

        .recommendation-content p {
          margin: 0.25rem 0;
          color: #333;
        }

        .recommendation-hint {
          font-size: 0.9rem;
          color: #666;
          font-style: italic;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .tab {
          flex: 1;
          padding: 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0.7;
        }

        .tab:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab.active {
          background: white;
          color: #667eea;
          opacity: 1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .tab-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .tab-panel {
          min-height: 400px;
        }

        .payment-disclaimer {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 0.875rem 1rem;
          margin-bottom: 1rem;
          color: #856404;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .payment-disclaimer strong {
          font-weight: 700;
          color: #856404;
        }

        .section-description {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .program-card {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .program-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .program-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .program-card h4 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .program-card p {
          margin: 0 0 1rem 0;
          color: #666;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .program-details {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          font-weight: 700;
          color: #4caf50;
        }

        .assistance-info {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .assistance-info h4 {
          margin: 0 0 1rem 0;
          color: #1976d2;
        }

        .assistance-info ol {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
          line-height: 2;
        }

        .proactive-communication-note {
          background: #f3e5f5;
          border-left: 4px solid #9c27b0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .proactive-communication-note h4 {
          margin: 0 0 0.75rem 0;
          color: #7b1fa2;
          font-size: 1.1rem;
        }

        .proactive-communication-note p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .plan-card {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .plan-card h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .plan-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .plan-option {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .plan-duration {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .plan-payment {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.25rem;
        }

        .plan-total {
          font-size: 0.85rem;
          color: #999;
        }

        .plan-contact {
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
          font-size: 0.9rem;
          color: #666;
        }

        .plan-contact p {
          margin: 0.25rem 0;
        }

        .payment-info {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .payment-info h4 {
          margin: 0 0 1rem 0;
          color: #e65100;
        }

        .payment-info ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
          line-height: 2;
        }

        @media (max-width: 768px) {
          .tabs {
            flex-direction: column;
          }

          .tab {
            width: 100%;
          }

          .programs-grid,
          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

