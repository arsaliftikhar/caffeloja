'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  Lock,
  Smartphone,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'security'
  const [loading, setLoading] = useState(true);

  // Store & Contact Settings state
  const [storeSettings, setStoreSettings] = useState({
    contactEmail: 'caffeloja77@gmail.com',
    supportPhone: '(+1) 504 327 9670',
    resendConfigured: true,
    resendFromEmail: 'Caffeloja <noreply@caffeloja.com>',
  });
  const [savingStore, setSavingStore] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Admin User Profile & 2FA state
  const [adminUser, setAdminUser] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA Setup state
  const [twoFactorSetup, setTwoFactorSetup] = useState(null); // { secret, qrUrl, otpauthUrl }
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [disabling2fa, setDisabling2fa] = useState(false);
  const [disableAuthInput, setDisableAuthInput] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [busy2fa, setBusy2fa] = useState(false);

  useEffect(() => {
    loadSettingsAndUser();
  }, []);

  const loadSettingsAndUser = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;

    try {
      // 1. Fetch Admin Settings
      const sRes = await fetch('/api/admin/settings');
      const sData = await sRes.json();
      if (sData.success && sData.data) {
        setStoreSettings({
          contactEmail: sData.data.contactEmail || 'caffeloja77@gmail.com',
          supportPhone: sData.data.supportPhone || '(+1) 504 327 9670',
          resendConfigured: sData.data.resendConfigured ?? true,
          resendFromEmail: sData.data.resendFromEmail || 'Caffeloja <noreply@caffeloja.com>',
        });
      }

      // 2. Fetch Admin User details (/api/auth/me)
      if (token) {
        const uRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uData = await uRes.json();
        if (uData.success && uData.user) {
          setAdminUser(uData.user);
        }
      }
    } catch (e) {
      console.error('Failed to load admin settings or user', e);
      toast.error('Unable to load current settings.');
    } finally {
      setLoading(false);
    }
  };

  // Save Store & Contact Routing Settings
  const handleSaveStoreSettings = async (e) => {
    if (e) e.preventDefault();
    if (!storeSettings.contactEmail.trim()) {
      toast.error('Please provide a contact recipient email.');
      return;
    }

    setSavingStore(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contactEmail: storeSettings.contactEmail.trim(),
          supportPhone: storeSettings.supportPhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) {
          setStoreSettings((prev) => ({
            ...prev,
            contactEmail: data.data.contactEmail || prev.contactEmail,
            supportPhone: data.data.supportPhone || prev.supportPhone,
          }));
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('caffeloja_settings_updated'));
        }
        toast.success(data.message || 'Contact settings saved successfully!');
      } else {
        toast.error(data.message || data.error || 'Failed to update store settings.');
      }
    } catch {
      toast.error('Connection error while saving settings.');
    } finally {
      setSavingStore(false);
    }
  };

  // Send Test Email to Contact Email Address
  const handleTestContactEmail = async () => {
    if (!storeSettings.contactEmail.trim()) {
      toast.error('Please specify a contact email first.');
      return;
    }

    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_contact_email',
          contactEmail: storeSettings.contactEmail.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Test email dispatched to ${storeSettings.contactEmail}!`);
      } else {
        toast.error(data.message || 'Failed to dispatch test email.');
      }
    } catch {
      toast.error('Error connecting to email service.');
    } finally {
      setTestingEmail(false);
    }
  };

  // Call User Settings API (/api/user/settings) with Bearer token
  const callUserSettingsApi = async (payload) => {
    const token = localStorage.getItem('caffeloja_token');
    const res = await fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter both current and new passwords.');
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
      const data = await callUserSettingsApi({
        action: 'change_password',
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (data.success) {
        toast.success(data.message || 'Admin password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password.');
      }
    } catch {
      toast.error('Connection error while changing password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // 2FA: Initiate Google Authenticator Setup
  const handleSetup2FA = async () => {
    setBusy2fa(true);
    try {
      const data = await callUserSettingsApi({ action: 'setup_2fa' });
      if (data.success) {
        setTwoFactorSetup({
          secret: data.secret,
          qrUrl: data.qrUrl,
          otpauthUrl: data.otpauthUrl,
        });
        toast.success('Google Authenticator QR code generated. Scan it in your app.');
      } else {
        toast.error(data.message || 'Unable to generate 2FA secret.');
      }
    } catch {
      toast.error('Connection error during 2FA setup.');
    } finally {
      setBusy2fa(false);
    }
  };

  // 2FA: Verify 6-digit code and activate
  const handleVerifyAndEnable2FA = async (e) => {
    e.preventDefault();
    const cleanCode = totpVerifyCode.replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      toast.error('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    setBusy2fa(true);
    try {
      const data = await callUserSettingsApi({
        action: 'enable_2fa',
        code: cleanCode,
      });

      if (data.success) {
        toast.success(data.message || 'Google Authenticator 2FA is now active!');
        setAdminUser((prev) => ({ ...prev, twoFactorEnabled: true }));
        setTwoFactorSetup(null);
        setTotpVerifyCode('');
      } else {
        toast.error(data.message || 'Invalid 6-digit code. Please try again.');
      }
    } catch {
      toast.error('Connection error verifying authenticator code.');
    } finally {
      setBusy2fa(false);
    }
  };

  // 2FA: Disable Google Authenticator
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disableAuthInput.trim()) {
      toast.error('Please enter your password or 6-digit authenticator code.');
      return;
    }

    setDisabling2fa(true);
    try {
      const isSixDigit = /^\d{6}$/.test(disableAuthInput.trim());
      const payload = {
        action: 'disable_2fa',
        ...(isSixDigit ? { code: disableAuthInput.trim() } : { password: disableAuthInput }),
      };

      const data = await callUserSettingsApi(payload);
      if (data.success) {
        toast.success(data.message || 'Google Authenticator 2FA has been disabled.');
        setAdminUser((prev) => ({ ...prev, twoFactorEnabled: false }));
        setShowDisableForm(false);
        setDisableAuthInput('');
      } else {
        toast.error(data.message || 'Verification failed. Unable to disable 2FA.');
      }
    } catch {
      toast.error('Connection error disabling 2FA.');
    } finally {
      setDisabling2fa(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} className="spin-icon" style={{ color: 'var(--amber-primary)', margin: '0 auto 12px' }} />
        <p>Loading administrative configuration...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'grid', gap: '24px' }}>
      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid var(--mocha-border)',
          paddingBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'store' ? 'var(--amber-primary)' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'store' ? '#0d0907' : 'var(--text-secondary)',
            border: activeTab === 'store' ? '1px solid var(--amber-primary)' : '1px solid var(--mocha-border)',
          }}
        >
          <Mail size={16} />
          <span>Contact Form Email</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'security' ? 'var(--amber-primary)' : 'rgba(255,255,255,0.04)',
            color: activeTab === 'security' ? '#0d0907' : 'var(--text-secondary)',
            border: activeTab === 'security' ? '1px solid var(--amber-primary)' : '1px solid var(--mocha-border)',
          }}
        >
          <ShieldCheck size={16} />
          <span>Password & Google Authenticator (2FA)</span>
        </button>
      </div>

      {/* TAB 1: CONTACT FORM EMAIL */}
      {activeTab === 'store' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Card: Contact Form Notification Email */}
          <div
            style={{
              background: '#1a120d',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={22} style={{ color: 'var(--amber-light)' }} />
                  Contact Form Email Routing
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px', lineHeight: '1.5' }}>
                  Configure the primary inbox that receives all customer inquiries submitted on the public <code>/contact</code> page. Submissions are delivered live via Resend.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: storeSettings.resendConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: storeSettings.resendConfigured ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                    color: storeSettings.resendConfigured ? '#34d399' : '#fbbf24',
                  }}
                >
                  <CheckCircle2 size={13} />
                  {storeSettings.resendConfigured ? 'Resend API Active' : 'Email Simulated'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveStoreSettings} style={{ display: 'grid', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                    Contact Form Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={storeSettings.contactEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                    placeholder="e.g. caffeloja77@gmail.com"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '0.94rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Inquiries from <code>/contact</code> will be forwarded directly to this address with customer reply links.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                    Public Support Phone Number
                  </label>
                  <input
                    type="text"
                    value={storeSettings.supportPhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                    placeholder="(+1) 504 327 9670"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '0.94rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Displayed on the public Contact Us card.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '10px' }}>
                <button
                  type="submit"
                  disabled={savingStore}
                  className="btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={15} />
                  <span>{savingStore ? 'Saving...' : 'Save Contact Email'}</span>
                </button>

                <button
                  type="button"
                  disabled={testingEmail}
                  onClick={handleTestContactEmail}
                  className="btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={15} />
                  <span>{testingEmail ? 'Dispatching Test...' : 'Send Test Email to Recipient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN PASSWORD & GOOGLE AUTHENTICATOR (2FA) */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Section 1: Change Admin Password */}
          <div
            style={{
              background: '#1a120d',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} style={{ color: 'var(--amber-light)' }} />
                Change Admin Password
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Update your administrative login password. Password must contain at least 6 characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  Current Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '10px',
                      padding: '12px 42px 12px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '10px',
                      padding: '12px 42px 12px 14px',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
                  Confirm New Password *
                </label>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--mocha-border)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ paddingTop: '8px' }}>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
                >
                  <Lock size={15} />
                  <span>{savingPassword ? 'Updating Password...' : 'Update Admin Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Google Authenticator (TOTP 2FA) */}
          <div
            style={{
              background: '#1a120d',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={20} style={{ color: 'var(--amber-light)' }} />
                  Google Authenticator (2FA)
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  Protect your executive account with Time-based One-Time Passwords (TOTP). Compatible with Google Authenticator, Authy, and 1Password.
                </p>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  background: adminUser?.twoFactorEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: adminUser?.twoFactorEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: adminUser?.twoFactorEnabled ? '#34d399' : '#f87171',
                }}
              >
                {adminUser?.twoFactorEnabled ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {adminUser?.twoFactorEnabled ? '2FA ACTIVE' : '2FA DISABLED'}
              </span>
            </div>

            {/* Case A: 2FA is currently ENABLED */}
            {adminUser?.twoFactorEnabled ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <ShieldCheck size={24} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.88rem', color: '#d1fae5', lineHeight: '1.5' }}>
                    <strong>Your admin account is strictly secured.</strong> Every future sign-in will require your password plus the rotating 6-digit code from Google Authenticator.
                  </div>
                </div>

                {!showDisableForm ? (
                  <button
                    type="button"
                    onClick={() => setShowDisableForm(true)}
                    className="btn-outline btn-sm"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)', justifyContent: 'center' }}
                  >
                    Disable Two-Factor Authentication
                  </button>
                ) : (
                  <form onSubmit={handleDisable2FA} style={{ display: 'grid', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--mocha-border)' }}>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      To turn off 2FA, enter your current <strong>admin password</strong> or a 6-digit code from your authenticator app:
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Enter admin password or 6-digit code"
                      value={disableAuthInput}
                      onChange={(e) => setDisableAuthInput(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        disabled={disabling2fa}
                        className="btn-primary btn-sm"
                        style={{ background: '#ef4444', borderColor: '#ef4444', flex: 1, justifyContent: 'center' }}
                      >
                        {disabling2fa ? 'Disabling...' : 'Confirm Disable 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisableForm(false);
                          setDisableAuthInput('');
                        }}
                        className="btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Case B: 2FA is currently DISABLED */
              <div style={{ display: 'grid', gap: '16px' }}>
                {!twoFactorSetup ? (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '12px',
                        padding: '14px',
                        fontSize: '0.86rem',
                        color: '#fef3c7',
                        lineHeight: '1.5',
                      }}
                    >
                      Enabling Google Authenticator prevents unauthorized access to the admin control center, dropship logs, and payout balances even if your password is compromised.
                    </div>

                    <button
                      type="button"
                      disabled={busy2fa}
                      onClick={handleSetup2FA}
                      className="btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                      <Smartphone size={16} />
                      <span>{busy2fa ? 'Generating QR Code...' : 'Set Up Google Authenticator'}</span>
                    </button>
                  </div>
                ) : (
                  /* Setup Wizard with QR Code */
                  <form onSubmit={handleVerifyAndEnable2FA} className="animate-fadeIn" style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ textAlign: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', width: 'fit-content', margin: '0 auto' }}>
                      <img
                        src={twoFactorSetup.qrUrl}
                        alt="Google Authenticator QR Code"
                        width={180}
                        height={180}
                        style={{ display: 'block' }}
                      />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Can't scan? Enter this secret manually in your app:
                      </span>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--mocha-border)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                        }}
                      >
                        <code style={{ color: 'var(--amber-light)', fontSize: '0.86rem', letterSpacing: '1px' }}>
                          {twoFactorSetup.secret}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(twoFactorSetup.secret);
                            toast.success('Secret key copied!');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                          title="Copy Secret"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600', textAlign: 'center' }}>
                        Enter 6-Digit Authenticator Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        placeholder="123456"
                        value={totpVerifyCode}
                        onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                        style={{
                          width: '100%',
                          maxWidth: '220px',
                          margin: '0 auto',
                          display: 'block',
                          textAlign: 'center',
                          fontSize: '1.4rem',
                          letterSpacing: '6px',
                          fontFamily: 'monospace',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid var(--amber-primary)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          color: '#fff',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        disabled={busy2fa || totpVerifyCode.length !== 6}
                        className="btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {busy2fa ? 'Activating...' : 'Verify & Activate 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorSetup(null);
                          setTotpVerifyCode('');
                        }}
                        className="btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

