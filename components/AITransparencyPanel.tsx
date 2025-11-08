'use client';

import { useState } from 'react';
import { CharityEligibilityResult, CharityEligibilityRequest } from '@/lib/types';

interface AITransparencyPanelProps {
  results: CharityEligibilityResult;
  request: CharityEligibilityRequest;
}

export default function AITransparencyPanel({ results, request }: AITransparencyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate factors considered
  const fplThreshold = request.familySize === 1 ? 15760 : 
                     request.familySize === 2 ? 21380 :
                     request.familySize === 3 ? 26980 :
                     request.familySize === 4 ? 32580 :
                     request.familySize === 5 ? 38180 :
                     request.familySize === 6 ? 43780 :
                     request.familySize === 7 ? 49380 : 54980;
  
  const incomePercentOfFPL = (request.householdIncome / fplThreshold) * 100;

  const factorsConsidered = [
    {
      factor: 'Household Income',
      value: `$${request.householdIncome.toLocaleString()}`,
      weight: 40,
      impact: incomePercentOfFPL <= 200 ? 'positive' as const : incomePercentOfFPL <= 300 ? 'neutral' as const : 'negative' as const,
    },
    {
      factor: 'Family Size',
      value: `${request.familySize} ${request.familySize === 1 ? 'person' : 'people'}`,
      weight: 25,
      impact: 'neutral' as const,
    },
    {
      factor: 'Employment Status',
      value: request.employmentStatus.charAt(0).toUpperCase() + request.employmentStatus.slice(1).replace('-', ' '),
      weight: 20,
      impact: request.employmentStatus === 'unemployed' ? 'positive' as const : 'neutral' as const,
    },
    {
      factor: 'Income vs. Federal Poverty Level',
      value: `${Math.round(incomePercentOfFPL)}% of FPL`,
      weight: 15,
      impact: incomePercentOfFPL <= 138 ? 'positive' as const : incomePercentOfFPL <= 200 ? 'neutral' as const : 'negative' as const,
    },
  ];

  const calculationSteps = [
    {
      step: 1,
      description: 'Calculate Federal Poverty Level threshold for family size',
      result: `$${fplThreshold.toLocaleString()}`,
    },
    {
      step: 2,
      description: 'Calculate income as percentage of FPL',
      result: `${Math.round(incomePercentOfFPL)}%`,
    },
    {
      step: 3,
      description: 'Evaluate eligibility for each assistance program',
      result: `${results.qualifiedPrograms.length} program${results.qualifiedPrograms.length !== 1 ? 's' : ''} qualified`,
    },
    {
      step: 4,
      description: 'Calculate estimated assistance amount',
      result: `$${results.estimatedAssistance.toLocaleString()}`,
    },
    {
      step: 5,
      description: 'Calculate eligibility score',
      result: `${results.eligibilityScore}%`,
    },
  ];

  const limitations = [
    'Eligibility estimates are based on provided information and may vary based on additional documentation required by hospitals.',
    'Actual assistance amounts may differ based on hospital-specific policies and available funding.',
    'Some programs may have additional eligibility criteria not captured in this screening.',
    'Final eligibility determination is made by the hospital or program administrator.',
  ];

  return (
    <div className="ai-transparency-panel">
      <div className="transparency-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>🤖 AI Transparency & Decision Breakdown</h4>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="transparency-content">
          <div className="transparency-section">
            <h5>Factors Considered</h5>
            <div className="factors-list">
              {factorsConsidered.map((factor, index) => (
                <div key={index} className={`factor-item ${factor.impact}`}>
                  <div className="factor-header">
                    <span className="factor-name">{factor.factor}</span>
                    <span className="factor-weight">{factor.weight}% weight</span>
                  </div>
                  <div className="factor-value">{factor.value}</div>
                  <div className="factor-impact">
                    <span className={`impact-badge ${factor.impact}`}>
                      {factor.impact === 'positive' && '✓ Positive Impact'}
                      {factor.impact === 'negative' && '✗ Negative Impact'}
                      {factor.impact === 'neutral' && '○ Neutral Impact'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="transparency-section">
            <h5>Calculation Steps</h5>
            <div className="steps-list">
              {calculationSteps.map((step) => (
                <div key={step.step} className="step-item">
                  <div className="step-number">{step.step}</div>
                  <div className="step-content">
                    <div className="step-description">{step.description}</div>
                    <div className="step-result">{step.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="transparency-section">
            <h5>Confidence Score</h5>
            <div className="confidence-display">
              <div className="confidence-circle">
                <span className="confidence-value">{results.eligibilityScore}%</span>
                <span className="confidence-label">Confidence</span>
              </div>
              <p className="confidence-explanation">
                Based on the factors analyzed, there is a {results.eligibilityScore}% likelihood that you qualify
                for financial assistance programs. This score considers your income, family size, employment status,
                and how they compare to program eligibility criteria.
              </p>
            </div>
          </div>

          <div className="transparency-section">
            <h5>AI Reasoning</h5>
            <div className="reasoning-box">
              <p>{results.reasoning}</p>
            </div>
          </div>

          <div className="transparency-section">
            <h5>Limitations & Disclaimers</h5>
            <ul className="limitations-list">
              {limitations.map((limitation, index) => (
                <li key={index}>{limitation}</li>
              ))}
            </ul>
          </div>

          <div className="transparency-section">
            <h5>How to Improve Eligibility</h5>
            <div className="improvement-tips">
              {incomePercentOfFPL > 200 && (
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <span>Your income is above 200% of FPL. Consider applying for sliding scale programs that may still provide partial assistance.</span>
                </div>
              )}
              {request.employmentStatus !== 'unemployed' && (
                <div className="tip-item">
                  <span className="tip-icon">💡</span>
                  <span>If your employment status changes, you may qualify for additional assistance programs.</span>
                </div>
              )}
              <div className="tip-item">
                <span className="tip-icon">💡</span>
                <span>Contact hospitals directly to discuss payment plans and additional assistance options not captured in this screening.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-transparency-panel {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          margin-top: 1.5rem;
          overflow: hidden;
        }

        .transparency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          cursor: pointer;
          transition: background 0.2s;
        }

        .transparency-header:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
        }

        .transparency-header h4 {
          margin: 0;
          color: #1976d2;
          font-size: 1.1rem;
        }

        .expand-button {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #1976d2;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .transparency-content {
          padding: 1.5rem;
        }

        .transparency-section {
          margin-bottom: 2rem;
        }

        .transparency-section:last-child {
          margin-bottom: 0;
        }

        .transparency-section h5 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }

        .factors-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .factor-item {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border-left: 4px solid #e0e0e0;
        }

        .factor-item.positive {
          border-left-color: #4caf50;
        }

        .factor-item.negative {
          border-left-color: #f44336;
        }

        .factor-item.neutral {
          border-left-color: #ff9800;
        }

        .factor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .factor-name {
          font-weight: 600;
          color: #333;
        }

        .factor-weight {
          font-size: 0.85rem;
          color: #666;
        }

        .factor-value {
          color: #667eea;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .factor-impact {
          margin-top: 0.5rem;
        }

        .impact-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .impact-badge.positive {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .impact-badge.negative {
          background: #ffebee;
          color: #c62828;
        }

        .impact-badge.neutral {
          background: #fff3e0;
          color: #e65100;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step-item {
          display: flex;
          gap: 1rem;
          background: white;
          border-radius: 8px;
          padding: 1rem;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-description {
          color: #666;
          margin-bottom: 0.25rem;
        }

        .step-result {
          color: #667eea;
          font-weight: 600;
        }

        .confidence-display {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .confidence-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .confidence-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .confidence-label {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .confidence-explanation {
          flex: 1;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .reasoning-box {
          background: white;
          border-left: 4px solid #2196f3;
          border-radius: 8px;
          padding: 1rem;
          color: #333;
          line-height: 1.6;
        }

        .limitations-list {
          background: white;
          border-radius: 8px;
          padding: 1rem 1rem 1rem 2rem;
          margin: 0;
          color: #666;
          line-height: 1.8;
        }

        .limitations-list li {
          margin-bottom: 0.5rem;
        }

        .improvement-tips {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tip-item {
          background: white;
          border-left: 4px solid #4caf50;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .tip-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .tip-item span:last-child {
          color: #333;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .confidence-display {
            flex-direction: column;
            align-items: center;
          }

          .confidence-explanation {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

