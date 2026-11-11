'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('caffeloja_cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('caffeloja_cookie_consent', 'accepted');
    } catch {}
    setVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('caffeloja_cookie_consent', 'dismissed');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-consent-card animate-fadeIn"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1300,
        width: 'calc(100vw - 40px)',
        maxWidth: '340px',
        background: '#140e0a',
        border: '1px solid rgba(200, 125, 40, 0.32)',
        borderRadius: '16px',
        padding: '18px 20px',
        boxShadow: '0 18px 42px rgba(0, 0, 0, 0.65)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <h4
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.02rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Cookie Notice
        </h4>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close cookie notice"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={15} />
        </button>
      </div>

      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.55',
          margin: '0 0 14px',
        }}
      >
        We use cookies to improve your experience and remember your preferences. Read our{' '}
        <Link
          href="/privacy-policy"
          style={{ color: 'var(--amber-light)', textDecoration: 'underline' }}
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={handleAccept}
          className="btn-primary btn-sm"
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '8px 14px',
            fontSize: '0.82rem',
          }}
        >
          <span>Accept Cookies</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-outline btn-sm"
          style={{
            padding: '8px 12px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
}

