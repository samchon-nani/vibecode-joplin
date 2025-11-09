'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import FinancialNavigationHub from '@/components/FinancialNavigationHub';
import HIPAAComplianceFooter from '@/components/HIPAAComplianceFooter';
import MissingInfoModal from '@/components/MissingInfoModal';
import { SearchResult } from '@/lib/types';
import { getUserProfile, saveUserProfile } from '@/lib/userProfile';

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentInsurance, setCurrentInsurance] = useState<string>('');
  const [currentZipCode, setCurrentZipCode] = useState<string>('');
  const [cashOnly, setCashOnly] = useState<boolean>(false);
  const [missingInfo, setMissingInfo] = useState<{
    required: string[];
    message: string;
    context?: string;
  } | null>(null);
  const [pendingSearch, setPendingSearch] = useState<{
    procedure: string;
    procedures?: string[];
    location: string;
    insurance: string;
    insurancePlan?: string;
    maxDistance: number;
    searchType?: 'specific' | 'ai';
    locationType?: 'city-state' | 'zip';
    aiQuery?: string;
  } | null>(null);

  const handleSearch = async (searchParams: {
    procedure: string;
    procedures?: string[];
    location: string;
    insurance: string;
    insurancePlan?: string;
    maxDistance: number;
    searchType?: 'specific' | 'ai';
    locationType?: 'city-state' | 'zip';
    aiQuery?: string;
  }) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setMissingInfo(null);

    try {
      // Use AI search endpoint if AI query is provided
      const endpoint = searchParams.searchType === 'ai' ? '/api/ai-search' : '/api/search';
      
      // Get user profile to send with request
      const userProfile = getUserProfile();
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchParams,
          userProfile: userProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      
      // Check if we need missing information
      if (data.missingInfo) {
        setMissingInfo(data.missingInfo);
        setPendingSearch(searchParams);
        setLoading(false);
        return;
      }
      
      setResults(data.results || []);
      
      // Extract insurance, zip code, and cash-only flag for display
      if (data.parsedData) {
        setCurrentInsurance(data.parsedData.insurance || '');
        setCurrentZipCode(data.parsedData.zipCode || '');
        setCashOnly(data.parsedData.cashOnly || false);
      } else {
        setCurrentInsurance(searchParams.insurance);
        // Extract zip code from location if it's a zip code
        const zipMatch = searchParams.location.match(/^\d{5}$/);
        if (zipMatch) {
          setCurrentZipCode(zipMatch[0]);
        } else {
          setCurrentZipCode('');
        }
        setCashOnly(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMissingInfoComplete = (data: { insurance?: string; insurancePlan?: string; saveToProfile?: boolean }) => {
    // Save to user profile if requested
    if (data.saveToProfile && data.insurance) {
      saveUserProfile({
        insurance: data.insurance,
        insurancePlan: data.insurancePlan,
      });
    }

    // Close modal
    setMissingInfo(null);

    // Re-run search with the new information
    if (pendingSearch) {
      const updatedSearch = {
        ...pendingSearch,
        insurance: data.insurance || pendingSearch.insurance,
        insurancePlan: data.insurancePlan || pendingSearch.insurancePlan,
      };
      setPendingSearch(null);
      handleSearch(updatedSearch);
    }
  };

  const handleMissingInfoClose = () => {
    setMissingInfo(null);
    setPendingSearch(null);
  };

  return (
    <main className="container">
      <div className="header">
        <div className="compliance-badges">
          <div className="hipaa-badge">
            <span className="badge-icon">🔒</span>
            <span>HIPAA Compliant</span>
          </div>
          <div className="cms-badge">
            <span className="badge-icon">🏛️</span>
            <span>CMS Compliant</span>
          </div>
        </div>
        <h1>BillHarmony</h1>
        <p className="tagline">Bringing Clarity to Care Costs</p>
        <p className="subtitle">
          Compare prices, check charity eligibility, and find financial assistance programs
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {missingInfo && (
        <MissingInfoModal
          isOpen={!!missingInfo}
          onClose={handleMissingInfoClose}
          onComplete={handleMissingInfoComplete}
          missingFields={missingInfo.required}
          message={missingInfo.message}
          context={missingInfo.context}
        />
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Searching hospitals...</p>
        </div>
      )}

      {!loading && hasSearched && (
        <FinancialNavigationHub 
          results={results} 
          insuranceType={currentInsurance}
          zipCode={currentZipCode}
          cashOnly={cashOnly}
        />
      )}

      <HIPAAComplianceFooter />

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .compliance-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .hipaa-badge,
        .cms-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .badge-icon {
          font-size: 1rem;
        }

        .header h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: -0.02em;
        }

        .tagline {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 0.5rem;
          opacity: 0.95;
          font-style: italic;
        }

        .subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-top: 0.5rem;
        }

        .error-message {
          background: #fee;
          border: 2px solid #fcc;
          border-radius: 8px;
          padding: 1rem;
          margin: 2rem 0;
          color: #c33;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: white;
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}

