'use client';

import { useState } from 'react';
import { CommunicationPreferences } from '@/lib/types';

export default function ProactiveCommunicationInterface() {
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    preferredMethod: 'email',
    frequency: 'daily',
    notificationTypes: {
      newAssistancePrograms: true,
      paymentReminders: true,
      billUpdates: true,
      eligibilityChanges: true,
      paymentPlanReminders: true,
    },
    smartAlerts: true,
    quietHours: { start: '22:00', end: '08:00' },
    priorityLevel: 'medium',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handlePreferenceChange = (key: keyof CommunicationPreferences, value: any) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleNotificationChange = (key: keyof typeof preferences.notificationTypes, value: boolean) => {
    setPreferences({
      ...preferences,
      notificationTypes: { ...preferences.notificationTypes, [key]: value },
    });
  };

  return (
    <div className="communication-interface">
      <div className="interface-header">
        <h3>📧 Proactive Communication Preferences</h3>
        <p className="interface-subtitle">
          Set up how BillHarmony communicates with you about financial assistance opportunities, bill reminders, and payment plan updates.
        </p>
      </div>

      <div className="preferences-section">
        <h4>Communication Method</h4>
        <div className="method-selector">
          {(['email', 'sms', 'phone', 'in-app'] as const).map((method) => (
            <label key={method} className="method-option">
              <input
                type="radio"
                name="method"
                value={method}
                checked={preferences.preferredMethod === method}
                onChange={(e) => handlePreferenceChange('preferredMethod', e.target.value)}
              />
              <span className="method-label">
                {method === 'email' && '📧 Email'}
                {method === 'sms' && '💬 SMS'}
                {method === 'phone' && '📞 Phone'}
                {method === 'in-app' && '🔔 In-App'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="preferences-section">
        <h4>Notification Frequency</h4>
        <div className="frequency-selector">
          {(['realtime', 'daily', 'weekly'] as const).map((freq) => (
            <label key={freq} className="frequency-option">
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={preferences.frequency === freq}
                onChange={(e) => handlePreferenceChange('frequency', e.target.value)}
              />
              <span className="frequency-label">
                {freq === 'realtime' && '⚡ Real-Time'}
                {freq === 'daily' && '📅 Daily Digest'}
                {freq === 'weekly' && '📆 Weekly Summary'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="preferences-section">
        <h4>Notification Types</h4>
        <div className="notification-types">
          {Object.entries({
            newAssistancePrograms: 'New Financial Assistance Programs',
            paymentReminders: 'Payment Reminders',
            billUpdates: 'Bill Updates',
            eligibilityChanges: 'Eligibility Status Changes',
            paymentPlanReminders: 'Payment Plan Reminders',
          }).map(([key, label]) => (
            <label key={key} className="notification-toggle">
              <input
                type="checkbox"
                checked={preferences.notificationTypes[key as keyof typeof preferences.notificationTypes]}
                onChange={(e) => handleNotificationChange(key as keyof typeof preferences.notificationTypes, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="preferences-section">
        <h4>Smart Alerts</h4>
        <label className="smart-alerts-toggle">
          <input
            type="checkbox"
            checked={preferences.smartAlerts}
            onChange={(e) => handlePreferenceChange('smartAlerts', e.target.checked)}
          />
          <span>Enable Smart Alerts</span>
          <p className="toggle-description">
            AI determines the best times to notify you based on your activity patterns
          </p>
        </label>
      </div>

      <div className="preferences-section">
        <h4>Quiet Hours</h4>
        <div className="quiet-hours">
          <label>
            Start:
            <input
              type="time"
              value={preferences.quietHours.start}
              onChange={(e) => handlePreferenceChange('quietHours', { ...preferences.quietHours, start: e.target.value })}
            />
          </label>
          <label>
            End:
            <input
              type="time"
              value={preferences.quietHours.end}
              onChange={(e) => handlePreferenceChange('quietHours', { ...preferences.quietHours, end: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="preferences-section">
        <h4>Priority Level</h4>
        <div className="priority-selector">
          {(['high', 'medium', 'low'] as const).map((level) => (
            <label key={level} className="priority-option">
              <input
                type="radio"
                name="priority"
                value={level}
                checked={preferences.priorityLevel === level}
                onChange={(e) => handlePreferenceChange('priorityLevel', e.target.value)}
              />
              <span className="priority-label">
                {level === 'high' && '🔴 High Priority'}
                {level === 'medium' && '🟡 Medium Priority'}
                {level === 'low' && '🟢 Low Priority'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="preview-section">
        <button className="preview-button" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Hide' : 'Show'} Communication Preview
        </button>
        {showPreview && (
          <div className="preview-content">
            <h4>Sample Communications</h4>
            <div className="preview-examples">
              <div className="preview-example email">
                <div className="preview-header">
                  <span className="preview-icon">📧</span>
                  <span>Email Example</span>
                </div>
                <div className="preview-body">
                  <p><strong>Subject:</strong> New Financial Assistance Program Available</p>
                  <p>Hi there,</p>
                  <p>We found a new financial assistance program that you may qualify for at Beverly Hills Medical Center. Based on your profile, you have an 85% chance of qualifying.</p>
                  <p>Estimated assistance: $2,500</p>
                  <p><a href="#">Learn more and apply →</a></p>
                </div>
              </div>

              <div className="preview-example sms">
                <div className="preview-header">
                  <span className="preview-icon">💬</span>
                  <span>SMS Example</span>
                </div>
                <div className="preview-body">
                  <p><strong>BillHarmony:</strong> New assistance program available! You may qualify for $2,500 at Beverly Hills Medical Center. Check eligibility: [link]</p>
                </div>
              </div>

              <div className="preview-example in-app">
                <div className="preview-header">
                  <span className="preview-icon">🔔</span>
                  <span>In-App Notification</span>
                </div>
                <div className="preview-body">
                  <p><strong>New Financial Assistance Opportunity</strong></p>
                  <p>Beverly Hills Medical Center has a new program you may qualify for. Estimated assistance: $2,500</p>
                  <button className="preview-action">Check Eligibility</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="save-section">
        <button className="save-button">Save Preferences</button>
        <button className="test-button" onClick={() => setShowPreview(true)}>Test Notification</button>
      </div>

      <style jsx>{`
        .communication-interface {
          padding: 0;
        }

        .interface-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .interface-header h3 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .interface-subtitle {
          color: #666;
          font-size: 1rem;
          line-height: 1.6;
        }

        .preferences-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .preferences-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .method-selector,
        .frequency-selector,
        .priority-selector {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .method-option,
        .frequency-option,
        .priority-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.75rem 1rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .method-option:hover,
        .frequency-option:hover,
        .priority-option:hover {
          border-color: #667eea;
        }

        .method-option input:checked + .method-label,
        .frequency-option input:checked + .frequency-label,
        .priority-option input:checked + .priority-label {
          color: #667eea;
          font-weight: 600;
        }

        .method-option input:checked ~ *,
        .frequency-option input:checked ~ *,
        .priority-option input:checked ~ * {
          border-color: #667eea;
        }

        .method-option input[type="radio"]:checked ~ .method-label,
        .frequency-option input[type="radio"]:checked ~ .frequency-label,
        .priority-option input[type="radio"]:checked ~ .priority-label {
          color: #667eea;
        }

        .notification-types {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .notification-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
        }

        .notification-toggle input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .smart-alerts-toggle {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
        }

        .smart-alerts-toggle input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .toggle-description {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .quiet-hours {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .quiet-hours label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quiet-hours input[type="time"] {
          padding: 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .preview-section {
          margin-top: 2rem;
        }

        .preview-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .preview-button:hover {
          transform: translateY(-2px);
        }

        .preview-content {
          margin-top: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .preview-content h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .preview-examples {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-example {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border-left: 4px solid #667eea;
        }

        .preview-example.email {
          border-left-color: #2196f3;
        }

        .preview-example.sms {
          border-left-color: #4caf50;
        }

        .preview-example.in-app {
          border-left-color: #ff9800;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #333;
        }

        .preview-icon {
          font-size: 1.2rem;
        }

        .preview-body {
          color: #666;
          line-height: 1.6;
        }

        .preview-body p {
          margin: 0.5rem 0;
        }

        .preview-body a {
          color: #667eea;
          text-decoration: none;
        }

        .preview-action {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-section {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .save-button,
        .test-button {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .save-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .test-button {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .save-button:hover,
        .test-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .method-selector,
          .frequency-selector,
          .priority-selector {
            flex-direction: column;
          }

          .quiet-hours {
            flex-direction: column;
            align-items: flex-start;
          }

          .save-section {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

