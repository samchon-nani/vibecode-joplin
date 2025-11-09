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
        <h1>
          Bill<span className="wave-logo"></span>Harmony
        </h1>
        <p className="tagline">Bringing Clarity to Care Costs</p>
        <p className="subtitle">
          AI-powered platform providing transparency and simplicity for all payor models—unifying billing data, automating eligibility checks, and delivering clear financial insights in real time.
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {!hasSearched && (
        <div className="early-adopter-section">
          <div className="early-adopter-content">
            <h2>Early Adopter Program</h2>
            <p>
              We're launching a limited early-adopter program for healthcare organizations ready to lead with AI-powered billing transparency.
            </p>
            <div className="offer-details">
              <div className="offer-item">
                <span className="offer-icon">🎯</span>
                <div>
                  <strong>50% off</strong> standard pricing for the first 6 months
                </div>
              </div>
              <div className="offer-item">
                <span className="offer-icon">✨</span>
                <div>
                  <strong>Full access</strong> to all features and personalized onboarding
                </div>
              </div>
              <div className="offer-item">
                <span className="offer-icon">🤝</span>
                <div>
                  <strong>Direct access</strong> to experts and influence on development roadmap
                </div>
              </div>
            </div>
            <p className="cta-note">
              Schedule a brief discovery call to secure your spot and review a custom rollout plan.
            </p>
          </div>
        </div>
      )}

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
          background: rgba(255, 255, 255, 0.25);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .badge-icon {
          font-size: 1rem;
        }

        .header h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: 1.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35em;
        }

        .wave-logo {
          display: inline-block;
          width: 1.15em;
          height: 1em;
          background: linear-gradient(90deg, #20cceb 10%, #43b881 70%, #fac240);
          border-radius: 50% 55% 50% 50% / 60% 45% 55% 55%;
          box-shadow: 0 2px 9px rgba(32, 204, 235, 0.09);
        }

        .tagline {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          opacity: 0.95;
          color: #fac240;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.45;
        }

        .subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          margin-top: 1rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
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

        .early-adopter-section {
          margin: 3rem auto;
          max-width: 900px;
          padding: 0 1rem;
        }

        .early-adopter-content {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 1.25rem;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .early-adopter-content h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #fac240;
          text-align: center;
        }

        .early-adopter-content > p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          text-align: center;
          color: white;
          opacity: 0.95;
        }

        .offer-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
          margin: 2rem 0;
        }

        @media (min-width: 600px) {
          .offer-details {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .offer-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.8rem;
          gap: 0.5rem;
        }

        .offer-icon {
          font-size: 2rem;
        }

        .offer-item div {
          color: white;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .offer-item strong {
          color: #fac240;
          font-weight: 600;
        }

        .cta-note {
          text-align: center;
          font-size: 1rem;
          color: white;
          opacity: 0.9;
          margin-top: 1.5rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .wave-logo {
            width: 0.9em;
            height: 0.8em;
          }

          .subtitle {
            font-size: 1rem;
          }

          .tagline {
            font-size: 1.2rem;
          }

          .early-adopter-content {
            padding: 1.5rem 1.2rem;
          }

          .early-adopter-content h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}

