'use client';

import { useState, useEffect } from 'react';
import proceduresData from '@/data/procedures.json';
import insurancesData from '@/data/insurances.json';
import { getUserProfile } from '@/lib/userProfile';

interface SearchFormProps {
  onSearch: (params: {
    procedure: string;
    procedures?: string[];
    location: string;
    insurance: string;
    insurancePlan?: string;
    maxDistance: number;
    searchType?: 'specific' | 'ai';
    locationType?: 'city-state' | 'zip';
    aiQuery?: string;
  }) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchMode, setSearchMode] = useState<'filter' | 'ai'>('filter');
  const [aiQuery, setAiQuery] = useState('');
  const [procedures, setProcedures] = useState<string[]>([]);
  const [procedureSearch, setProcedureSearch] = useState('');
  const [showProcedureDropdown, setShowProcedureDropdown] = useState(false);
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [locationType, setLocationType] = useState<'city-state' | 'zip'>('zip');
  const [insurance, setInsurance] = useState('');
  const [insurancePlan, setInsurancePlan] = useState('');
  const [maxDistance, setMaxDistance] = useState(100);

  const selectedInsurance = insurance ? insurancesData.find((ins) => ins.id === insurance) : null;
  const availablePlans = selectedInsurance?.plans || [];

  // Filter procedures based on search query
  const filteredProcedures = proceduresData.filter((proc) => {
    if (!procedureSearch.trim()) return true;
    const searchLower = procedureSearch.toLowerCase();
    return (
      proc.name.toLowerCase().includes(searchLower) ||
      proc.description.toLowerCase().includes(searchLower) ||
      proc.code_information?.some((code) => code.code.includes(searchLower)) ||
      proc.id.toLowerCase().includes(searchLower)
    );
  });

  // Get selected procedures display text
  const selectedProcedures = proceduresData.filter((proc) => procedures.includes(proc.id));
  const procedureDisplayText = selectedProcedures.length > 0
    ? selectedProcedures.map(proc => proc.name).join(', ')
    : '';

  const handleProcedureSelect = (procId: string) => {
    if (procedures.includes(procId)) {
      // Remove if already selected
      setProcedures(procedures.filter(id => id !== procId));
    } else {
      // Add to selection
      setProcedures([...procedures, procId]);
    }
    setProcedureSearch(''); // Clear search
    // Keep dropdown open for multiple selections
  };

  const handleRemoveProcedure = (procId: string) => {
    setProcedures(procedures.filter(id => id !== procId));
  };

  // Load user profile on mount
  useEffect(() => {
    const profile = getUserProfile();
    if (profile.insurance) {
      setInsurance(profile.insurance);
      if (profile.insurancePlan) {
        setInsurancePlan(profile.insurancePlan);
      }
    }
    if (profile.zipCode) {
      setZipCode(profile.zipCode);
      setLocation(profile.zipCode);
      setLocationType('zip');
    } else if (profile.city && profile.state) {
      setCity(profile.city);
      setState(profile.state);
      setLocation(`${profile.city}, ${profile.state}`);
      setLocationType('city-state');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // AI Search Mode
    if (searchMode === 'ai') {
      if (!aiQuery.trim()) {
        return;
      }
      onSearch({
        procedure: '', // Will be parsed by AI
        location: '', // Will be parsed by AI
        insurance: '', // Will be parsed by AI
        maxDistance: 100, // Will be parsed by AI
        searchType: 'ai',
        aiQuery: aiQuery.trim(),
      });
      return;
    }

    // Filter Search Mode
    // Build location string based on location type
    let locationString = '';
    if (locationType === 'zip') {
      locationString = zipCode;
    } else {
      locationString = city && state ? `${city}, ${state}` : city || state;
    }

    // Validate required fields
    if (procedures.length === 0 || !locationString || !maxDistance) {
      // If no procedures selected, show dropdown
      if (procedures.length === 0) {
        setShowProcedureDropdown(true);
      }
      return;
    }

    onSearch({
      procedure: procedures.join(','), // Send as comma-separated string for API compatibility
      procedures: procedures, // Also send as array for future use
      location: locationString,
      insurance,
      insurancePlan: insurancePlan || undefined,
      maxDistance,
      searchType: 'specific',
      locationType,
    });
  };

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInsurance(e.target.value);
    setInsurancePlan(''); // Reset plan when insurance changes
  };

  const handleLocationTypeChange = (type: 'city-state' | 'zip') => {
    setLocationType(type);
    // Clear location fields when switching
    setCity('');
    setState('');
    setZipCode('');
    setLocation('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      {/* Main Search Mode Selector */}
      <div className="search-mode-selector">
        <label className="search-mode-label">Search Method</label>
        <div className="search-mode-options">
          <button
            type="button"
            className={`search-mode-btn ${searchMode === 'filter' ? 'active' : ''}`}
            onClick={() => setSearchMode('filter')}
            disabled={loading}
          >
            🔍 Filter Search
          </button>
          <button
            type="button"
            className={`search-mode-btn ${searchMode === 'ai' ? 'active' : ''}`}
            onClick={() => setSearchMode('ai')}
            disabled={loading}
          >
            🤖 AI Search
          </button>
        </div>
        <p className="search-mode-hint">
          {searchMode === 'filter' 
            ? 'Use filters to search for procedures, insurance, and location'
            : 'Describe what you need in natural language and AI will find it for you'}
        </p>
      </div>

      {/* AI Search Mode */}
      {searchMode === 'ai' ? (
        <div className="ai-search-container">
          <div className="form-group ai-query-group">
            <label htmlFor="aiQuery">
              Describe what you need
              <span className="label-hint">💡 Example: "I need to see how much an MRI and CT scan will be if I have Blue Cross Premium in the 90210 area within a 50 mile radius"</span>
            </label>
            <textarea
              id="aiQuery"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Tell us what you're looking for... e.g., 'I need an MRI with Blue Cross insurance in Beverly Hills, CA within 25 miles'"
              required
              disabled={loading}
              rows={4}
              className="ai-query-textarea"
            />
            <div className="ai-query-hint">
              <p>💡 The AI will understand:</p>
              <ul>
                <li>Medical procedures (MRI, CT scan, X-Ray, etc.)</li>
                <li>Insurance providers and plans</li>
                <li>Locations (zip codes, cities, states)</li>
                <li>Distance/radius preferences</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-grid">
        {/* Procedure Selection - Searchable */}
        <div className="form-group procedure-search-group">
          <label htmlFor="procedure">Medical Procedure</label>
          <div className="procedure-search-container">
            <div className="procedure-input-wrapper">
              <input
                type="text"
                id="procedure"
                value={procedureSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setProcedureSearch(value);
                  // Show dropdown if there are results or if input is empty (to show all)
                  setShowProcedureDropdown(true);
                }}
                onFocus={() => {
                  // Show dropdown when focused
                  setShowProcedureDropdown(true);
                }}
                onBlur={() => {
                  // Delay to allow click on dropdown item
                  setTimeout(() => {
                    setShowProcedureDropdown(false);
                  }, 200);
                }}
                placeholder={procedures.length > 0 ? "Add more procedures..." : "Search procedures (e.g., MRI, CT scan, 76700)..."}
                required={procedures.length === 0}
                disabled={loading}
                className="procedure-search-input"
                autoComplete="off"
              />
              {procedures.length > 0 && (
                <div className="selected-procedures">
                  {selectedProcedures.map((proc) => (
                    <span key={proc.id} className="selected-procedure-tag">
                      {proc.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveProcedure(proc.id)}
                        className="remove-procedure-btn"
                        aria-label={`Remove ${proc.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {showProcedureDropdown && filteredProcedures.length > 0 && (
              <div className="procedure-dropdown">
                {filteredProcedures.length > 50 ? (
                  <div className="procedure-dropdown-header">
                    Showing top 50 of {filteredProcedures.length} results
                  </div>
                ) : null}
                <div className="procedure-dropdown-list">
                  {filteredProcedures.slice(0, 50).map((proc) => {
                    const cptCode = proc.code_information?.[0]?.code || '';
                    const isSelected = procedures.includes(proc.id);
                    return (
                      <div
                        key={proc.id}
                        className={`procedure-dropdown-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleProcedureSelect(proc.id)}
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                      >
                        <div className="procedure-item-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent onClick
                            readOnly
                          />
                        </div>
                        <div className="procedure-item-content">
                          <div className="procedure-item-name">{proc.name}</div>
                          <div className="procedure-item-details">
                            {proc.description}
                            {cptCode && <span className="procedure-item-code">CPT: {cptCode}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredProcedures.length === 0 && procedureSearch && (
                  <div className="procedure-dropdown-empty">
                    No procedures found matching "{procedureSearch}"
                  </div>
                )}
              </div>
            )}
          </div>
          {procedures.length === 0 && procedureSearch && (
            <div className="procedure-validation-hint">
              Please select at least one procedure from the dropdown
            </div>
          )}
          {procedures.length > 0 && (
            <div className="procedure-count-hint">
              {procedures.length} procedure{procedures.length !== 1 ? 's' : ''} selected. Total cost will be calculated.
            </div>
          )}
        </div>

        {/* Location Selection */}
        <div className="form-group location-group">
          <label htmlFor="locationType">Location Type</label>
          <div className="location-type-selector">
            <button
              type="button"
              className={`location-type-btn ${locationType === 'zip' ? 'active' : ''}`}
              onClick={() => handleLocationTypeChange('zip')}
              disabled={loading}
            >
              📍 Zip Code
            </button>
            <button
              type="button"
              className={`location-type-btn ${locationType === 'city-state' ? 'active' : ''}`}
              onClick={() => handleLocationTypeChange('city-state')}
              disabled={loading}
            >
              🏙️ City, State
            </button>
          </div>
          
          {locationType === 'zip' ? (
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZipCode(value);
                setLocation(value);
              }}
              placeholder="e.g., 90210"
              required
              disabled={loading}
              pattern="[0-9]{5}"
              maxLength={5}
            />
          ) : (
            <div className="city-state-inputs">
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCity(newCity);
                  setLocation(newCity && state ? `${newCity}, ${state}` : '');
                }}
                placeholder="City"
                required
                disabled={loading}
              />
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 2);
                  setState(value);
                  setLocation(city && value ? `${city}, ${value}` : '');
                }}
                placeholder="State (e.g., CA)"
                required
                disabled={loading}
                maxLength={2}
                pattern="[A-Z]{2}"
              />
            </div>
          )}
        </div>

        {/* Distance/Mileage */}
        <div className="form-group">
          <label htmlFor="distance">Search Radius (miles)</label>
          <div className="distance-selector">
            <input
              type="range"
              id="distance"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              min="1"
              max="500"
              step="5"
              disabled={loading}
              className="distance-slider"
            />
            <div className="distance-display">
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => {
                  const value = Math.min(500, Math.max(1, Number(e.target.value) || 1));
                  setMaxDistance(value);
                }}
                min="1"
                max="500"
                disabled={loading}
                className="distance-input"
              />
              <span className="distance-unit">miles</span>
            </div>
          </div>
          <div className="distance-presets">
            <button
              type="button"
              onClick={() => setMaxDistance(10)}
              disabled={loading}
              className="distance-preset"
            >
              10 mi
            </button>
            <button
              type="button"
              onClick={() => setMaxDistance(25)}
              disabled={loading}
              className="distance-preset"
            >
              25 mi
            </button>
            <button
              type="button"
              onClick={() => setMaxDistance(50)}
              disabled={loading}
              className="distance-preset"
            >
              50 mi
            </button>
            <button
              type="button"
              onClick={() => setMaxDistance(100)}
              disabled={loading}
              className="distance-preset"
            >
              100 mi
            </button>
          </div>
        </div>

        {/* Insurance Selection */}
        <div className={`form-group insurance-group ${insurance && availablePlans.length > 0 ? 'has-details' : ''}`}>
          <label htmlFor="insurance">
            Insurance Provider (Optional)
            <span className="label-hint">💼 Works with all major providers</span>
          </label>
          <select
            id="insurance"
            value={insurance}
            onChange={handleInsuranceChange}
            disabled={loading}
          >
            <option value="">No insurance / Compare all</option>
            {insurancesData.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.name} ({ins.type})
              </option>
            ))}
          </select>
          {insurance && availablePlans.length > 0 && (
            <div className="insurance-details">
            <label htmlFor="insurancePlan" className="plan-label">
              Select Plan (Optional)
            </label>
            <select
              id="insurancePlan"
              value={insurancePlan}
              onChange={(e) => setInsurancePlan(e.target.value)}
              disabled={loading}
              className="plan-select"
            >
              <option value="">Use default pricing</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.description}
                </option>
              ))}
            </select>
            {insurancePlan && (
              <div className="plan-benefits">
                {(() => {
                  const plan = availablePlans.find((p) => p.id === insurancePlan);
                  return plan ? (
                    <>
                      <div className="plan-benefits-header">
                        <span className="plan-name-badge">{plan.name}</span>
                        <span className="plan-benefits-title">Plan Benefits</span>
                      </div>
                      <div className="benefits-grid">
                        <div className="benefit-item">
                          <span className="benefit-icon">💵</span>
                          <div className="benefit-content">
                            <span className="benefit-label">Deductible</span>
                            <span className="benefit-value">${plan.benefits.deductible.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <span className="benefit-icon">💳</span>
                          <div className="benefit-content">
                            <span className="benefit-label">Copay</span>
                            <span className="benefit-value">${plan.benefits.copay}</span>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <span className="benefit-icon">📊</span>
                          <div className="benefit-content">
                            <span className="benefit-label">Coinsurance</span>
                            <span className="benefit-value">{plan.benefits.coinsurance}%</span>
                          </div>
                        </div>
                        <div className="benefit-item">
                          <span className="benefit-icon">🛡️</span>
                          <div className="benefit-content">
                            <span className="benefit-label">Max Out-of-Pocket</span>
                            <span className="benefit-value">${plan.benefits.outOfPocketMax.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
        {insurance && !availablePlans.length && (
          <p className="insurance-note">
            ✓ Prices will be calculated based on your {selectedInsurance?.name} plan
          </p>
        )}
        </div>
        </div>
      )}

      <button type="submit" className="search-button" disabled={loading}>
        {loading 
          ? (searchMode === 'ai' ? '🤖 AI is analyzing your request...' : 'Searching...') 
          : (searchMode === 'ai' ? '🤖 AI Search' : '🔍 Search Hospitals')}
      </button>

      <style jsx>{`
        .search-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .insurance-group {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.9rem;
        }

        .form-group select,
        .form-group input:not(.procedure-search-input) {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        /* Procedure Search Styles */
        .procedure-search-group {
          position: relative;
        }

        .procedure-search-container {
          position: relative;
        }

        .procedure-input-wrapper {
          position: relative;
        }

        .procedure-search-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .selected-procedures {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .selected-procedure-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .remove-procedure-btn {
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          padding: 0;
        }

        .remove-procedure-btn:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .procedure-count-hint {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #4caf50;
          font-weight: 500;
        }

        .procedure-search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .procedure-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.25rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
          animation: slideDown 0.2s ease-out;
        }

        .procedure-dropdown-header {
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          font-size: 0.85rem;
          color: #666;
          font-weight: 600;
        }

        .procedure-dropdown-list {
          max-height: 350px;
          overflow-y: auto;
        }

        .procedure-dropdown-item {
          padding: 0.875rem 1rem;
          cursor: pointer;
          transition: background-color 0.15s;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .procedure-item-checkbox {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .procedure-item-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .procedure-item-content {
          flex: 1;
        }

        .procedure-dropdown-item:last-child {
          border-bottom: none;
        }

        .procedure-dropdown-item:hover {
          background-color: #f8f9ff;
        }

        .procedure-dropdown-item.selected {
          background-color: #e3f2fd;
          border-left: 3px solid #667eea;
        }

        .procedure-item-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .procedure-item-details {
          font-size: 0.85rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .procedure-item-code {
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .procedure-dropdown-empty {
          padding: 1.5rem;
          text-align: center;
          color: #999;
          font-size: 0.9rem;
        }

        /* Scrollbar styling for dropdown */
        .procedure-dropdown-list::-webkit-scrollbar {
          width: 8px;
        }

        .procedure-dropdown-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .procedure-dropdown-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .procedure-dropdown-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .procedure-validation-hint {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #d32f2f;
          font-weight: 500;
        }

        .form-group select:focus,
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group select:disabled,
        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .label-hint {
          display: block;
          font-weight: 400;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .insurance-note {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #4caf50;
          font-weight: 500;
        }

        .insurance-group {
          position: relative;
        }

        .insurance-details {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e0e0e0;
          animation: slideDown 0.3s ease-out;
        }

        /* When insurance details are shown, make the insurance group span full width */
        @media (min-width: 768px) {
          .insurance-group.has-details {
            grid-column: 1 / -1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .plan-label {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .plan-select {
          margin-bottom: 0.75rem;
        }

        .plan-benefits {
          margin-top: 0.75rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 10px;
          border: 1px solid #dee2e6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .plan-benefits-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #dee2e6;
        }

        .plan-name-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .plan-benefits-title {
          font-weight: 600;
          color: #333;
          font-size: 0.85rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          transition: all 0.2s;
        }

        .benefit-item:hover {
          border-color: #667eea;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .benefit-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .benefit-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .benefit-label {
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.125rem;
        }

        .benefit-value {
          font-weight: 700;
          color: #667eea;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .insurance-details {
            margin-top: 1rem;
            padding-top: 1rem;
          }
        }

        .search-button {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Main Search Mode Selector */
        .search-mode-selector {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: 12px;
          border: 2px solid #2196f3;
        }

        .search-mode-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1976d2;
          font-size: 1.1rem;
        }

        .search-mode-options {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .search-mode-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          background: white;
          border: 2px solid #2196f3;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          color: #1976d2;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-mode-btn:hover:not(:disabled) {
          background: #e3f2fd;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .search-mode-btn.active {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          border-color: #1976d2;
          color: white;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
        }

        .search-mode-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .search-mode-hint {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          color: #1976d2;
          font-style: italic;
        }

        /* AI Search Container */
        .ai-search-container {
          margin-bottom: 1.5rem;
        }

        .ai-query-group {
          margin-bottom: 0;
        }

        .ai-query-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
          line-height: 1.6;
        }

        .ai-query-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ai-query-textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .ai-query-hint {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          border-left: 4px solid #9c27b0;
          border-radius: 8px;
        }

        .ai-query-hint p {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          color: #7b1fa2;
        }

        .ai-query-hint ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #6a1b9a;
          line-height: 1.8;
        }

        .ai-query-hint li {
          margin-bottom: 0.25rem;
        }


        /* Location Type Selector */
        .location-group {
          grid-column: 1 / -1;
        }

        .location-type-selector {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .location-type-btn {
          flex: 1;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .location-type-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .location-type-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .location-type-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .city-state-inputs {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.75rem;
        }

        /* Distance Selector */
        .distance-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .distance-slider {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: #e0e0e0;
          outline: none;
          -webkit-appearance: none;
        }

        .distance-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
        }

        .distance-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
        }

        .distance-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .distance-input {
          width: 80px;
          padding: 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
        }

        .distance-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .distance-unit {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .distance-presets {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .distance-preset {
          padding: 0.4rem 0.8rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .distance-preset:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
          background: #f8f9ff;
        }

        .distance-preset:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Insurance Type Details */
        .insurance-type-details {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e0e0e0;
        }

        .insurance-type-details label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .search-mode-options {
            flex-direction: column;
          }

          .location-type-selector {
            flex-direction: column;
          }

          .city-state-inputs {
            grid-template-columns: 1fr;
          }

          .distance-selector {
            flex-direction: column;
            align-items: stretch;
          }

          .distance-display {
            justify-content: center;
          }
        }
      `}</style>
    </form>
  );
}

