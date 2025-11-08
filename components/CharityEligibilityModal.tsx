'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InsurancePlan } from '@/lib/types';
import { generatePlainLanguageCost } from '@/lib/utils';
import './CharityEligibilityModal.css';

interface PriceExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  hospitalName: string;
  procedureCost: number;
  zipCode: string;
  priceWithInsurance?: number | null;
  priceWithoutInsurance: number;
  insuranceType?: string;
  insurancePlan?: InsurancePlan;
}

export default function CharityEligibilityModal({
  isOpen,
  onClose,
  hospitalId,
  hospitalName,
  procedureCost,
  zipCode,
  priceWithInsurance,
  priceWithoutInsurance,
  insuranceType,
  insurancePlan,
}: PriceExplanationModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // Generate cost breakdowns
  const costWithInsurance = priceWithInsurance !== null
    ? generatePlainLanguageCost(priceWithInsurance, insuranceType, true, priceWithoutInsurance, insurancePlan)
    : null;
  const costWithoutInsurance = generatePlainLanguageCost(priceWithoutInsurance, undefined, false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-position', scrollY.toString());
    } else {
      // Restore scroll position
      const scrollY = document.body.getAttribute('data-scroll-position');
      if (scrollY) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY, 10));
        document.body.removeAttribute('data-scroll-position');
      }
    }
    return () => {
      // Cleanup: restore scroll position
      const scrollY = document.body.getAttribute('data-scroll-position');
      if (scrollY) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY, 10));
        document.body.removeAttribute('data-scroll-position');
      }
    };
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!modalRoot) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Price Explanation & Cost Breakdown</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Left Side - Payer & Cost Breakdown */}
          <div className="prices-panel">
            <h3>Payer & Cost Breakdown</h3>
            <div className="hospital-info">
              <h4>{hospitalName}</h4>
            </div>

            {costWithInsurance ? (
              <div className="cost-breakdown-section">
                <h4>With Insurance</h4>
                <div className="price-card">
                  <div className="price-label">Your Out-of-Pocket Cost</div>
                  <div className="price-value insurance">
                    ${costWithInsurance.total.toLocaleString()}
                  </div>
                </div>
                
                <div className="breakdown-details">
                  <h5>Cost Breakdown:</h5>
                  {costWithInsurance.deductible && costWithInsurance.deductible > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-label">Deductible:</span>
                      <span className="breakdown-value">${costWithInsurance.deductible.toLocaleString()}</span>
                    </div>
                  )}
                  {costWithInsurance.copay && costWithInsurance.copay > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-label">Copay:</span>
                      <span className="breakdown-value">${costWithInsurance.copay.toLocaleString()}</span>
                    </div>
                  )}
                  {costWithInsurance.coinsurance && costWithInsurance.coinsurance > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-label">Coinsurance:</span>
                      <span className="breakdown-value">${costWithInsurance.coinsurance.toLocaleString()}</span>
                    </div>
                  )}
                  {insurancePlan && (
                    <div className="breakdown-item">
                      <span className="breakdown-label">Out-of-Pocket Max:</span>
                      <span className="breakdown-value">${insurancePlan.benefits.outOfPocketMax.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {insurancePlan && (
                  <div className="payer-info">
                    <h5>Insurance Plan:</h5>
                    <div className="payer-details">
                      <div className="payer-item">
                        <span>Plan:</span>
                        <span>{insurancePlan.name}</span>
                      </div>
                      {insuranceType && (
                        <div className="payer-item">
                          <span>Provider:</span>
                          <span>{insuranceType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="savings-info">
                  <div className="savings-amount">
                    💰 You save ${(priceWithoutInsurance - costWithInsurance.total).toLocaleString()} with insurance
                  </div>
                </div>
              </div>
            ) : (
              <div className="cost-breakdown-section">
                <h4>With Insurance</h4>
                <div className="price-card unavailable">
                  <div className="price-label">Not Available</div>
                  <div className="price-value">N/A</div>
                  <div className="price-note">Out of Network</div>
                </div>
              </div>
            )}

            <div className="cost-breakdown-section">
              <h4>Without Insurance</h4>
              <div className="price-card">
                <div className="price-label">Full Cash Price</div>
                <div className="price-value no-insurance">
                  ${costWithoutInsurance.total.toLocaleString()}
                </div>
                <div className="price-note">This is the total amount you would pay if paying out of pocket</div>
              </div>
            </div>
          </div>

          {/* Right Side - Price Explanation */}
          <div className="form-panel">
            <div className="explanation-section">
              <h3>Price Explanation</h3>
              
              {costWithInsurance ? (
                <div className="explanation-content">
                  <div className="explanation-text">
                    <h4>What This Price Means:</h4>
                    <p>{costWithInsurance.plainLanguage}</p>
                  </div>
                  
                  <div className="explanation-details">
                    <h4>Understanding Your Costs:</h4>
                    <ul>
                      {costWithInsurance.deductible && costWithInsurance.deductible > 0 && (
                        <li>
                          <strong>Deductible (${costWithInsurance.deductible.toLocaleString()}):</strong> 
                          The amount you pay before your insurance starts covering costs.
                        </li>
                      )}
                      {costWithInsurance.copay && costWithInsurance.copay > 0 && (
                        <li>
                          <strong>Copay (${costWithInsurance.copay.toLocaleString()}):</strong> 
                          A fixed amount you pay for this specific service.
                        </li>
                      )}
                      {costWithInsurance.coinsurance && costWithInsurance.coinsurance > 0 && (
                        <li>
                          <strong>Coinsurance (${costWithInsurance.coinsurance.toLocaleString()}):</strong> 
                          Your share of the costs after meeting your deductible, typically a percentage.
                        </li>
                      )}
                      {insurancePlan && (
                        <li>
                          <strong>Out-of-Pocket Maximum:</strong> 
                          Once you reach ${insurancePlan.benefits.outOfPocketMax.toLocaleString()}, 
                          your insurance covers 100% of covered services for the rest of the year.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="insurance-coverage">
                    <h4>Insurance Coverage:</h4>
                    <p>
                      Your insurance covers ${(priceWithoutInsurance - costWithInsurance.total).toLocaleString()} 
                      of the total ${priceWithoutInsurance.toLocaleString()} procedure cost.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="explanation-content">
                  <div className="explanation-text">
                    <h4>What This Price Means:</h4>
                    <p>{costWithoutInsurance.plainLanguage}</p>
                  </div>
                  
                  <div className="explanation-details">
                    <h4>Understanding Cash Pricing:</h4>
                    <ul>
                      <li>
                        <strong>Full Cash Price:</strong> 
                        This is the total amount the hospital charges for this procedure when paying out of pocket.
                      </li>
                      <li>
                        <strong>No Insurance Discount:</strong> 
                        Without insurance, you pay the full amount without any negotiated discounts.
                      </li>
                      <li>
                        <strong>Payment Options:</strong> 
                        Many hospitals offer payment plans or discounts for cash payments. 
                        Contact the hospital directly to discuss options.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
}

