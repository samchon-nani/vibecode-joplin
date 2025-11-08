'use client';

import { useState } from 'react';
import { SearchResult } from '@/lib/types';
import HospitalCard from './HospitalCard';

interface ResultsListProps {
  results: SearchResult[];
  insuranceType?: string;
  zipCode?: string;
  cashOnly?: boolean;
}

type SortOption = 'distance' | 'priceWithInsurance' | 'priceWithoutInsurance';

export default function ResultsList({ results, insuranceType, zipCode, cashOnly = false }: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>(cashOnly ? 'priceWithoutInsurance' : 'distance');

  if (results.length === 0) {
    return (
      <div className="no-results">
        <p>No hospitals found matching your criteria.</p>
        <p className="hint">Try expanding your search radius or checking a different location.</p>
        <style jsx>{`
          .no-results {
            background: white;
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            color: #666;
          }

          .no-results p {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }

          .hint {
            font-size: 0.9rem;
            color: #999;
          }
        `}</style>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'priceWithInsurance':
        if (a.priceWithInsurance === null && b.priceWithInsurance === null) return 0;
        if (a.priceWithInsurance === null) return 1;
        if (b.priceWithInsurance === null) return -1;
        return a.priceWithInsurance - b.priceWithInsurance;
      case 'priceWithoutInsurance':
        return a.priceWithoutInsurance - b.priceWithoutInsurance;
      default:
        return 0;
    }
  });

  return (
    <div className="results-container">
      <div className="price-disclaimer-banner">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-content">
          <strong>Price Disclaimer:</strong> All prices shown are <strong>estimated prices only</strong> and may differ from actual charges. 
          Final prices depend on your specific insurance plan, deductible status, medical necessity, and hospital policies. 
          Always confirm actual costs directly with the hospital before receiving services.
        </div>
      </div>
      {cashOnly && (
        <div className="cash-only-banner">
          💵 Showing cash/self-pay prices only. Results sorted by lowest cash price.
        </div>
      )}
      <div className="results-header">
        <h2>
          Found {results.length} {results.length === 1 ? 'hospital' : 'hospitals'}
        </h2>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="distance">Distance</option>
            {!cashOnly && <option value="priceWithInsurance">Price (With Insurance)</option>}
            <option value="priceWithoutInsurance">Price (Without Insurance)</option>
          </select>
        </div>
      </div>

      <div className="results-grid">
        {sortedResults.map((result, index) => (
          <HospitalCard 
            key={result.hospital.id} 
            result={result} 
            rank={index + 1}
            insuranceType={insuranceType}
            zipCode={zipCode}
            cashOnly={cashOnly}
          />
        ))}
      </div>

      <style jsx>{`
        .results-container {
          margin-top: 2rem;
        }

        .price-disclaimer-banner {
          background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
          border: 2px solid #ffc107;
          color: #856404;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
        }

        .disclaimer-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .disclaimer-content {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .disclaimer-content strong {
          font-weight: 700;
          color: #856404;
        }

        .cash-only-banner {
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .results-header h2 {
          color: white;
          font-size: 1.75rem;
          font-weight: 600;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls label {
          color: white;
          font-weight: 500;
        }

        .sort-controls select {
          padding: 0.5rem 1rem;
          border: 2px solid white;
          border-radius: 8px;
          background: white;
          font-size: 1rem;
          cursor: pointer;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr;
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

