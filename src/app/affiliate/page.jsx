'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ALLOWED_SHIPPING_COUNTRY,
  isUnitedStatesCountry,
  US_ONLY_SHIPPING_ERROR,
} from '@/lib/shipping';
import {
  Users,
  Copy,
  Check,
  TrendingUp,
  Award,
  Wallet,
  ArrowRight,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
  Share2,
  DollarSign,
  ChevronRight,
  Layers,
  Sparkles,
  LayoutDashboard,
  CreditCard,
  Megaphone,
  Settings,
  LogOut,
  QrCode,
  Search,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Building,
  Smartphone,
  Lock,
  Mail,
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  BarChart3,
  Calendar,
  Activity,
  Menu,
  X,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AffiliateLineChart from '@/components/AffiliateLineChart';
import StripeSubscriptionCard from '@/components/StripeSubscriptionCard';
import GenealogyTree from '@/components/GenealogyTree';
import UserSettingsPanel from '@/components/UserSettingsPanel';

let cachedUser = null;
let cachedDownline = null;
let cachedCommissions = [];
let cachedOrders = [];

export default function AffiliatePage() {
  const router = useRouter();
  const pathname = usePathname();

  const getTabFromPath = (path) => {
    if (path?.startsWith('/user/subscription')) return 'subscription';
    if (path?.startsWith('/user/orders')) return 'orders';
    if (path?.startsWith('/user/network')) return 'network';
    if (path?.startsWith('/user/commissions')) return 'commissions';
    if (path?.startsWith('/user/payouts')) return 'payouts';
    if (path?.startsWith('/user/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [sidebarTab, setSidebarTab] = useState(() => getTabFromPath(pathname)); // 'overview' | 'subscription' | 'network' | 'commissions' | 'payouts' | 'settings'
  const [user, setUser] = useState(() => cachedUser);
  const [authChecking, setAuthChecking] = useState(() => !cachedUser);
  const [token, setToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [networkSearch, setNetworkSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '', totpCode: '' });
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [regVerificationSent, setRegVerificationSent] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    sponsorCode: '',
    acceptTerms: false,
  });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard states
  const [downline, setDownline] = useState(() => cachedDownline);
  const [commissions, setCommissions] = useState(() => cachedCommissions);
  const [orders, setOrders] = useState(() => cachedOrders);
  const [expandedLevel, setExpandedLevel] = useState(1);
  const [networkView, setNetworkView] = useState('tree'); // 'tree' | 'list'
  const [payoutForm, setPayoutForm] = useState({ method: 'bank', iban: '', accountName: '', mbway: '', crypto: '' });
  const [payoutMessage, setPayoutMessage] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [subShippingForm, setSubShippingForm] = useState({
    phone: cachedUser?.shippingAddress?.phone || cachedUser?.phone || '',
    street: cachedUser?.shippingAddress?.street || '',
    city: cachedUser?.shippingAddress?.city || '',
    state: cachedUser?.shippingAddress?.state || '',
    postalCode: cachedUser?.shippingAddress?.postalCode || '',
    country: ALLOWED_SHIPPING_COUNTRY,
  });
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [confirmCancelSub, setConfirmCancelSub] = useState(false);
  const [isCancellingSub, setIsCancellingSub] = useState(false);

  useEffect(() => {
    if (user) {
      setSubShippingForm((prev) => ({
        phone: prev.phone || user.shippingAddress?.phone || user.phone || '',
        street: prev.street || user.shippingAddress?.street || '',
        city: prev.city || user.shippingAddress?.city || '',
        state: prev.state || user.shippingAddress?.state || '',
        postalCode: prev.postalCode || user.shippingAddress?.postalCode || '',
        country: ALLOWED_SHIPPING_COUNTRY,
      }));
    }
  }, [user]);

  useEffect(() => {
    setSidebarTab(getTabFromPath(pathname));
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check URL params for mode or referral code
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('mode') || urlParams.get('tab');
      const refParam = urlParams.get('ref');

      if (modeParam === 'register' || window.location.pathname === '/register') {
        setActiveTab('register');
      }

      if (refParam) {
        const cleanRef = refParam.toUpperCase().trim();
        localStorage.setItem('caffeloja_ref', cleanRef);
        setRegForm((prev) => ({ ...prev, sponsorCode: cleanRef }));
      } else {
        const savedRef = localStorage.getItem('caffeloja_ref');
        if (savedRef) {
          setRegForm((prev) => ({ ...prev, sponsorCode: savedRef }));
        }
      }
    }

    // Check existing auth token
    const savedToken = localStorage.getItem('caffeloja_token');
    if (savedToken) {
      setToken(savedToken);
      try {
        const savedUser = localStorage.getItem('caffeloja_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.role === 'admin') {
            router.replace('/admin/dashboard');
            return;
          }
          if (!cachedUser) {
            cachedUser = parsed;
            setUser(parsed);
          }
        }
      } catch {}
      fetchUserProfile(savedToken);
    } else {
      cachedUser = null;
      setAuthChecking(false);
      if (pathname?.startsWith('/user')) {
        router.replace('/login');
      }
    }
  }, []);

  // Disallow admin role from opening member portal - safely navigate in effect
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [user?.role, router]);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        cachedUser = data.user;
        localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
        // Disallow admin role from accessing member portal
        if (data.user?.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }
        setUser(data.user);
        setAuthChecking(false);
        fetchDownlineAndCommissions(authToken);
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/user')
        ) {
          router.replace('/user/dashboard');
        }
      } else {
        cachedUser = null;
        localStorage.removeItem('caffeloja_token');
        localStorage.removeItem('caffeloja_user');
        setToken(null);
        setUser(null);
        setAuthChecking(false);
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/user')) {
          router.replace('/login');
        }
      }
    } catch {
      setAuthChecking(false);
      if (!cachedUser) {
        localStorage.removeItem('caffeloja_token');
        localStorage.removeItem('caffeloja_user');
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/user')) {
          router.replace('/login');
        }
      }
    }
  };

  const fetchDownlineAndCommissions = async (authToken) => {
    try {
      const [downlineRes, commRes, ordersRes] = await Promise.all([
        fetch('/api/affiliate/downline', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/affiliate/commissions', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/user/orders', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);

      const downlineData = await downlineRes.json();
      const commData = await commRes.json();
      const ordersData = await ordersRes.json();

      if (downlineData.success) {
        cachedDownline = downlineData.data;
        setDownline(downlineData.data);
      }
      if (commData.success) {
        cachedCommissions = commData.data;
        setCommissions(commData.data);
      }
      if (ordersData.success) {
        cachedOrders = ordersData.data;
        setOrders(ordersData.data);
      }
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password) {
      toast.error('Please enter both your email and password.');
      return;
    }
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        cachedUser = data.user;
        localStorage.setItem('caffeloja_token', data.token);
        localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setRequiresTwoFactor(false);
        setAuthChecking(false);
        window.dispatchEvent(new Event('caffeloja_auth_change'));
        fetchDownlineAndCommissions(data.token);
        if (data.user?.role === 'admin') {
          toast.success(`Welcome to Admin Portal, ${data.user.name || 'Admin'}!`);
          router.push('/admin/dashboard');
        } else {
          toast.success(`Welcome back, ${data.user.name || 'Member'}!`);
          router.push('/user/dashboard');
        }
      } else if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        const msg = data.message || 'Enter the 6-digit code from Google Authenticator.';
        setAuthError(msg);
        toast(msg);
      } else if (data.requiresEmailVerification) {
        setUnverifiedEmail(loginForm.email.trim());
        const msg = data.message || 'Please verify your email address before logging in.';
        setAuthError(msg);
        toast.error(msg);
      } else {
        const msg = data.message || data.error || 'Login failed. Please verify credentials.';
        setAuthError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'Connection error: ' + (err.message || 'Please try again.');
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || loginForm.email.trim() || regForm.email.trim();
    if (!targetEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsResendingVerification(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Verification link sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Unable to send verification link.');
      }
    } catch {
      toast.error('Connection error while sending verification email.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (regForm.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!regForm.acceptTerms) {
      toast.error('Please accept the Terms and Conditions to continue.');
      return;
    }
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.requiresVerification) {
          setRegVerificationSent({ email: regForm.email.trim(), name: regForm.name.trim() });
          toast.success(data.message || 'Verification email sent! Please check your inbox.');
        } else {
          cachedUser = data.user;
          localStorage.setItem('caffeloja_token', data.token);
          localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          setAuthChecking(false);
          window.dispatchEvent(new Event('caffeloja_auth_change'));
          fetchDownlineAndCommissions(data.token);
          toast.success('Account created successfully!');
          router.push('/user/dashboard');
        }
      } else {
        const msg = data.message || data.error || 'Registration failed. Please check your details.';
        setAuthError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'Connection error: ' + (err.message || 'Please try again.');
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    cachedUser = null;
    cachedDownline = null;
    cachedCommissions = [];
    cachedOrders = [];
    localStorage.removeItem('caffeloja_token');
    localStorage.removeItem('caffeloja_user');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event('caffeloja_auth_change'));
    setActiveTab('login');
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const handleSubscribeNow = () => {
    setSidebarTab('subscription');
    router.push('/user/subscription');
  };

  const handleSaveShipping = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!subShippingForm.phone.trim() || !subShippingForm.street.trim() || !subShippingForm.city.trim() || !subShippingForm.postalCode.trim()) {
      toast.error('Please fill in your phone number, street address, city, and ZIP code.');
      return false;
    }
    if (!isUnitedStatesCountry(subShippingForm.country)) {
      toast.error(US_ONLY_SHIPPING_ERROR);
      return false;
    }

    setIsSavingShipping(true);
    try {
      const authToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action: 'save_shipping',
          shipping: {
            ...subShippingForm,
            country: ALLOWED_SHIPPING_COUNTRY,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = { ...user, ...data.user };
        cachedUser = updatedUser;
        localStorage.setItem('caffeloja_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success('Shipping details saved!');
        return true;
      } else {
        toast.error(data.message || 'Unable to save shipping details.');
        return false;
      }
    } catch {
      toast.error('Connection error while saving shipping details.');
      return false;
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleSubscriptionActivated = (newUserData, successMsg) => {
    const updatedUser = {
      ...user,
      ...(newUserData || {}),
      hasActiveSubscription: true,
      subscriptionStatus: 'active',
    };
    cachedUser = updatedUser;
    localStorage.setItem('caffeloja_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setConfirmCancelSub(false);
    toast.success(successMsg || 'Monthly Coffee Box subscription activated!');
  };

  const handleCancelSubscription = async () => {
    setIsCancellingSub(true);
    try {
      const authToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: 'cancel_subscription' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = {
          ...user,
          ...(data.user || {}),
          hasActiveSubscription: false,
          subscriptionStatus: 'cancelled',
          nextBillingDate: null,
        };
        cachedUser = updatedUser;
        localStorage.setItem('caffeloja_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setConfirmCancelSub(false);
        toast.success(data.message || 'Subscription cancelled.');
      } else {
        toast.error(data.message || 'Unable to cancel subscription.');
      }
    } catch {
      toast.error('Connection error while cancelling subscription.');
    } finally {
      setIsCancellingSub(false);
    }
  };

  const referralLink = user
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/?ref=${user.referralCode}`
    : '';

  const copyReferralLink = (customUrl = '', label = 'Referral link copied to clipboard!') => {
    const textToCopy = customUrl || referralLink;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(label);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    if ((user?.walletBalance || 0) < 20) {
      toast.error('Minimum $20.00 balance is required to request a withdrawal.');
      return;
    }
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      const msg = 'Payout request of $' + (user?.walletBalance || 0).toFixed(2) + ' submitted! Payouts are processed every Monday.';
      setPayoutMessage(msg);
      toast.success(msg);
    }, 1000);
  };

  // Downline member filtering
  const currentLevelMembers = downline ? downline[`level${expandedLevel}`] || [] : [];
  const filteredMembers = currentLevelMembers.filter((m) =>
    networkSearch ? (m.name?.toLowerCase().includes(networkSearch.toLowerCase()) || m.referralCode?.toLowerCase().includes(networkSearch.toLowerCase()) || m.email?.toLowerCase().includes(networkSearch.toLowerCase())) : true
  );

  if (user?.role === 'admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--amber-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Redirecting to Executive Admin Portal...</p>
      </div>
    );
  }

  const isUserRoute = pathname?.startsWith('/user') || Boolean(user);

  return (
    <div
      className="affiliate-dashboard-wrap"
      style={isUserRoute ? { paddingTop: '32px' } : undefined}
    >
      {isUserRoute && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1920&q=85")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.07,
            filter: 'blur(1px) saturate(0.85)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* If user is NOT logged in: Show Clean Login / Register Card (never flash on /user/* routes) */}
        {!user ? (
          pathname?.startsWith('/user') || authChecking ? (
            <div style={{ minHeight: '70vh' }} />
          ) : (
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
                {activeTab === 'login' ? 'Member Login' : 'Create an Account'}
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
                {activeTab === 'login'
                  ? 'Sign in to manage your coffee subscription and commissions.'
                  : 'Register your Caffeloja member account.'}
              </p>
            </div>

            {/* Tab switch */}
            <div style={{ display: 'flex', gap: '6px', background: '#0d0907', padding: '5px', borderRadius: '12px', border: '1px solid var(--mocha-border)', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: activeTab === 'login' ? 'var(--amber-primary)' : 'transparent',
                  color: activeTab === 'login' ? '#0d0907' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: activeTab === 'register' ? 'var(--amber-primary)' : 'transparent',
                  color: activeTab === 'register' ? '#0d0907' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                Register
              </button>
            </div>

            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.14)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 14px', borderRadius: '10px', fontSize: '0.86rem', marginBottom: '18px' }}>
                <div>{authError}</div>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                    className="btn-secondary btn-sm"
                    style={{ marginTop: '10px', width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                  >
                    <Mail size={14} />
                    <span>{isResendingVerification ? 'Sending...' : 'Resend Verification Link'}</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="checkout-form">
                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Password *</label>
                    <Link
                      href="/forgot-password"
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--amber-light)',
                        textDecoration: 'none',
                        fontWeight: '500',
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                {requiresTwoFactor && (
                  <div className="form-field animate-fadeIn">
                    <label>Google Authenticator Code *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={loginForm.totpCode}
                      onChange={(e) => {
                        setLoginForm({
                          ...loginForm,
                          totpCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        });
                        if (authError) setAuthError('');
                      }}
                      style={{ letterSpacing: '3px', fontWeight: '700' }}
                    />
                  </div>
                )}
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                </button>
                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--amber-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            ) : regVerificationSent ? (
              <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(212, 163, 115, 0.15)',
                    border: '1px solid var(--amber-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--amber-light)',
                  }}
                >
                  <Mail size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '8px' }}>
                  Verification Email Sent!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '22px' }}>
                  We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{regVerificationSent.email}</strong>. Please check your inbox and click the button to activate your account.
                </p>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '14px' }}
                >
                  <Mail size={16} />
                  <span>{isResendingVerification ? 'Sending...' : 'Resend Verification Link'}</span>
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegVerificationSent(null);
                      setActiveTab('login');
                      setAuthError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--amber-light)',
                      fontSize: '0.86rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Back to Member Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="checkout-form">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={regForm.name}
                    onChange={(e) => {
                      setRegForm({ ...regForm, name: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={(e) => {
                      setRegForm({ ...regForm, email: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={regForm.password}
                    onChange={(e) => {
                      setRegForm({ ...regForm, password: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Referral Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LOJA-4029"
                    value={regForm.sponsorCode}
                    onChange={(e) => {
                      setRegForm({ ...regForm, sponsorCode: e.target.value.toUpperCase() });
                      if (authError) setAuthError('');
                    }}
                    style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginTop: '6px',
                    marginBottom: '6px',
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={regForm.acceptTerms}
                    onChange={(e) => {
                      setRegForm({ ...regForm, acceptTerms: e.target.checked });
                      if (authError) setAuthError('');
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      marginTop: '3px',
                      accentColor: 'var(--amber-primary)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    I agree to the{' '}
                    <Link
                      href="/terms-and-conditions"
                      style={{ color: 'var(--amber-light)', textDecoration: 'underline' }}
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      style={{ color: 'var(--amber-light)', textDecoration: 'underline' }}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--amber-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
            </div>
          )
        ) : (
          /* Logged In: SIMPLE, RESPONSIVE USER PORTAL */
          <div className="affiliate-layout animate-fadeIn">
            <style>{`
              .user-sidebar-toggle-btn {
                display: none;
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background: #1c130e;
                border: 1px solid var(--mocha-border);
                color: var(--amber-light);
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
              }
              .user-sidebar-close-btn {
                display: none;
                margin-left: auto;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid var(--mocha-border);
                color: var(--text-secondary);
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
              }
              .user-sidebar-backdrop {
                display: none;
              }
              .user-kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 16px;
                margin-bottom: 24px;
              }
              .user-kpi-card {
                background: #1a120d;
                border: 1px solid var(--mocha-border);
                border-radius: 14px;
                padding: 18px 16px;
                min-width: 0;
              }
              .user-cards-grid-3 {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 16px;
                margin-bottom: 24px;
              }
              .user-cards-grid-2 {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 20px;
              }
              @media (max-width: 1024px) {
                .user-sidebar-toggle-btn {
                  display: inline-flex !important;
                }
                .user-sidebar-close-btn {
                  display: inline-flex !important;
                }
                .user-sidebar-backdrop.open {
                  display: block !important;
                  position: fixed;
                  inset: 0;
                  z-index: 1240;
                  background: rgba(10, 7, 5, 0.78);
                  backdrop-filter: blur(5px);
                }
                .affiliate-sidebar {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  bottom: 0 !important;
                  width: 280px !important;
                  max-width: 84vw !important;
                  z-index: 1250 !important;
                  border-radius: 0 20px 20px 0 !important;
                  padding: 24px 18px !important;
                  overflow-y: auto !important;
                  transform: translateX(-105%);
                  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .affiliate-sidebar.sidebar-open {
                  transform: translateX(0) !important;
                }
                .affiliate-sidebar .affiliate-nav-menu {
                  display: flex !important;
                  flex-direction: column !important;
                  gap: 6px !important;
                }
                .user-kpi-grid {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                  gap: 12px !important;
                }
                .user-cards-grid-3 {
                  grid-template-columns: minmax(0, 1fr) !important;
                }
                .user-cards-grid-2 {
                  grid-template-columns: minmax(0, 1fr) !important;
                }
              }
              @media (max-width: 600px) {
                .affiliate-main-content {
                  padding: 18px 14px !important;
                  border-radius: 16px !important;
                  min-height: auto !important;
                }
                .user-kpi-card {
                  padding: 14px 12px !important;
                }
                .affiliate-top-bar {
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                }
              }
            `}</style>

            {/* Mobile Backdrop */}
            <div
              className={`user-sidebar-backdrop ${mobileSidebarOpen ? 'open' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* LEFT SIDEBAR NAVIGATION */}
            <aside
              className={`affiliate-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}
              style={{ top: '24px' }}
            >
              {/* Profile Card */}
              <div className="affiliate-profile-card">
                <div className="affiliate-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    {user.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--amber-light)' }}>
                      {user.referralCode}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        background: user.hasActiveSubscription ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                        border: user.hasActiveSubscription ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                        color: user.hasActiveSubscription ? '#34d399' : '#fca5a5',
                      }}
                    >
                      {user.hasActiveSubscription ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="user-sidebar-close-btn"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sidebar Menu Links (/user/*) */}
              <nav className="affiliate-nav-menu">
                <Link
                  href="/user/dashboard"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'overview' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'overview' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/subscription"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'subscription' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <ShoppingBag size={18} />
                    <span>Subscription</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'subscription' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/orders"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'orders' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <Package size={18} />
                    <span>Orders History</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'orders' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/network"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'network' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <Users size={18} />
                    <span>My Network</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'network' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/commissions"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'commissions' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <TrendingUp size={18} />
                    <span>Commissions</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'commissions' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/payouts"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'payouts' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <CreditCard size={18} />
                    <span>Payouts</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'payouts' ? 1 : 0.4 }} />
                </Link>

                <Link
                  href="/user/settings"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`affiliate-nav-btn ${sidebarTab === 'settings' ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="affiliate-nav-btn-left">
                    <Settings size={18} />
                    <span>Settings</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'settings' ? 1 : 0.4 }} />
                </Link>
              </nav>

              {/* Storefront & Logout */}
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gap: '8px' }}>
                <Link
                  href="/"
                  className="btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                >
                  <span>Visit Store</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.35)', color: '#f87171', fontSize: '0.82rem' }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="affiliate-main-content">
              {/* Clean Top Header Bar */}
              <div className="affiliate-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <button
                    type="button"
                    className="user-sidebar-toggle-btn"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Open menu"
                  >
                    <Menu size={20} />
                  </button>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 3vw, 1.65rem)', fontWeight: '700', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sidebarTab === 'overview' && 'Dashboard'}
                    {sidebarTab === 'subscription' && 'Coffee Box Subscription'}
                    {sidebarTab === 'orders' && 'Orders History'}
                    {sidebarTab === 'network' && 'My Network'}
                    {sidebarTab === 'commissions' && 'Commissions'}
                    {sidebarTab === 'payouts' && 'Payouts'}
                    {sidebarTab === 'settings' && 'Settings'}
                  </h1>
                </div>
              </div>

              {/* Top Alert Notification if Account Subscription is Not Active */}
              {!user.hasActiveSubscription && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    marginBottom: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <strong style={{ color: '#fca5a5', fontSize: '0.9rem', display: 'block', marginBottom: '2px' }}>
                      Subscription Inactive — Commissions at Risk
                    </strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                      Your account status is not active. You will lose commissions from your downline until you subscribe to the $69.00/month Coffee Box.
                    </span>
                  </div>
                  {sidebarTab !== 'subscription' && (
                    <button
                      type="button"
                      onClick={handleSubscribeNow}
                      className="btn-primary btn-sm"
                      style={{ padding: '9px 16px', fontSize: '0.82rem', flexShrink: 0 }}
                    >
                      <span>Subscribe Now</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* TAB: SUBSCRIPTION & SHIPPING */}
              {sidebarTab === 'subscription' && (
                <div className="animate-fadeIn">
                  <div className="user-cards-grid-2" style={{ alignItems: 'start' }}>
                    {/* Left: Shipping Address & Stripe Card Form */}
                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: 'clamp(18px, 4vw, 26px)',
                      }}
                    >
                      <StripeSubscriptionCard
                        user={user}
                        shippingForm={subShippingForm}
                        setShippingForm={setSubShippingForm}
                        onSaveShipping={handleSaveShipping}
                        isSavingShipping={isSavingShipping}
                        onActivated={handleSubscriptionActivated}
                      />
                    </div>

                    {/* Right: Subscription Plan Summary Card */}
                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: 'clamp(18px, 4vw, 26px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--mocha-border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Subscription Status
                        </span>
                        <span
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: '700',
                            color: user.hasActiveSubscription ? 'var(--success)' : '#f87171',
                          }}
                        >
                          {user.hasActiveSubscription ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                        <img
                          src="/images/coffee-box-60-pods.png"
                          alt="Coffee Box (20 Pods)"
                          style={{
                            width: '84px',
                            height: 'auto',
                            flexShrink: 0,
                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.45))',
                          }}
                        />
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', margin: '0 0 4px' }}>
                            Coffee Box (20 Pods)
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                            Monthly Fresh Roast Delivery &bull; 100% Arabica Pods
                          </p>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: '700', color: 'var(--amber-light)' }}>
                            $69.00 <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ month</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--mocha-border)', paddingTop: '14px', marginBottom: '18px', display: 'grid', gap: '8px', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Coffee Box (20 Pods)</span>
                          <span>$69.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Monthly Shipping</span>
                          <span style={{ color: 'var(--success)' }}>Free</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Billing Cycle</span>
                          <span>Monthly</span>
                        </div>
                        {user.paymentMethodSummary?.last4 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                            <span>Payment Card</span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {user.paymentMethodSummary.brand || 'Card'} &bull;&bull;&bull;&bull; {user.paymentMethodSummary.last4}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>Next Billing Date</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                            {(() => {
                              const nextDate = user.nextBillingDate
                                ? new Date(user.nextBillingDate)
                                : (() => {
                                    const d = user.subscriptionUpdatedAt ? new Date(user.subscriptionUpdatedAt) : new Date();
                                    d.setMonth(d.getMonth() + 1);
                                    return d;
                                  })();
                              const formatted = nextDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              });
                              return user.hasActiveSubscription ? formatted : `${formatted} (if started today)`;
                            })()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', paddingTop: '8px', borderTop: '1px solid var(--mocha-border)' }}>
                          <span>Monthly Total</span>
                          <span style={{ color: 'var(--amber-light)' }}>$69.00</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                          Cancel anytime &mdash; no long-term commitment or cancellation fees.
                        </div>
                      </div>

                      <div style={{ background: '#0d0907', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Unlocks 4-Level Downline Commissions
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                          {[
                            { lvl: 'L1', amt: '$10' },
                            { lvl: 'L2', amt: '$8' },
                            { lvl: 'L3', amt: '$6' },
                            { lvl: 'L4', amt: '$6' },
                          ].map((t) => (
                            <div key={t.lvl} style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '8px', padding: '8px 4px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.lvl}</div>
                              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: '700', color: 'var(--amber-light)' }}>{t.amt}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {user.hasActiveSubscription && (
                        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--mocha-border)' }}>
                          {!confirmCancelSub ? (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelSub(true)}
                              className="btn-outline btn-sm"
                              style={{
                                width: '100%',
                                justifyContent: 'center',
                                borderColor: 'rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                              }}
                            >
                              Cancel Subscription
                            </button>
                          ) : (
                            <div
                              style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: '12px',
                                padding: '14px',
                              }}
                            >
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: '1.5' }}>
                                Are you sure? Cancelling pauses future Coffee Box deliveries and downline commissions until you re-subscribe.
                              </p>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={handleCancelSubscription}
                                  disabled={isCancellingSub}
                                  className="btn-outline btn-sm"
                                  style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    borderColor: 'rgba(239, 68, 68, 0.55)',
                                    color: '#fca5a5',
                                  }}
                                >
                                  {isCancellingSub ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmCancelSub(false)}
                                  className="btn-secondary btn-sm"
                                  style={{ flex: 1, justifyContent: 'center' }}
                                >
                                  Keep Plan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {sidebarTab === 'overview' && (
                <div className="animate-fadeIn">
                  {/* Available Balance (Open layout without card, large white amount) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      paddingBottom: '20px',
                      marginBottom: '22px',
                      borderBottom: '1px solid var(--mocha-border)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        Available Balance
                      </span>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(2.25rem, 5vw, 3.1rem)',
                          fontWeight: '700',
                          color: '#ffffff',
                          lineHeight: 1.05,
                        }}
                      >
                        ${(user.walletBalance || 0).toFixed(2)}
                      </div>
                    </div>
                    <Link
                      href="/user/payouts"
                      className="btn-primary btn-sm"
                      style={{ padding: '10px 18px', fontSize: '0.84rem', textDecoration: 'none', flexShrink: 0 }}
                    >
                      <span>Withdraw</span>
                    </Link>
                  </div>

                  {/* 4 Clean KPI Cards (2x2 on mobile, 4x1 on desktop) */}
                  <div className="user-kpi-grid">
                    <div className="user-kpi-card">
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Total Earnings
                      </span>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: 'var(--amber-light)' }}>
                        ${(user.totalEarnings || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="user-kpi-card">
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Withdrawn
                      </span>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: 'var(--text-primary)' }}>
                        ${((user.totalWithdrawn !== undefined && user.totalWithdrawn !== null) ? user.totalWithdrawn : Math.max(0, (user.totalEarnings || 0) - (user.walletBalance || 0))).toFixed(2)}
                      </div>
                    </div>

                    <div className="user-kpi-card">
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Direct Team
                      </span>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {downline?.level1?.length || 0}
                      </div>
                    </div>

                    <div className="user-kpi-card">
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Total Network
                      </span>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {downline ? downline.totalMembers : 0}
                      </div>
                    </div>
                  </div>

                  {/* Minimal Referral Link Buttons Above Chart */}
                  <div className="user-kpi-grid" style={{ marginBottom: '22px' }}>
                    <button
                      type="button"
                      onClick={() => copyReferralLink(user.referralCode, `Referral code (${user.referralCode}) copied!`)}
                      className="btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px 14px', fontSize: '0.84rem' }}
                    >
                      <Copy size={14} />
                      <span>Copy Referral Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyReferralLink(referralLink, 'Store referral link copied!')}
                      className="btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px 14px', fontSize: '0.84rem' }}
                    >
                      <Copy size={14} />
                      <span>Copy Store Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyReferralLink(
                          `${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/menu?ref=${user.referralCode}`,
                          'Product referral link copied!'
                        )
                      }
                      className="btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px 14px', fontSize: '0.84rem' }}
                    >
                      <Copy size={14} />
                      <span>Copy Product Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyReferralLink(
                          `${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/register?ref=${user.referralCode}`,
                          'Sign-up referral link copied!'
                        )
                      }
                      className="btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px 14px', fontSize: '0.84rem' }}
                    >
                      <Copy size={14} />
                      <span>Copy Sign-Up Link</span>
                    </button>
                  </div>

                  {/* Clean Earnings Chart */}
                  <AffiliateLineChart commissions={commissions} user={user} />
                </div>
              )}

              {/* TAB 2: 4-TIER NETWORK & GENEALOGY TREE */}
              {sidebarTab === 'network' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        background: '#0d0907',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '10px',
                        padding: '4px',
                        gap: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setNetworkView('tree')}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '7px',
                          border: 'none',
                          background: networkView === 'tree' ? 'rgba(230, 157, 69, 0.16)' : 'transparent',
                          color: networkView === 'tree' ? 'var(--amber-light)' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Genealogy Tree
                      </button>
                      <button
                        type="button"
                        onClick={() => setNetworkView('list')}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '7px',
                          border: 'none',
                          background: networkView === 'list' ? 'rgba(230, 157, 69, 0.16)' : 'transparent',
                          color: networkView === 'list' ? 'var(--amber-light)' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Level List
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', background: '#0d0907', border: '1px solid var(--mocha-border)', borderRadius: '10px', padding: '7px 12px', gap: '8px', width: '100%', maxWidth: '260px' }}>
                      <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Search member..."
                        value={networkSearch}
                        onChange={(e) => setNetworkSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.84rem', outline: 'none', width: '100%', minWidth: 0 }}
                      />
                    </div>
                  </div>

                  {/* 4-Tier Selector */}
                  <div className="affiliate-tier-selector-grid">
                    {[
                      { lvl: 1, rate: '$10 / box' },
                      { lvl: 2, rate: '$8 / box' },
                      { lvl: 3, rate: '$6 / box' },
                      { lvl: 4, rate: '$6 / box' },
                    ].map((tier) => {
                      const count = downline ? downline[`level${tier.lvl}`]?.length || 0 : 0;
                      const isSelected = networkView === 'list' && expandedLevel === tier.lvl;
                      return (
                        <button
                          key={tier.lvl}
                          type="button"
                          onClick={() => {
                            setExpandedLevel(tier.lvl);
                            setNetworkView('list');
                          }}
                          style={{
                            background: isSelected ? 'rgba(230, 157, 69, 0.16)' : '#140e0a',
                            border: isSelected ? '1px solid var(--amber-primary)' : '1px solid var(--mocha-border)',
                            borderRadius: '12px',
                            padding: '12px 10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Level {tier.lvl}
                          </div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: '700', color: isSelected ? 'var(--amber-light)' : 'var(--text-primary)', margin: '2px 0' }}>
                            {count}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{tier.rate}</div>
                        </button>
                      );
                    })}
                  </div>

                  {networkView === 'tree' ? (
                    <GenealogyTree user={user} downline={downline} searchQuery={networkSearch} />
                  ) : (
                    /* Member List */
                    <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--mocha-border)', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>
                          Level {expandedLevel} Members ({filteredMembers.length})
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--amber-light)' }}>
                          {expandedLevel === 1 ? '$10' : expandedLevel === 2 ? '$8' : '$6'} per box
                        </span>
                      </div>

                      {filteredMembers.length > 0 ? (
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {filteredMembers.map((member, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#0d0907',
                                border: '1px solid var(--mocha-border)',
                                borderRadius: '12px',
                                padding: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block' }}>
                                  {member.name}
                                </strong>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {member.email} &bull; {member.referralCode}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: '0.9rem', margin: 0 }}>No members at Level {expandedLevel} yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COMMISSIONS */}
              {sidebarTab === 'commissions' && (
                <div className="animate-fadeIn">
                  {commissions.length > 0 ? (
                    <div className="affiliate-table-wrap">
                      <table className="affiliate-table">
                        <thead>
                          <tr>
                            <th>Order Ref</th>
                            <th>Date</th>
                            <th>Level</th>
                            <th>Order</th>
                            <th>Earned</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map((comm) => (
                            <tr key={comm._id}>
                              <td style={{ fontWeight: '600' }}>{comm.orderNumber}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{new Date(comm.createdAt).toLocaleDateString()}</td>
                              <td>Level {comm.level}</td>
                              <td>${comm.orderAmount.toFixed(2)}</td>
                              <td style={{ fontWeight: '700', color: 'var(--amber-light)' }}>+${comm.commissionAmount.toFixed(2)}</td>
                              <td style={{ color: 'var(--success)', textTransform: 'capitalize' }}>{comm.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                        No commissions yet
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Commissions appear here automatically whenever a downline member purchases a $69 Coffee Box.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ORDERS HISTORY */}
              {sidebarTab === 'orders' && (
                <div className="animate-fadeIn">
                  {orders.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {orders.map((ord) => (
                        <div
                          key={ord._id || ord.orderNumber}
                          style={{
                            background: '#140e0a',
                            border: '1px solid var(--mocha-border)',
                            borderRadius: '14px',
                            padding: '18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '14px',
                          }}
                        >
                          <div style={{ minWidth: '200px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                                {ord.orderNumber}
                              </strong>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: ord.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(230, 157, 69, 0.14)',
                                  color: ord.paymentStatus === 'paid' ? '#34d399' : 'var(--amber-light)',
                                }}
                              >
                                {ord.paymentStatus === 'paid' ? 'Paid' : ord.paymentStatus}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--text-secondary)',
                                  textTransform: 'capitalize',
                                }}
                              >
                                &bull; {String(ord.status || 'processing').replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              {(ord.items || [])
                                .map((it) => `${it.name} × ${it.quantity || 1}`)
                                .join(', ')}
                            </div>

                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {new Date(ord.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {ord.customer?.address?.city ? ` • ${ord.customer.address.city}, ${ord.customer.address.postalCode || ''}` : ''}
                              {ord.dropshipping?.trackingCode ? ` • Tracking: ${ord.dropshipping.trackingCode}` : ''}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--amber-light)' }}>
                              ${Number(ord.total || 0).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {ord.paymentMethod || 'Card'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        No orders yet
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                        Your Coffee Box subscriptions and store orders will appear here once placed.
                      </p>
                      <Link href="/user/subscription" className="btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                        <span>Subscribe to Coffee Box</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PAYOUTS */}
              {sidebarTab === 'payouts' && (
                <div className="animate-fadeIn">
                  <div className="user-cards-grid-2">
                    <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '22px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Available Balance
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', fontWeight: '700', color: 'var(--amber-light)', margin: '6px 0 16px' }}>
                        ${(user.walletBalance || 0).toFixed(2)}
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '18px' }}>
                        Minimum withdrawal is $20.00. Payout requests are processed weekly.
                      </p>

                      {payoutMessage && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.14)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
                          {payoutMessage}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleRequestPayout}
                        disabled={(user.walletBalance || 0) < 20 || isRequestingPayout}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <span>
                          {isRequestingPayout
                            ? 'Submitting...'
                            : (user.walletBalance || 0) >= 20
                            ? 'Request Withdrawal'
                            : 'Minimum $20.00 Required'}
                        </span>
                      </button>
                    </div>

                    <div style={{ background: '#140e0a', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '22px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px' }}>
                        Payout Destination
                      </h3>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (payoutForm.method === 'bank') {
                            if (!payoutForm.accountName.trim() || !payoutForm.iban.trim()) {
                              toast.error('Please enter your account holder name and account number.');
                              return;
                            }
                          } else if (!payoutForm.crypto.trim()) {
                            toast.error('Please enter your USDT wallet address.');
                            return;
                          }
                          setPayoutMessage('Payout details saved.');
                          toast.success('Payout destination saved!');
                        }}
                        className="checkout-form"
                      >
                        <div className="form-field">
                          <label>Payout Method</label>
                          <select
                            value={payoutForm.method}
                            onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                          >
                            <option value="bank">Bank Transfer (ACH / Account Number)</option>
                            <option value="crypto">USDT Crypto Wallet</option>
                          </select>
                        </div>

                        {payoutForm.method === 'bank' ? (
                          <>
                            <div className="form-field">
                              <label>Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                value={payoutForm.accountName}
                                onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                              />
                            </div>
                            <div className="form-field">
                              <label>Routing &amp; Account Number</label>
                              <input
                                type="text"
                                placeholder="Routing / Account Number"
                                value={payoutForm.iban}
                                onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value })}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="form-field">
                            <label>USDT Wallet Address</label>
                            <input
                              type="text"
                              placeholder="Enter wallet address"
                              value={payoutForm.crypto}
                              onChange={(e) => setPayoutForm({ ...payoutForm, crypto: e.target.value })}
                            />
                          </div>
                        )}

                        <button type="submit" className="btn-secondary btn-sm" style={{ marginTop: '6px', width: '100%', justifyContent: 'center' }}>
                          Save Payout Details
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {sidebarTab === 'settings' && (
                <div className="animate-fadeIn">
                  <UserSettingsPanel
                    user={user}
                    onUserUpdated={(updatedFields) => {
                      const nextUser = { ...user, ...updatedFields };
                      cachedUser = nextUser;
                      localStorage.setItem('caffeloja_user', JSON.stringify(nextUser));
                      setUser(nextUser);
                    }}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}