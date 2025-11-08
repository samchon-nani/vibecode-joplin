'use client';

import { useState } from 'react';
import { SearchResult } from '@/lib/types';
import { generatePlainLanguageCost } from '@/lib/utils';
import CharityEligibilityModal from './CharityEligibilityModal';

interface HospitalCardProps {
  result: SearchResult;
  rank: number;
  insuranceType?: string;
  zipCode?: string;
  cashOnly?: boolean;
}

export default function HospitalCard({ result, rank, insuranceType, zipCode, cashOnly = false }: HospitalCardProps) {
  const { hospital, distance, inNetwork, priceWithInsurance, priceWithoutInsurance, insurancePlan } = result;
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState<string | null>(null);

  // Generate plain language cost breakdowns
  const costWithInsurance = priceWithInsurance !== null
    ? generatePlainLanguageCost(priceWithInsurance, insuranceType, true, priceWithoutInsurance, insurancePlan)
    : null;
  const costWithoutInsurance = generatePlainLanguageCost(priceWithoutInsurance, undefined, false);

  return (
    <div className="hospital-card">
      <div className="card-header">
        <div className="rank-badge">#{rank}</div>
        <h3>{hospital.name}</h3>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">📍 Distance:</span>
          <span className="value">{distance} miles</span>
        </div>

        <div className="info-row">
          <span className="label">📍 Address:</span>
          <span className="value">
            {hospital.address.street}, {hospital.address.city}, {hospital.address.state} {hospital.address.zip}
          </span>
        </div>

        <div className="info-row">
          <span className="label">📞 Phone:</span>
          <span className="value">{hospital.phone}</span>
        </div>

        {!cashOnly && (
          <div className={`network-status ${inNetwork ? 'in-network' : 'out-of-network'}`}>
            {inNetwork ? (
              <>
                <span className="status-icon">✓</span>
                <span>In-Network</span>
              </>
            ) : (
              <>
                <span className="status-icon">✗</span>
                <span>Out-of-Network</span>
              </>
            )}
          </div>
        )}

        <div className="pricing">
          {!cashOnly && (
            <>
              {costWithInsurance ? (
                <div className="price-section">
                  <div className="price-label">
                    With Insurance:
                    <button
                      type="button"
                      className="price-info-icon"
                      onMouseEnter={() => setShowPriceTooltip('with-insurance')}
                      onMouseLeave={() => setShowPriceTooltip(null)}
                      onClick={() => setShowPriceTooltip(showPriceTooltip === 'with-insurance' ? null : 'with-insurance')}
                      aria-label="Price estimate information"
                    >
                      ℹ️
                    </button>
                    {showPriceTooltip === 'with-insurance' && (
                      <div className="price-tooltip">
                        <div className="tooltip-content">
                          <strong>Estimated Price Only</strong>
                          <p>This is an estimated out-of-pocket cost based on your insurance plan benefits. Actual charges may vary based on:</p>
                          <ul>
                            <li>Your current deductible status</li>
                            <li>Medical necessity determination</li>
                            <li>Hospital-specific policies</li>
                            <li>Additional services or complications</li>
                          </ul>
                          <p><strong>Always confirm actual costs with the hospital before receiving services.</strong></p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="price-value insurance-price">
                    ${costWithInsurance.total.toLocaleString()}
                  </div>
                  <div className="cost-breakdown">
                    {costWithInsurance.deductible && costWithInsurance.deductible > 0 && (
                      <div className="breakdown-item">
                        <span>Deductible:</span>
                        <span>${Math.round(costWithInsurance.deductible).toLocaleString()}</span>
                      </div>
                    )}
                    {costWithInsurance.copay && costWithInsurance.copay > 0 && (
                      <div className="breakdown-item">
                        <span>Copay:</span>
                        <span>${Math.round(costWithInsurance.copay).toLocaleString()}</span>
                      </div>
                    )}
                    {costWithInsurance.coinsurance && costWithInsurance.coinsurance > 0 && (
                      <div className="breakdown-item">
                        <span>Coinsurance:</span>
                        <span>${Math.round(costWithInsurance.coinsurance).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="plain-language">
                    💡 {costWithInsurance.explanation}
                  </div>
                </div>
              ) : (
                <div className="price-section">
                  <div className="price-label">With Insurance:</div>
                  <div className="price-value unavailable">N/A (Out of Network)</div>
                </div>
              )}
            </>
          )}

          <div className="price-section">
            <div className="price-label">
              {cashOnly ? 'Cash/Self-Pay Price:' : 'Without Insurance:'}
              <button
                type="button"
                className="price-info-icon"
                onMouseEnter={() => setShowPriceTooltip('without-insurance')}
                onMouseLeave={() => setShowPriceTooltip(null)}
                onClick={() => setShowPriceTooltip(showPriceTooltip === 'without-insurance' ? null : 'without-insurance')}
                aria-label="Price estimate information"
              >
                ℹ️
              </button>
              {showPriceTooltip === 'without-insurance' && (
                <div className="price-tooltip">
                  <div className="tooltip-content">
                    <strong>Estimated Price Only</strong>
                    <p>This is an estimated cash/self-pay price. Actual charges may vary based on:</p>
                    <ul>
                      <li>Hospital-specific pricing policies</li>
                      <li>Medical necessity and complexity</li>
                      <li>Additional services or complications</li>
                      <li>Negotiated rates or discounts available</li>
                    </ul>
                    <p><strong>Always confirm actual costs with the hospital before receiving services.</strong></p>
                  </div>
                </div>
              )}
            </div>
            <div className="price-value no-insurance-price">
              ${costWithoutInsurance.total.toLocaleString()}
            </div>
            <div className="plain-language">
              💡 {costWithoutInsurance.plainLanguage}
            </div>
          </div>

          {!cashOnly && priceWithInsurance !== null && (
            <div className="savings">
              Save ${(priceWithoutInsurance - priceWithInsurance).toLocaleString()} with insurance
            </div>
          )}
        </div>

        <div className="charity-section">
          <button
            className="charity-button"
            onClick={() => setShowCharityModal(true)}
          >
            💰 Price Explanation
          </button>
        </div>

        {showCharityModal && (
          <CharityEligibilityModal
            isOpen={showCharityModal}
            onClose={() => setShowCharityModal(false)}
            hospitalId={hospital.id}
            hospitalName={hospital.name}
            procedureCost={priceWithoutInsurance}
            zipCode={zipCode || hospital.address.zip}
            priceWithInsurance={priceWithInsurance}
            priceWithoutInsurance={priceWithoutInsurance}
            insuranceType={insuranceType}
            insurancePlan={insurancePlan}
          />
        )}
      </div>

      <style jsx>{`
        .hospital-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .hospital-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .rank-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .card-header h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-row {
          display: flex;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .info-row .label {
          font-weight: 600;
          color: #666;
          min-width: 100px;
        }

        .info-row .value {
          color: #333;
          flex: 1;
        }

        .network-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          margin: 0.5rem 0;
        }

        .network-status.in-network {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .network-status.out-of-network {
          background: #ffebee;
          color: #c62828;
        }

        .status-icon {
          font-size: 1.2rem;
        }

        .pricing {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #f0f0f0;
        }

        .price-section {
          margin-bottom: 1rem;
        }

        .price-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .price-info-icon {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.125rem 0.25rem;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          line-height: 1;
        }

        .price-info-icon:hover {
          background-color: rgba(102, 126, 234, 0.1);
        }

        .price-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          z-index: 1000;
          min-width: 280px;
          max-width: 350px;
          animation: fadeIn 0.2s ease-out;
        }

        .tooltip-content {
          background: white;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-size: 0.85rem;
          line-height: 1.6;
          color: #333;
        }

        .tooltip-content strong {
          display: block;
          color: #856404;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .tooltip-content p {
          margin: 0.5rem 0;
          color: #666;
        }

        .tooltip-content ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
          color: #666;
        }

        .tooltip-content li {
          margin-bottom: 0.25rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .insurance-price {
          color: #2e7d32;
        }

        .no-insurance-price {
          color: #c62828;
        }

        .unavailable {
          color: #999;
          font-size: 1rem;
          font-weight: 500;
        }

        .savings {
          background: #e3f2fd;
          color: #1565c0;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin-top: 0.5rem;
        }

        .cost-breakdown {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.5rem;
          font-size: 0.85rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          color: #666;
        }

        .breakdown-item span:last-child {
          white-space: nowrap;
          font-weight: 600;
        }

        .plain-language {
          background: #fff3e0;
          border-left: 3px solid #ff9800;
          padding: 0.75rem;
          margin-top: 0.75rem;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }

        .charity-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #f0f0f0;
        }

        .charity-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .charity-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .info-row {
            flex-direction: column;
            gap: 0.25rem;
          }

          .info-row .label {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

