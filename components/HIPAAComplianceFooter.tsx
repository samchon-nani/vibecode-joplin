'use client';

export default function HIPAAComplianceFooter() {
  return (
    <footer className="hipaa-footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="compliance-badges">
            <div className="hipaa-badge-footer">
              <span className="badge-icon">🔒</span>
              <span>HIPAA Compliant</span>
            </div>
            <div className="cms-badge-footer">
              <span className="badge-icon">🏛️</span>
              <span>CMS Compliant</span>
            </div>
          </div>
          <p className="compliance-text">
            All patient data is encrypted and stored securely in compliance with HIPAA regulations.
            BillHarmony helps hospitals comply with CMS Hospital Price Transparency requirements.
            Your privacy and security are our top priorities.
          </p>
          <div className="cms-info">
            <h5>CMS Price Transparency</h5>
            <p className="cms-text">
              BillHarmony complies with CMS Hospital Price Transparency Rule, providing machine-readable files
              and clear pricing information to help patients make informed healthcare decisions.
            </p>
            <a href="#cms-compliance" className="cms-link">Learn more about CMS compliance →</a>
          </div>
        </div>
        <div className="footer-section">
          <h4>BillHarmony</h4>
          <p className="tagline-footer">Bringing Clarity to Care Costs</p>
        </div>
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 BillHarmony. All rights reserved.</p>
      </div>

      <style jsx>{`
        .hipaa-footer {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          margin-top: 4rem;
          padding: 2rem 1rem;
          color: white;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .compliance-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .hipaa-badge-footer,
        .cms-badge-footer {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .compliance-text {
          font-size: 0.9rem;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0 0 1rem 0;
        }

        .cms-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .cms-info h5 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .cms-text {
          font-size: 0.85rem;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0 0 0.5rem 0;
        }

        .cms-link {
          color: white;
          text-decoration: none;
          font-size: 0.85rem;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .cms-link:hover {
          opacity: 1;
          text-decoration: underline;
        }

        .tagline-footer {
          font-size: 0.9rem;
          font-style: italic;
          opacity: 0.9;
          margin: 0.5rem 0 0 0;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
          color: white;
          text-decoration: none;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .footer-section ul li a:hover {
          opacity: 1;
          text-decoration: underline;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
}

