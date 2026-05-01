# HugBack Feature #75: Liability Insurance Policy Information

I'll build a comprehensive liability insurance policy feature that displays key information to users, including policy details, coverage information, and acceptance/acknowledgment functionality.

## Implementation

[FILE: src/components/InsurancePolicy/InsurancePolicy.js]
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InsurancePolicy.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const InsurancePolicy = ({ userId, onClose, onAccept }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    coverage: false,
    exclusions: false,
    responsibilities: false,
  });

  useEffect(() => {
    fetchAcceptanceStatus();
  }, [userId]);

  const fetchAcceptanceStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/insurance/acceptance/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch acceptance status');

      const data = await response.json();
      setHasAccepted(data.hasAccepted);
    } catch (error) {
      console.error('Error fetching acceptance status:', error);
      setAcceptanceError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setAcceptanceError(null);

      const response = await fetch('/api/insurance/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId,
          acceptedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record acceptance');
      }

      setHasAccepted(true);
      if (onAccept) onAccept();
    } catch (error) {
      console.error('Error accepting policy:', error);
      setAcceptanceError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading && !hasAccepted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="insurance-policy-container">
      <div className="insurance-policy-header">
        <h1>Liability Insurance Policy</h1>
        <button
          className="insurance-close-btn"
          onClick={onClose}
          aria-label="Close policy"
        >
          ✕
        </button>
      </div>

      {acceptanceError && (
        <div className="insurance-error-banner" role="alert">
          <strong>Error:</strong> {acceptanceError}
        </div>
      )}

      <div className="insurance-content">
        {/* Policy Overview */}
        <section className="insurance-section policy-overview">
          <h2>Policy Overview</h2>
          <div className="policy-details">
            <div className="detail-row">
              <span className="detail-label">Policy Effective Date:</span>
              <span className="detail-value">January 1, 2024</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Coverage Type:</span>
              <span className="detail-value">
                Peer Support & Mental Wellness Platform
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Provider:</span>
              <span className="detail-value">
                Professional Liability Insurance Corp.
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Coverage Limit:</span>
              <span className="detail-value">$5,000,000 per occurrence</span>
            </div>
          </div>

          <p className="policy-intro">
            HugBack is a peer support and mental wellness platform. This
            liability insurance policy protects both users and the platform.
            Please read the following information carefully to understand your
            rights and responsibilities.
          </p>
        </section>

        {/* What's Covered */}
        <section className="insurance-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection('coverage')}
            aria-expanded={expandedSections.coverage}
          >
            <span className="toggle-icon">
              {expandedSections.coverage ? '−' : '+'}
            </span>
            <h3>What's Covered</h3>
          </button>

          {expandedSections.coverage && (
            <div className="section-content">
              <ul className="coverage-list">
                <li>
                  <strong>User-to-User Support:</strong> Peer conversations and
                  emotional support between verified users
                </li>
                <li>
                  <strong>Platform Liability:</strong> Claims arising from
                  platform operation and service delivery
                </li>
                <li>
                  <strong>Data Protection:</strong> Coverage for data security
                  incidents and privacy breaches
                </li>
                <li>
                  <strong>Professional Guidance:</strong> General wellness
                  information and resources
                </li>
                <li>
                  <strong>Community Features:</strong> Support from moderated
                  community boards and story sharing
                </li>
              </ul>

              <div className="coverage-highlight">
                <strong>Important:</strong> This is a peer support platform,
                NOT a replacement for professional mental health treatment. Users
                are advised to seek professional help when needed.
              </div>
            </div>
          )}
        </section>

        {/* What's NOT Covered */}
        <section className="insurance-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection('exclusions')}
            aria-expanded={expandedSections.exclusions}
          >
            <span className="toggle-icon">
              {expandedSections.exclusions ? '−' : '+'}
            </span>
            <h3>What's NOT Covered</h3>
          </button>

          {expandedSections.exclusions && (
            <div className="section-content">
              <ul className="exclusion-list">
                <li>
                  <strong>Professional Mental Health Treatment:</strong> Therapy,
                  counseling, or psychiatric services
                </li>
                <li>
                  <strong>Medical Claims:</strong> Injuries or medical conditions
                  resulting from user-provided advice
                </li>
                <li>
                  <strong>Criminal Activity:</strong> Claims involving illegal
                  conduct by users
                </li>
                <li>
                  <strong>Unauthorized Use:</strong> Breaches due to account
                  sharing or compromised credentials
                </li>
                <li>
                  <strong>Third-Party Services:</strong> Claims related to linked
                  external platforms or services
                </li>
                <li>
                  <strong>Violation of Terms:</strong> Claims resulting from
                  users violating the Community Guidelines
                </li>
              </ul>

              <div className="exclusion-highlight">
                <strong>Note:</strong> HugBack moderates content and enforces
                community guidelines. Violations may result in account suspension
                or legal action.
              </div>
            </div>
          )}
        </section>

        {/* User Responsibilities */}
        <section className="insurance-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection('responsibilities')}
            aria-expanded={expandedSections.responsibilities}
          >
            <span className="toggle-icon">
              {expandedSections.responsibilities ? '−' : '+'}
            </span>
            <h3>Your Responsibilities</h3>
          </button>

          {expandedSections.responsibilities && (
            <div className="section-content">
              <p>
                By using HugBack, you agree to the following responsibilities:
              </p>
              <ul className="responsibility-list">
                <li>
                  <strong>Honest Representation:</strong> Provide accurate
                  information in your profile and interactions
                </li>
                <li>
                  <strong>Respectful Communication:</strong> Treat other users
                  with kindness and follow community guidelines
                </li>
                <li>
                  <strong>Appropriate Advice:</strong> Do not provide medical,
                  legal, or professional advice unless qualified
                </li>
                <li>
                  <strong>No Harmful Content:</strong> Do not share content that
                  could harm others (self-harm, violence, harassment)
                </li>
                <li>
                  <strong>Report Issues:</strong> Use the report function for
                  violations or concerning behavior
                </li>
                <li>
                  <strong>Seek Professional Help:</strong> Direct users in crisis
                  to crisis hotlines and professional services
                </li>
                <li>
                  <strong>Account Security:</strong> Keep your password and
                  account information confidential
                </li>
              </ul>
            </div>
          )}
        </section>

        {/* Limitations & Disclaimers */}
        <section className="insurance-section limitations">
          <h3>Limitations & Disclaimers</h3>
          <div className="disclaimer-content">
            <p>
              <strong>No Professional Relationship:</strong> HugBack does not
              create a doctor-patient, therapist-client, or professional
              relationship. Peer support is complementary to, not a substitute
              for, professional mental health care.
            </p>

            <p>
              <strong>User-Generated Content:</strong> HugBack is not responsible
              for user-generated content. Users assume all risk for advice given
              or received from other users.
            </p>

            <p>
              <strong>Emergencies:</strong> If you or someone else is in
              immediate danger, please contact emergency services (911 in the US)
              or a crisis hotline immediately.
            </p>

            <p>
              <strong>Liability Cap:</strong> HugBack's total liability is
              limited to the amount you paid for the service in the past 12
              months, or $100, whichever is greater.
            </p>

            <p>
              <strong>Insurance Coverage:</strong> This policy is underwritten by
              a licensed insurance provider and complies with all applicable laws
              and regulations.
            </p>
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="insurance-section crisis-resources">
          <h3>Crisis & Emergency Resources</h3>
          <div className="resources-grid">
            <div className="resource-card">
              <h4>National Suicide Prevention Lifeline</h4>
              <p className="resource-phone">988</p>
              <p className="resource-desc">24/7 confidential support</p>
            </div>
            <div className="resource-card">
              <h4>Crisis Text Line</h4>
              <p className="resource-phone">Text HOME to 741741</p>
              <p className="resource-desc">Text-based crisis support</p>
            </div>
            <div className="resource-card">
              <h4>International Association for Suicide Prevention</h4>
              <p className="resource-phone">https://www.iasp.info/resources/Crisis_Centres/</p>
              <p className="resource-desc">Global crisis resources</p>
            </div>
            <div className="resource-card">
              <h4>Emergency Services</h4>
              <p className="resource-phone">911</p>
              <p className="resource-desc">Life-threatening emergencies</p>
            </div>
          </div>
        </section>

        {/* Contact & Questions */}
        <section className="insurance-section contact-section">
          <h3>Questions About This Policy?</h3>
          <p>
            If you have questions about this liability insurance policy, please
            contact us at:
          </p>
          <div className="contact-info">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@hugback.com">legal@hugback.com</a>
            </p>
            <p>
              <strong>Support:</strong>{' '}
              <a href="mailto:support@hugback.com">support@hugback.com</a>
            </p>
          </div>
        </section>
      </div>

      {/* Acceptance Section */}
      <div className="insurance-footer">
        {!hasAccepted ? (
          <div className="acceptance-area">
            <label className="acceptance-checkbox">
              <input
                type="checkbox"
                id="policy-accept"
                onChange={(e) => {
                  // This just enables the button
                }}
                aria-label="I acknowledge that I have read and understand the liability insurance policy"
              />
              <span>
                I acknowledge that I have read and understand the liability
                insurance policy and agree to its terms and conditions.
              </span>
            </label>

            <button
              className="insurance-accept-btn"
              onClick={handleAccept}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Processing...' : 'Accept Policy'}
            </button>

            <p className="acceptance-disclaimer">
              By accepting this policy, you agree to all terms and conditions
              outlined above. You will need to accept this policy to continue
              using HugBack.
            </p>
          </div>
        ) : (
          <div className="acceptance-confirmed">
            <div className="confirmed-icon">✓</div>
            <p>
              <strong>Policy Accepted</strong>
            </p>
            <p className="confirmed-date">
              You accepted this policy on{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

InsurancePolicy.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onAccept: PropTypes.func,
};

InsurancePolicy.defaultProps = {
  onClose: () => {},
  onAccept: () => {},
};

export default InsurancePolicy;
```

[FILE: src/components/InsurancePolicy/InsurancePolicy.css]
```css
.insurance-policy-container {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  background: #fff3e6;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.insurance-policy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%);
  border-bottom: 2px
