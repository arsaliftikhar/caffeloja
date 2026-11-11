'use client';

import { useState, useEffect } from 'react';
import { Lock, Smartphone, Copy, ShieldCheck, LogOut, UserCheck, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserSettingsPanel({ user, onUserUpdated, onLogout }) {
  // Profile & notifications
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.shippingAddress?.phone || '',
    commissions: user?.notificationPreferences?.commissions ?? true,
    shipping: user?.notificationPreferences?.shipping ?? true,
    security: user?.notificationPreferences?.security ?? true,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Google Authenticator (2FA)
  const [twoFactorSetup, setTwoFactorSetup] = useState(null); // { secret, otpauthUrl, qrUrl }
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [disableCodeOrPass, setDisableCodeOrPass] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || user.shippingAddress?.phone || '',
        commissions: user.notificationPreferences?.commissions ?? true,
        shipping: user.notificationPreferences?.shipping ?? true,
        security: user.notificationPreferences?.security ?? true,
      });
    }
  }, [user]);

  const callSettingsApi = async (payload) => {
    const token = localStorage.getItem('caffeloja_token');
    const res = await fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    setSavingProfile(true);
    try {
      const { ok, data } = await callSettingsApi({
        action: 'update_profile',
        name: profileForm.name,
        phone: profileForm.phone,
        notificationPreferences: {
          commissions: profileForm.commissions,
          shipping: profileForm.shipping,
          security: profileForm.security,
        },
      });
      if (ok && data.success) {
        onUserUpdated(data.user);
        toast.success(data.message || 'Account settings saved!');
      } else {
        toast.error(data.message || 'Unable to update settings.');
      }
    } catch {
      toast.error('Connection error while saving settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { ok, data } = await callSettingsApi({
        action: 'change_password',
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (ok && data.success) {
        toast.success(data.message || 'Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Unable to change password.');
      }
    } catch {
      toast.error('Connection error while changing password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorBusy(true);
    try {
      const { ok, data } = await callSettingsApi({ action: 'setup_2fa' });
      if (ok && data.success) {
        setTwoFactorSetup({
          secret: data.secret,
          otpauthUrl: data.otpauthUrl,
          qrUrl: data.qrUrl,
        });
        setTotpVerifyCode('');
      } else {
        toast.error(data.message || 'Unable to initialize Google Authenticator.');
      }
    } catch {
      toast.error('Connection error setting up 2FA.');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(totpVerifyCode.trim())) {
      toast.error('Enter the 6-digit code from Google Authenticator.');
      return;
    }

    setTwoFactorBusy(true);
    try {
      const { ok, data } = await callSettingsApi({
        action: 'enable_2fa',
        code: totpVerifyCode.trim(),
      });
      if (ok && data.success) {
        onUserUpdated(data.user);
        setTwoFactorSetup(null);
        setTotpVerifyCode('');
        toast.success(data.message || 'Google Authenticator enabled!');
      } else {
        toast.error(data.message || 'Verification failed.');
      }
    } catch {
      toast.error('Connection error enabling 2FA.');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    const val = disableCodeOrPass.trim();
    if (!val) {
      toast.error('Enter your 6-digit authenticator code or password.');
      return;
    }

    setTwoFactorBusy(true);
    try {
      const isSixDigits = /^\d{6}$/.test(val);
      const { ok, data } = await callSettingsApi({
        action: 'disable_2fa',
        code: isSixDigits ? val : undefined,
        password: isSixDigits ? undefined : val,
      });
      if (ok && data.success) {
        onUserUpdated(data.user);
        setShowDisableForm(false);
        setDisableCodeOrPass('');
        toast.success(data.message || 'Google Authenticator disabled.');
      } else {
        toast.error(data.message || 'Unable to disable 2FA.');
      }
    } catch {
      toast.error('Connection error disabling 2FA.');
    } finally {
      setTwoFactorBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="user-cards-grid-2" style={{ alignItems: 'start' }}>
        {/* 1. Profile & Notifications */}
        <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '22px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} style={{ color: 'var(--amber-light)' }} />
            <span>Profile &amp; Preferences</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="checkout-form">
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
            </div>

            <div className="form-field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#0d0907', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Referral Code</span>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--amber-light)', marginTop: '2px' }}>{user?.referralCode}</div>
              </div>
              <div style={{ background: '#0d0907', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sponsor Code</span>
                <div style={{ fontWeight: '600', fontSize: '0.88rem', marginTop: '2px' }}>{user?.sponsorCode || 'Direct'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--mocha-border)', paddingTop: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={14} style={{ color: 'var(--amber-light)' }} />
                <span>Email Notifications</span>
              </div>
              <div style={{ display: 'grid', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profileForm.commissions}
                    onChange={(e) => setProfileForm({ ...profileForm, commissions: e.target.checked })}
                    style={{ accentColor: 'var(--amber-primary)', width: '15px', height: '15px' }}
                  />
                  <span>Commission &amp; payout notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profileForm.shipping}
                    onChange={(e) => setProfileForm({ ...profileForm, shipping: e.target.checked })}
                    style={{ accentColor: 'var(--amber-primary)', width: '15px', height: '15px' }}
                  />
                  <span>Monthly Coffee Box shipping updates</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profileForm.security}
                    onChange={(e) => setProfileForm({ ...profileForm, security: e.target.checked })}
                    style={{ accentColor: 'var(--amber-primary)', width: '15px', height: '15px' }}
                  />
                  <span>Security &amp; password change alerts</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
            >
              <span>{savingProfile ? 'Saving...' : 'Save Profile & Preferences'}</span>
            </button>
          </form>
        </div>

        {/* 2. Change Password */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--amber-light)' }} />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="checkout-form">
              <div className="form-field">
                <label>Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
              >
                <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* 3. Google Authenticator (2FA) */}
          <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} style={{ color: 'var(--amber-light)' }} />
                <span>Google Authenticator (2FA)</span>
              </h3>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  background: user?.twoFactorEnabled ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                  border: user?.twoFactorEnabled ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--mocha-border)',
                  color: user?.twoFactorEnabled ? '#34d399' : 'var(--text-muted)',
                }}
              >
                {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '14px' }}>
              Add an extra layer of security by requiring a 6-digit verification code from Google Authenticator when signing in.
            </p>

            {user?.twoFactorEnabled ? (
              <div>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '0.84rem',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Google Authenticator is protecting your account.</span>
                </div>

                {!showDisableForm ? (
                  <button
                    type="button"
                    onClick={() => setShowDisableForm(true)}
                    className="btn-outline btn-sm"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', width: '100%', justifyContent: 'center' }}
                  >
                    Disable Google Authenticator
                  </button>
                ) : (
                  <form onSubmit={handleDisable2FA} className="checkout-form">
                    <div className="form-field">
                      <label>6-Digit Authenticator Code or Password *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter 6-digit code or account password"
                        value={disableCodeOrPass}
                        onChange={(e) => setDisableCodeOrPass(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="submit"
                        disabled={twoFactorBusy}
                        className="btn-outline btn-sm"
                        style={{ flex: 1, justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                      >
                        {twoFactorBusy ? 'Disabling...' : 'Confirm Disable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisableForm(false);
                          setDisableCodeOrPass('');
                        }}
                        className="btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : twoFactorSetup ? (
              <form onSubmit={handleEnable2FA} className="checkout-form">
                <div
                  style={{
                    background: '#0d0907',
                    border: '1px solid var(--mocha-border)',
                    borderRadius: '12px',
                    padding: '14px',
                    textAlign: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <img
                    src={twoFactorSetup.qrUrl}
                    alt="Google Authenticator QR Code"
                    style={{
                      width: '160px',
                      height: '160px',
                      margin: '0 auto 10px',
                      display: 'block',
                      borderRadius: '8px',
                      background: '#fff',
                      padding: '6px',
                    }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Scan QR code in Google Authenticator, or enter key manually:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <code style={{ fontSize: '0.8rem', color: 'var(--amber-light)', background: '#140e0a', padding: '4px 8px', borderRadius: '6px' }}>
                      {twoFactorSetup.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorSetup.secret);
                        toast.success('Setup key copied!');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.76rem',
                      }}
                    >
                      <Copy size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Enter 6-Digit Verification Code *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={totpVerifyCode}
                    onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ letterSpacing: '3px', fontWeight: '700' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={twoFactorBusy}
                    className="btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {twoFactorBusy ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoFactorSetup(null)}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStart2FASetup}
                disabled={twoFactorBusy}
                className="btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
              >
                <Smartphone size={15} />
                <span>{twoFactorBusy ? 'Generating Key...' : 'Set Up Google Authenticator'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Bar */}
      <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>Session Sign Out</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sign out of your Caffeloja member portal on this device.</span>
        </div>
        <button onClick={onLogout} className="btn-outline btn-sm" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}>
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

