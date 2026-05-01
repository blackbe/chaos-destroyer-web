# HugBack Feature #71: Lawyer-written Terms of Service and Privacy Policy

I'll build a complete implementation with Terms of Service, Privacy Policy, and related legal pages for HugBack.

---

[FILE: src/components/Legal/TermsOfService.js]
```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Legal.css';

const TermsOfService = ({ onAccept, onDecline, isModal = false }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (!accepted) return;
    if (onAccept) {
      onAccept();
    } else {
      localStorage.setItem('termsAccepted', JSON.stringify({ date: new Date(), version: '1.0' }));
      window.location.href = '/';
    }
  };

  return (
    <div className={`legal-container ${isModal ? 'legal-modal' : 'legal-page'}`}>
      <div className="legal-header">
        <h1>Terms of Service</h1>
        <p className="legal-last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content" onScroll={handleScroll}>
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using HugBack ("Service"), you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not use this
            service.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software)
            on HugBack for personal, non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on HugBack</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            <li>Harass, abuse, or harm another person through the Service</li>
            <li>Use the Service for any illegal purpose or in violation of any applicable laws</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Disclaimer</h2>
          <p>
            The materials on HugBack are provided on an 'as is' basis. HugBack makes no warranties, expressed
            or implied, and hereby disclaims and negates all other warranties including, without limitation,
            implied warranties or conditions of merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of rights.
          </p>
          <p>
            <strong>IMPORTANT:</strong> HugBack is a peer support and mental wellness platform and is NOT a
            substitute for professional mental health treatment. If you are experiencing a mental health crisis,
            please contact emergency services or a crisis helpline immediately.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Limitations</h2>
          <p>
            In no event shall HugBack or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or
            inability to use the materials on HugBack, even if HugBack or an authorized representative has been
            notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on HugBack could include technical, typographical, or photographic errors.
            HugBack does not warrant that any of the materials on the Service are accurate, complete, or current.
            HugBack may make changes to the materials contained on the Service at any time without notice.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Materials on HugBack</h2>
          <p>
            HugBack has not reviewed all of the sites linked to its website and is not responsible for the
            contents of any such linked site. The inclusion of any link does not imply endorsement by HugBack of
            the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Modifications</h2>
          <p>
            HugBack may revise these terms of service for the Service at any time without notice. By using the
            Service, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the United
            States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Post any abusive, obscene, profane, slanderous, or inflammatory material</li>
            <li>Impersonate or attempt to impersonate any person or entity</li>
            <li>Share others' personal information without consent</li>
            <li>Engage in harassment, bullying, or threatening behavior</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>10. Content Ownership</h2>
          <p>
            You retain all ownership rights to any content you create and share on HugBack ("User Content").
            However, by submitting User Content, you grant HugBack a worldwide, non-exclusive, royalty-free
            license to use, reproduce, modify, and distribute such content for the purposes of operating and
            improving the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Intellectual Property Rights</h2>
          <p>
            Unless otherwise stated, HugBack and/or its licensors own the intellectual property rights for all
            material on the Service. All intellectual property rights are reserved. You may view and print pages
            from the Service for personal use, subject to restrictions set in these terms and conditions.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Account Termination</h2>
          <p>
            HugBack reserves the right to suspend or terminate your account without prior notice if you violate
            these Terms of Service or engage in conduct that HugBack believes is harmful, abusive, or violates
            any applicable laws.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:{' '}
            <a href="mailto:legal@hugback.com">legal@hugback.com</a>
          </p>
        </section>
      </div>

      <div className="legal-actions">
        <label className="legal-checkbox">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            disabled={!scrolledToBottom && isModal}
            aria-label="I agree to the Terms of Service"
          />
          <span>I agree to the Terms of Service</span>
        </label>

        {isModal && (
          <div className="legal-buttons">
            <button
              className="legal-btn legal-btn-secondary"
              onClick={onDecline}
              aria-label="Decline terms and close"
            >
              Decline
            </button>
            <button
              className="legal-btn legal-btn-primary"
              onClick={handleAccept}
              disabled={!accepted}
              aria-label="Accept terms and continue"
            >
              Accept & Continue
            </button>
          </div>
        )}

        {!isModal && (
          <div className="legal-buttons">
            <button
              className="legal-btn legal-btn-primary"
              onClick={handleAccept}
              disabled={!accepted}
              aria-label="Accept terms and return home"
            >
              Accept & Return Home
            </button>
          </div>
        )}

        {!scrolledToBottom && isModal && (
          <p className="legal-scroll-notice">📜 Please scroll to the bottom to accept</p>
        )}
      </div>
    </div>
  );
};

TermsOfService.propTypes = {
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  isModal: PropTypes.bool,
};

export default TermsOfService;
```

---

[FILE: src/components/Legal/PrivacyPolicy.js]
```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Legal.css';

const PrivacyPolicy = ({ onAccept, onDecline, isModal = false }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setScrolledToBottom(isAtBottom);
  };

  const handleAccept = () => {
    if (!accepted) return;
    if (onAccept) {
      onAccept();
    } else {
      localStorage.setItem('privacyAccepted', JSON.stringify({ date: new Date(), version: '1.0' }));
      window.location.href = '/';
    }
  };

  return (
    <div className={`legal-container ${isModal ? 'legal-modal' : 'legal-page'}`}>
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="legal-last-updated">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content" onScroll={handleScroll}>
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            HugBack ("we", "us", "our", or "Company") operates the HugBack website and mobile application
            ("Service"). This page informs you of our policies regarding the collection, use, and disclosure of
            personal data when you use our Service and the choices you have associated with that data.
          </p>
          <p>
            We use your data to provide and improve the Service. By using HugBack, you agree to the collection
            and use of information in accordance with this policy.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Types of Data Collected</h2>

          <h3>2.1 Personal Data</h3>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information
            that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:</p>
          <ul>
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number (optional)</li>
            <li>Cookies and Usage Data</li>
            <li>Profile information (optional photos, bio, interests)</li>
            <li>Mental health-related information you choose to share</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <p>
            We may also collect information on how the Service is accessed and used ("Usage Data"). This may include
            information such as:
          </p>
          <ul>
            <li>Your device's Internet Protocol address (e.g. IP address)</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on those pages</li>
            <li>Time and date of your visit</li>
            <li>Device identifiers</li>
            <li>Clickstream data</li>
          </ul>

          <h3>2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and hold certain
            information. Cookies are files with small amounts of data which may include an anonymous unique
            identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to alert you when cookies are being sent.
            However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Use of Data</h2>
          <p>HugBack uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer care and support</li>
            <li>To gather analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues and fraudulent activity</li>
            <li>To provide you with news, special offers and general information about other goods, services and events</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the
            Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
            means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
          <p>
            All communications between you and HugBack, including sensitive information like messages and mental
            health content, are encrypted using industry-standard security protocols.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Data Retention</h2>
          <p>
            HugBack will retain your Personal Data only for as long as necessary for the purposes set out in this
            Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our
            legal obligations.
          </p>
          <p>
            If you request deletion of your account, we will remove your Personal Data from our active systems
            within 30 days, except where we are required to retain it for legal, tax, or compliance purposes.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Transfer of Data</h2>
          <p>
            Your information, including Personal Data, may be transferred to — and maintained on — computers
            located outside of your state, province, country or other governmental jurisdiction where the data
            protection laws may differ than those from your jurisdiction.
          </p>
          <p>
            If you are located outside the United States and choose to provide information to
