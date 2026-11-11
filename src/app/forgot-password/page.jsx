'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResetUrl(data.resetUrl || `/reset-password?email=${encodeURIComponent(email)}`);
        setSubmitted(true);
        toast.success('Password reset instructions generated!');
      } else {
        const msg = data.message || 'Unable to process request. Please check your email.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Connection error. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="affiliate-dashboard-wrap">
      <div className="container">
        <div
          className="affiliate-auth-card"
          style={{
            maxWidth: '460px',
            margin: '10px auto 60px',
            background: '#140e0a',
            border: '1px solid var(--mocha-border)',
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 38px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
              alt="separator"
              style={{ margin: '0 auto 12px', display: 'block' }}
            />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', margin: '0 0 6px' }}>
              Forgot Password
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
              Enter your account email address to reset your password.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                marginBottom: '18px',
              }}
            >
              {error}
            </div>
          )}

          {submitted ? (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '10px 0' }}>
              <CheckCircle2 size={38} style={{ color: 'var(--amber-light)', margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '8px' }}>
                Account Verified
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '22px' }}>
                We found your account for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Click below to set your new password.
              </p>

              <Link
                href={resetUrl}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '14px' }}
              >
                <span>Reset Password Now</span>
                <ArrowRight size={17} />
              </Link>

              <div>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
              >
                <span>{isLoading ? 'Verifying...' : 'Continue to Reset Password'}</span>
              </button>

              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

