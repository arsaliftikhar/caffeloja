'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenParam || undefined,
          email: email || undefined,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
      } else {
        const msg = data.message || 'Unable to reset password. Please try again.';
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
          Reset Password
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
          Choose a new password for your Caffeloja account.
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

      {success ? (
        <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '10px 0' }}>
          <CheckCircle2 size={38} style={{ color: 'var(--amber-light)', margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '8px' }}>
            Password Updated
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '22px' }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>

          <Link
            href="/login"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Sign In Now</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="checkout-form">
          {!tokenParam && (
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
          )}

          <div className="form-field">
            <label>New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          <div className="form-field">
            <label>Confirm New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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
            <span>{isLoading ? 'Updating Password...' : 'Update Password'}</span>
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="affiliate-dashboard-wrap">
      <div className="container">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

