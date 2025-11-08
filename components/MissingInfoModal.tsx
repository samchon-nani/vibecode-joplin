'use client';

import { useState, useEffect } from 'react';
import insurancesData from '@/data/insurances.json';
import { Insurance } from '@/lib/types';

interface MissingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { insurance?: string; insurancePlan?: string; saveToProfile?: boolean }) => void;
  missingFields: string[];
  message: string;
  context?: string;
}

export default function MissingInfoModal({
  isOpen,
  onClose,
  onComplete,
  missingFields,
  message,
  context,
}: MissingInfoModalProps) {
  const [insurance, setInsurance] = useState('');
  const [insurancePlan, setInsurancePlan] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);

  const selectedInsurance = insurance ? insurancesData.find((ins) => ins.id === insurance) : null;
  const availablePlans = selectedInsurance?.plans || [];

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setInsurance('');
      setInsurancePlan('');
      setSaveToProfile(true);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (missingFields.includes('insurance') && !insurance) {
      return;
    }

    const data: { insurance?: string; insurancePlan?: string; saveToProfile?: boolean } = {};
    if (insurance) {
      data.insurance = insurance;
      if (insurancePlan) {
        data.insurancePlan = insurancePlan;
      }
    }
    data.saveToProfile = saveToProfile;

    onComplete(data);
  };

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInsurance(e.target.value);
    setInsurancePlan(''); // Reset plan when insurance changes
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Additional Information Needed</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>

          <form onSubmit={handleSubmit} className="missing-info-form">
            {missingFields.includes('insurance') && (
              <div className="form-group">
                <label htmlFor="modal-insurance">
                  Insurance Provider <span className="required">*</span>
                </label>
                <select
                  id="modal-insurance"
                  value={insurance}
                  onChange={handleInsuranceChange}
                  required
                  className="form-select"
                >
                  <option value="">Select your insurance...</option>
                  {insurancesData.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} ({ins.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {insurance && availablePlans.length > 0 && (
              <div className="form-group">
                <label htmlFor="modal-insurance-plan">
                  Insurance Plan (Optional)
                </label>
                <select
                  id="modal-insurance-plan"
                  value={insurancePlan}
                  onChange={(e) => setInsurancePlan(e.target.value)}
                  className="form-select"
                >
                  <option value="">Use default pricing</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Save this information for future searches</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Continue Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f0f0f0;
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-message {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          color: #555;
          line-height: 1.6;
        }

        .missing-info-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.95rem;
        }

        .required {
          color: #e74c3c;
        }

        .form-select {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          background: white;
        }

        .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .checkbox-group {
          margin-top: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 400;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          justify-content: flex-end;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #666;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-width: 100%;
            margin: 0;
            border-radius: 16px 16px 0 0;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

