'use client';

import { useState } from 'react';

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
  const [aiQuery, setAiQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
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

      <button type="submit" className="search-button" disabled={loading}>
        {loading 
          ? '🤖 AI is analyzing your request...' 
          : '🤖 AI Search'}
      </button>

      <style jsx>{`
        .search-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.9rem;
        }

        .label-hint {
          display: block;
          font-weight: 400;
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
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
      `}</style>
    </form>
  );
}

