'use client';

import { CharityEligibilityResult, CharityEligibilityRequest } from '@/lib/types';
import AITransparencyPanel from './AITransparencyPanel';

interface CharityEligibilityResultsProps {
  results: CharityEligibilityResult;
  hospitalName: string;
  procedureCost: number;
  request?: CharityEligibilityRequest;
  onReset: () => void;
  onClose: () => void;
}

export default function CharityEligibilityResults({
  results,
  hospitalName,
  procedureCost,
  request,
  onReset,
  onClose,
}: CharityEligibilityResultsProps) {
  const finalCost = procedureCost - results.estimatedAssistance;

  return (
    <div className="results-container">
      <div className="results-header">
        <h3>Your Eligibility Results</h3>
        <div className="eligibility-score">
          <div className="score-circle">
            <span className="score-value">{results.eligibilityScore}%</span>
            <span className="score-label">Likely to Qualify</span>
          </div>
        </div>
      </div>

      {results.qualifiedPrograms.length > 0 ? (
        <>
          {results.recommendedProgram && (
            <div className="recommended-program">
              <div className="recommended-badge">⭐ Recommended</div>
              <h4>{results.recommendedProgram.name}</h4>
              <p>{results.recommendedProgram.description}</p>
              <div className="assistance-amount">
                <span className="assistance-label">Estimated Assistance:</span>
                <span className="assistance-value">
                  {results.recommendedProgram.coverageType === 'full'
                    ? '100% Coverage'
                    : `$${results.estimatedAssistance.toLocaleString()}`}
                </span>
              </div>
            </div>
          )}

          <div className="cost-summary">
            <div className="cost-row">
              <span>Original Cost:</span>
              <span className="original-cost">${procedureCost.toLocaleString()}</span>
            </div>
            <div className="cost-row">
              <span>Estimated Assistance:</span>
              <span className="assistance-cost">-${results.estimatedAssistance.toLocaleString()}</span>
            </div>
            <div className="cost-row final">
              <span>Your Estimated Cost:</span>
              <span className="final-cost">${finalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="qualified-programs">
            <h4>Qualified Programs ({results.qualifiedPrograms.length})</h4>
            {results.qualifiedPrograms.map((program) => (
              <div key={program.id} className="program-card">
                <h5>{program.name}</h5>
                <p>{program.description}</p>
                <div className="program-coverage">
                  {program.coverageType === 'full' ? (
                    <span className="full-coverage">100% Coverage Available</span>
                  ) : (
                    <span className="partial-coverage">
                      {program.coverageAmount}% Coverage Available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-programs">
          <p>Based on your information, you may not qualify for charity programs at this time.</p>
          <p>However, you may still be eligible for payment plans or other assistance options.</p>
        </div>
      )}

      {request && (
        <AITransparencyPanel results={results} request={request} />
      )}

      <div className="actions">
        <button onClick={onReset} className="reset-button">
          Check Again
        </button>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>

      <style jsx>{`
        .results-container {
          padding: 0;
        }

        .results-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .results-header h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: #333;
        }

        .eligibility-score {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .score-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .recommended-program {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 2px solid #4caf50;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .recommended-badge {
          display: inline-block;
          background: #4caf50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .recommended-program h4 {
          margin: 0.5rem 0;
          color: #2e7d32;
        }

        .recommended-program p {
          margin: 0.5rem 0;
          color: #666;
        }

        .assistance-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #4caf50;
        }

        .assistance-label {
          font-weight: 600;
          color: #2e7d32;
        }

        .assistance-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2e7d32;
        }

        .cost-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .cost-row:last-child {
          border-bottom: none;
        }

        .cost-row.final {
          border-top: 2px solid #667eea;
          margin-top: 0.5rem;
          padding-top: 1rem;
        }

        .original-cost {
          font-weight: 600;
          color: #666;
        }

        .assistance-cost {
          font-weight: 600;
          color: #4caf50;
        }

        .final-cost {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .qualified-programs {
          margin-bottom: 1.5rem;
        }

        .qualified-programs h4 {
          margin-bottom: 1rem;
          color: #333;
        }

        .program-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .program-card h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .program-card p {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .program-coverage {
          margin-top: 0.5rem;
        }

        .full-coverage {
          display: inline-block;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .partial-coverage {
          display: inline-block;
          background: #fff3e0;
          color: #e65100;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .no-programs {
          background: #fff3e0;
          border: 1px solid #ffb74d;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .no-programs p {
          margin: 0.5rem 0;
          color: #666;
        }

        .ai-reasoning {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .ai-reasoning h4 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }

        .ai-reasoning p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .reset-button,
        .close-button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button {
          background: #f0f0f0;
          color: #333;
        }

        .reset-button:hover {
          background: #e0e0e0;
        }

        .close-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .close-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
}

