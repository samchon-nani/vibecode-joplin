'use client';

import { useState } from 'react';

export default function EPICIntegrationDemo() {
  const [activeView, setActiveView] = useState<'overview' | 'workflow' | 'benefits'>('overview');

  return (
    <div className="epic-integration-demo">
      <div className="demo-header">
        <h3>🏥 EPIC Integration</h3>
        <p className="demo-subtitle">
          Seamless integration with EPIC MyChart for a unified patient experience
        </p>
      </div>

      <div className="demo-tabs">
        <button
          className={`demo-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`demo-tab ${activeView === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveView('workflow')}
        >
          Workflow
        </button>
        <button
          className={`demo-tab ${activeView === 'benefits' ? 'active' : ''}`}
          onClick={() => setActiveView('benefits')}
        >
          Benefits
        </button>
      </div>

      <div className="demo-content">
        {activeView === 'overview' && (
          <div className="overview-view">
            <div className="integration-mockup">
              <div className="epic-header">
                <div className="epic-logo">EPIC MyChart</div>
                <div className="epic-nav">
                  <span>Home</span>
          <span className="active">BillHarmony</span>
                  <span>Messages</span>
                  <span>Test Results</span>
                </div>
              </div>
              <div className="epic-content">
                <div className="billharmony-banner">
                  <h4>BillHarmony - Financial Navigation</h4>
                  <p>Compare prices, check charity eligibility, and find financial assistance</p>
                </div>
                <div className="epic-integration-preview">
                  <div className="preview-card">
                    <div className="preview-icon">💰</div>
                    <h5>Price Comparison</h5>
                    <p>Compare hospital prices for your upcoming procedure</p>
                    <button className="preview-action">Get Started</button>
                  </div>
                  <div className="preview-card">
                    <div className="preview-icon">🤝</div>
                    <h5>Financial Assistance</h5>
                    <p>Check eligibility for charity care programs</p>
                    <button className="preview-action">Check Eligibility</button>
                  </div>
                  <div className="preview-card">
                    <div className="preview-icon">📅</div>
                    <h5>Payment Plans</h5>
                    <p>Explore flexible payment options</p>
                    <button className="preview-action">View Plans</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="integration-info">
              <h4>Integration Overview</h4>
              <p>
                BillHarmony seamlessly integrates with EPIC MyChart, allowing patients to access
                financial navigation tools directly from their patient portal. This integration
                provides a unified experience where patients can manage both their health records
                and financial planning in one place.
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-icon">🔐</span>
                  <div>
                    <strong>Single Sign-On</strong>
                    <p>Access BillHarmony with your MyChart credentials</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  <div>
                    <strong>Automatic Data Sync</strong>
                    <p>Your procedure information syncs automatically</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔄</span>
                  <div>
                    <strong>Real-Time Updates</strong>
                    <p>Get instant notifications about financial assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'workflow' && (
          <div className="workflow-view">
            <h4>Integration Workflow</h4>
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Access from MyChart</h5>
                  <p>Patients log into EPIC MyChart and navigate to the BillHarmony section</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Automatic Data Population</h5>
                  <p>BillHarmony automatically retrieves procedure information and insurance details from EPIC</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Price Comparison</h5>
                  <p>Patients can compare prices across different hospitals for their scheduled procedures</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Financial Assistance</h5>
                  <p>Check eligibility for charity care programs and financial assistance</p>
                </div>
              </div>
              <div className="workflow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h5>Results in MyChart</h5>
                  <p>Financial assistance results and recommendations are saved back to MyChart for easy reference</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'benefits' && (
          <div className="benefits-view">
            <h4>Benefits of EPIC Integration</h4>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎯</div>
                <h5>Unified Experience</h5>
                <p>Access financial navigation tools without leaving your patient portal</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">⚡</div>
                <h5>Time Savings</h5>
                <p>No need to re-enter information - data syncs automatically from EPIC</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🔒</div>
                <h5>Enhanced Security</h5>
                <p>Leverage EPIC's robust security and authentication systems</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📱</div>
                <h5>Mobile Access</h5>
                <p>Access BillHarmony features through the MyChart mobile app</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📋</div>
                <h5>Integrated Records</h5>
                <p>Financial assistance information is stored alongside medical records</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🔔</div>
                <h5>Proactive Notifications</h5>
                <p>Receive notifications about new financial assistance opportunities</p>
              </div>
            </div>

            <div className="technical-info">
              <h4>Technical Details</h4>
              <div className="tech-grid">
                <div className="tech-item">
                  <strong>Integration Method:</strong>
                  <p>EPIC App Orchard Integration</p>
                </div>
                <div className="tech-item">
                  <strong>Authentication:</strong>
                  <p>OAuth 2.0 with EPIC MyChart</p>
                </div>
                <div className="tech-item">
                  <strong>Data Exchange:</strong>
                  <p>FHIR R4 API for patient data</p>
                </div>
                <div className="tech-item">
                  <strong>Compliance:</strong>
                  <p>HIPAA and CMS compliant</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="demo-footer">
        <a href="/docs/EPIC_INTEGRATION.md" className="docs-link">
          📖 View Full Documentation →
        </a>
        <button className="request-button">Request Integration</button>
      </div>

      <style jsx>{`
        .epic-integration-demo {
          padding: 0;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .demo-header h3 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .demo-subtitle {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
        }

        .demo-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: #f8f9fa;
          padding: 0.5rem;
          border-radius: 12px;
        }

        .demo-tab {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-tab:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .demo-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .demo-content {
          min-height: 400px;
        }

        .integration-mockup {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .epic-header {
          background: linear-gradient(135deg, #003366 0%, #004080 100%);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .epic-logo {
          font-weight: 700;
          font-size: 1.2rem;
        }

        .epic-nav {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
        }

        .epic-nav span {
          opacity: 0.7;
          cursor: pointer;
        }

        .epic-nav span.active {
          opacity: 1;
          font-weight: 600;
          border-bottom: 2px solid white;
        }

        .epic-content {
          padding: 2rem;
        }

        .billharmony-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .billharmony-banner h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .billharmony-banner p {
          margin: 0;
          opacity: 0.9;
        }

        .epic-integration-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .preview-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .preview-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .preview-card h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .preview-card p {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .preview-action {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .integration-info {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .integration-info h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .integration-info p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          gap: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }

        .info-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .info-item strong {
          display: block;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .info-item p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .workflow-view h4,
        .benefits-view h4 {
          margin: 0 0 2rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .workflow-steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .workflow-step {
          display: flex;
          gap: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .step-content h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .step-content p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .benefit-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .benefit-card h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .benefit-card p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .technical-info {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .technical-info h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .tech-item {
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }

        .tech-item strong {
          display: block;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .tech-item p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .demo-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e0e0e0;
        }

        .docs-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .docs-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .request-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .request-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .epic-nav {
            display: none;
          }

          .epic-integration-preview {
            grid-template-columns: 1fr;
          }

          .workflow-step {
            flex-direction: column;
          }

          .demo-footer {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

