'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [emailInput, setEmailInput] = useState(emailParam);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmailInput(emailParam);
    }

    if (!token || !emailParam) {
      setStatus('error');
      setMessage('Missing verification token or email. Please check your email link or request a new one.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: emailParam }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
          if (data.token && data.user) {
            localStorage.setItem('caffeloja_token', data.token);
            localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification link is invalid or has expired.');
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Network error while verifying email. Please try again.');
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, emailParam]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendSuccess(true);
        toast.success(data.message || 'Verification email sent!');
      } else {
        toast.error(data.message || 'Unable to send verification email.');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        background: '#140e0a',
        border: '1px solid var(--mocha-border)',
        borderRadius: '24px',
        padding: 'clamp(28px, 5vw, 42px)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
      }}
    >
      <img
        src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
        alt="separator"
        style={{ margin: '0 auto 16px', display: 'block' }}
      />

      {status === 'verifying' && (
        <div className="animate-fadeIn" style={{ padding: '20px 0' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              border: '3px solid rgba(212, 163, 115, 0.2)',
              borderTopColor: 'var(--amber-light)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', margin: '0 0 8px' }}>
            Verifying Your Email...
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Connecting with Caffeloja security verification. Please hold on a moment.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-fadeIn">
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', margin: '0 0 10px' }}>
            Email Verified!
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '26px' }}>
            {message}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/user/dashboard"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Go to Member Dashboard</span>
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/menu"
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Explore Coffee Menu</span>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-fadeIn">
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ef4444',
            }}
          >
            <AlertCircle size={36} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', margin: '0 0 10px' }}>
            Verification Problem
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            {message}
          </p>

          {resendSuccess ? (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--success)',
                padding: '14px',
                borderRadius: '12px',
                color: 'var(--success)',
                fontSize: '0.9rem',
                marginBottom: '20px',
              }}
            >
              ✓ A fresh verification link has been sent to <strong>{emailInput}</strong>. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={handleResend} style={{ textAlign: 'left', marginBottom: '22px' }}>
              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.85rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d0907',
                    border: '1px solid var(--mocha-border)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
            </form>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '14px' }}>
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
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '130px',
        paddingBottom: '80px',
        background: 'radial-gradient(circle at 50% 20%, rgba(212, 163, 115, 0.06) 0%, transparent 50%), var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="container">
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>
              Loading verification...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

