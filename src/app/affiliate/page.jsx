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
  ChevronDown,
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
  const [user, setUser] = useState(() => (typeof window !== 'undefined' ? cachedUser : null));
  const [authChecking, setAuthChecking] = useState(true);
  const [token, setToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [networkSearch, setNetworkSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [payoutForm, setPayoutForm] = useState({ method: 'stripe', iban: '', accountName: '', mbway: '', crypto: '' });
  const [payoutMessage, setPayoutMessage] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [stripeConnectData, setStripeConnectData] = useState({
    stripeConnectAccountId: '',
    payoutsEnabled: false,
    detailsSubmitted: false,
    minimumPayout: 20,
    payouts: [],
  });
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [payoutWithdrawAmount, setPayoutWithdrawAmount] = useState('');
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
    const nextTab = getTabFromPath(pathname);
    setSidebarTab(nextTab);
    setMobileSidebarOpen(false);
    setMobileMenuOpen(false);
    if (nextTab === 'payouts') {
      fetchStripeConnectData();
    }
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
      const connectParam = urlParams.get('connect');
      if (connectParam === 'return') {
        toast.success('Returned from Stripe Connect! Syncing payout status...');
      } else if (connectParam === 'refresh') {
        toast('Stripe session expired. Please click below to resume setup.');
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
          cachedUser = parsed;
          setUser(parsed);
          setAuthChecking(false);
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/user')) {
            router.replace('/user/dashboard');
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
      const [downlineRes, commRes, ordersRes, stripeRes] = await Promise.all([
        fetch('/api/affiliate/downline', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/affiliate/commissions', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/user/orders', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/affiliate/stripe-connect', { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => null),
      ]);

      const downlineData = await downlineRes.json();
      const commData = await commRes.json();
      const ordersData = await ordersRes.json();
      const stripeData = stripeRes ? await stripeRes.json().catch(() => null) : null;

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
      if (stripeData && stripeData.success) {
        setStripeConnectData({
          stripeConnectAccountId: stripeData.stripeConnectAccountId || '',
          payoutsEnabled: Boolean(stripeData.payoutsEnabled),
          detailsSubmitted: Boolean(stripeData.detailsSubmitted),
          minimumPayout: stripeData.minimumPayout || 20,
          payouts: stripeData.payouts || [],
        });
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

  const fetchStripeConnectData = async (authToken) => {
    try {
      setIsStripeLoading(true);
      const currentToken = authToken || token || localStorage.getItem('caffeloja_token');
      if (!currentToken) return;

      const res = await fetch('/api/affiliate/stripe-connect', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStripeConnectData({
          stripeConnectAccountId: data.stripeConnectAccountId || '',
          payoutsEnabled: Boolean(data.payoutsEnabled),
          detailsSubmitted: Boolean(data.detailsSubmitted),
          minimumPayout: data.minimumPayout || 20,
          payouts: data.payouts || [],
        });
        if (data.walletBalance !== undefined && user) {
          setUser((prev) => ({
            ...prev,
            walletBalance: data.walletBalance,
            totalWithdrawn: data.totalWithdrawn,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching Stripe Connect status:', err);
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handleStartStripeOnboarding = async () => {
    try {
      setIsConnectingStripe(true);
      const currentToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/affiliate/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ action: 'create_connect_account' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || 'Failed to start Stripe onboarding.');
      }
    } catch {
      toast.error('Network error starting Stripe Connect onboarding.');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      setIsConnectingStripe(true);
      const currentToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/affiliate/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ action: 'dashboard_link' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error(data.message || 'Could not open Stripe Express dashboard.');
      }
    } catch {
      toast.error('Network error opening Stripe dashboard.');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleRefreshStripeStatus = async () => {
    try {
      setIsStripeLoading(true);
      const currentToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/affiliate/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ action: 'check_status' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStripeConnectData((prev) => ({
          ...prev,
          stripeConnectAccountId: data.stripeConnectAccountId || prev.stripeConnectAccountId,
          payoutsEnabled: Boolean(data.payoutsEnabled),
          detailsSubmitted: Boolean(data.detailsSubmitted),
        }));
        if (data.payoutsEnabled) {
          toast.success('Stripe Connect verified! Payouts are active.');
        } else {
          toast('Stripe onboarding is still pending verification.');
        }
      }
    } catch {
      toast.error('Failed to refresh Stripe Connect status.');
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    if (e) e.preventDefault();
    if (!stripeConnectData.payoutsEnabled) {
      toast.error('Please complete your Stripe Connect onboarding first before requesting a payout.');
      return;
    }

    const availableBal = Number(user?.walletBalance || 0);
    const minPayout = Number(stripeConnectData.minimumPayout || 20);
    const amountToWithdraw = payoutWithdrawAmount ? Number(payoutWithdrawAmount) : availableBal;

    if (amountToWithdraw < minPayout) {
      toast.error(`Minimum withdrawal is $${minPayout.toFixed(2)}.`);
      return;
    }
    if (amountToWithdraw > availableBal) {
      toast.error(`Withdrawal amount cannot exceed available balance of $${availableBal.toFixed(2)}.`);
      return;
    }

    setIsRequestingPayout(true);
    setPayoutMessage('');

    try {
      const currentToken = token || localStorage.getItem('caffeloja_token');
      const res = await fetch('/api/affiliate/stripe-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          action: 'request_payout',
          amount: amountToWithdraw,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Payout transfer initiated via Stripe Connect!');
        setPayoutMessage(data.message);
        setPayoutWithdrawAmount('');
        if (data.walletBalance !== undefined) {
          const updatedUser = {
            ...user,
            walletBalance: data.walletBalance,
            totalWithdrawn: data.totalWithdrawn,
          };
          setUser(updatedUser);
          cachedUser = updatedUser;
          localStorage.setItem('caffeloja_user', JSON.stringify(updatedUser));
        }
        if (data.payout) {
          setStripeConnectData((prev) => ({
            ...prev,
            payouts: [data.payout, ...(prev.payouts || [])],
          }));
        }
      } else {
        toast.error(data.message || 'Payout transfer failed.');
      }
    } catch {
      toast.error('Network error during Stripe payout request.');
    } finally {
      setIsRequestingPayout(false);
    }
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

  const currentTab = sidebarTab === 'subscription'
    ? { name: 'Coffee Box Subscription', icon: ShoppingBag }
    : sidebarTab === 'orders'
    ? { name: 'Orders History', icon: Package }
    : sidebarTab === 'network'
    ? { name: 'My Network', icon: Users }
    : sidebarTab === 'commissions'
    ? { name: 'Commissions', icon: TrendingUp }
    : sidebarTab === 'payouts'
    ? { name: 'Payouts', icon: CreditCard }
    : sidebarTab === 'settings'
    ? { name: 'Settings', icon: Settings }
    : { name: 'Dashboard', icon: LayoutDashboard };
  const CurrentTabIcon = currentTab.icon;

  return (
    <div
      className="affiliate-dashboard-wrap"
      style={isUserRoute ? { paddingTop: '24px' } : undefined}
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
      <div className="container portal-container" style={{ position: 'relative', zIndex: 1 }}>
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
                src="/images/title-separator.svg"
                alt="separator"
                style={{ margin: '0 auto 12px', display: 'block', height: '16px' }}
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
          /* Logged In: RESPONSIVE TOP-NAVIGATION USER PORTAL */
          <>
            {/* TOP DASHBOARD HEADER & NAVIGATION CARD */}
            <header className="portal-top-header">
              {/* Upper Tier: Brand / User Profile / Referral Pill / Actions */}
              <div className="portal-header-upper">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <Link href="/user/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Caffeloja" style={{ height: '34px', width: 'auto', display: 'block' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="portal-brand-text">
                          Caffeloja
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: user.hasActiveSubscription
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            border: user.hasActiveSubscription
                              ? '1px solid rgba(16, 185, 129, 0.5)'
                              : '1px solid rgba(239, 68, 68, 0.5)',
                            color: user.hasActiveSubscription ? '#34d399' : '#fca5a5',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          <ShieldCheck size={12} />
                          {user.hasActiveSubscription ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#8e7c72' }}>
                        Member & Rewards Portal
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Right: Referral Pill, User Profile, Visit Store, Log Out */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Referral Code Quick Copy Pill */}
                  {user.referralCode && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.80rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Code:</span>
                      <code style={{ color: 'var(--amber-light)', fontWeight: '700' }}>{user.referralCode}</code>
                      <button
                        type="button"
                        onClick={() => copyReferralLink(user.referralCode, `Referral code (${user.referralCode}) copied!`)}
                        title="Copy Referral Code"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copied ? '#34d399' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}

                  {/* User Profile Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '5px 12px 5px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      className="affiliate-avatar"
                      style={{
                        width: '30px',
                        height: '30px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                        color: '#0d0907',
                        borderRadius: '6px',
                      }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: user.hasActiveSubscription ? '#34d399' : '#fca5a5' }}>
                        {user.hasActiveSubscription ? 'Subscribed' : 'No Active Plan'}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="btn-secondary btn-sm"
                    style={{
                      padding: '6px 13px',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '6px',
                      height: '34px',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Visit Store</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="btn-outline btn-sm"
                    style={{
                      padding: '6px 13px',
                      fontSize: '0.82rem',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      height: '34px',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Lower Tier: Navigation Menu Tabs on Top with Mobile Non-Scrolling Menu Bar */}
              <div className="portal-nav-section">
                {/* Mobile Active Header & Toggle Button (Shown on mobile screens) */}
                <div
                  className="portal-mobile-menu-bar"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className="portal-mobile-active-info">
                    <span className="portal-mobile-active-label">SECTION</span>
                    <div className="portal-mobile-active-title">
                      <CurrentTabIcon size={16} />
                      <span>{currentTab.name}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="portal-mobile-menu-toggle-btn"
                    aria-label="Toggle Navigation Menu"
                  >
                    <span>{mobileMenuOpen ? 'Close Menu' : 'Menu Options'}</span>
                    {mobileMenuOpen ? <X size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {/* Navigation Tabs (Horizontal on desktop, Non-scrolling 2-col grid on mobile when open) */}
                <nav className={`portal-top-nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                  <Link
                    href="/user/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'overview' ? 'active' : ''}`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/user/subscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'subscription' ? 'active' : ''}`}
                  >
                    <ShoppingBag size={16} />
                    <span>Coffee Box Subscription</span>
                  </Link>

                  <Link
                    href="/user/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'orders' ? 'active' : ''}`}
                  >
                    <Package size={16} />
                    <span>Orders History</span>
                  </Link>

                  <Link
                    href="/user/network"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'network' ? 'active' : ''}`}
                  >
                    <Users size={16} />
                    <span>My Network</span>
                  </Link>

                  <Link
                    href="/user/commissions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'commissions' ? 'active' : ''}`}
                  >
                    <TrendingUp size={16} />
                    <span>Commissions</span>
                  </Link>

                  <Link
                    href="/user/payouts"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'payouts' ? 'active' : ''}`}
                  >
                    <CreditCard size={16} />
                    <span>Payouts</span>
                  </Link>

                  <Link
                    href="/user/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`portal-nav-tab ${sidebarTab === 'settings' ? 'active' : ''}`}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </header>

            {/* FULL-WIDTH MAIN CONTENT AREA */}
            <main className="portal-main-card">
              {/* Content Title Header */}
              <div className="portal-content-header">
                <div>
                  <h1 className="portal-content-title">
                    {sidebarTab === 'overview' && 'Member Dashboard'}
                    {sidebarTab === 'subscription' && 'Coffee Box Subscription'}
                    {sidebarTab === 'orders' && 'Orders History'}
                    {sidebarTab === 'network' && 'My Referral Network'}
                    {sidebarTab === 'commissions' && 'Commissions & Earnings'}
                    {sidebarTab === 'payouts' && 'Payout Requests & History'}
                    {sidebarTab === 'settings' && 'Account Settings'}
                  </h1>
                  <p className="portal-content-subtitle">
                    {sidebarTab === 'overview' && 'Track your network growth, commissions, and monthly coffee subscription'}
                    {sidebarTab === 'subscription' && 'Manage your recurring $69/month specialty coffee box deliveries'}
                    {sidebarTab === 'orders' && 'View fulfilled coffee box orders, receipts, and tracking information'}
                    {sidebarTab === 'network' && 'Explore your 4-level referral genealogy and team performance'}
                    {sidebarTab === 'commissions' && 'Detailed breakdown of direct and indirect sponsor commission rewards'}
                    {sidebarTab === 'payouts' && 'Manage payout methods, request cash withdrawals, and view statements'}
                    {sidebarTab === 'settings' && 'Update profile details, password, shipping addresses, and security settings'}
                  </p>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                                {ord.orderNumber}
                              </strong>
                              {ord.orderType === 'subscription' || ord.orderNumber?.startsWith('SUB-') || ord.orderNumber?.startsWith('REN-') ? (
                                <span
                                  style={{
                                    fontSize: '0.66rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    padding: '1px 7px',
                                    borderRadius: '5px',
                                    background: 'rgba(245, 158, 11, 0.18)',
                                    border: '1px solid rgba(245, 158, 11, 0.5)',
                                    color: '#fbbf24',
                                  }}
                                >
                                  Subscription
                                </span>
                              ) : ord.orderType === 'guest' || ord.isGuest ? (
                                <span
                                  style={{
                                    fontSize: '0.66rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    padding: '1px 7px',
                                    borderRadius: '5px',
                                    background: 'rgba(147, 197, 253, 0.14)',
                                    border: '1px solid rgba(147, 197, 253, 0.4)',
                                    color: '#93c5fd',
                                  }}
                                >
                                  Guest Order
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.66rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    padding: '1px 7px',
                                    borderRadius: '5px',
                                    background: 'rgba(52, 211, 153, 0.14)',
                                    border: '1px solid rgba(52, 211, 153, 0.4)',
                                    color: '#34d399',
                                  }}
                                >
                                  Store Order
                                </span>
                              )}
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

              {/* TAB 4: PAYOUTS (STRIPE CONNECT INTEGRATION) */}
              {sidebarTab === 'payouts' && (
                <div className="animate-fadeIn">
                  {/* Top Summary Metrics */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Available Balance
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'var(--amber-light)',
                          marginTop: '4px',
                        }}
                      >
                        ${(user?.walletBalance || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Ready for Stripe withdrawal
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total Withdrawn
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          marginTop: '4px',
                        }}
                      >
                        ${(user?.totalWithdrawn || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Transferred to connected bank
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Payout Threshold
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: '#d4af37',
                          marginTop: '4px',
                        }}
                      >
                        ${Number(stripeConnectData.minimumPayout || 20).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Minimum required per transfer
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Request Payout & Stripe Connect Status */}
                  <div className="user-cards-grid-2">
                    {/* Left: Request Payout Card */}
                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                            Request Payout
                          </h3>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              background: stripeConnectData.payoutsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: stripeConnectData.payoutsEnabled ? 'var(--success)' : '#ef4444',
                              border: stripeConnectData.payoutsEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            {stripeConnectData.payoutsEnabled ? 'Payouts Active' : 'Stripe Required'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                          Commission payouts are transferred directly to your bank account or debit card via Stripe Connect Express.
                        </p>

                        {payoutMessage && (
                          <div
                            style={{
                              background: 'rgba(16, 185, 129, 0.14)',
                              border: '1px solid var(--success)',
                              color: 'var(--success)',
                              padding: '12px',
                              borderRadius: '8px',
                              fontSize: '0.84rem',
                              marginBottom: '16px',
                            }}
                          >
                            {payoutMessage}
                          </div>
                        )}

                        {!stripeConnectData.payoutsEnabled ? (
                          <div
                            style={{
                              background: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '10px',
                              padding: '14px',
                              marginBottom: '16px',
                              fontSize: '0.82rem',
                              color: '#fbbf24',
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Stripe Connect Setup Required</div>
                            <div>Please link and verify your Stripe Express account on the right before requesting a commission transfer.</div>
                          </div>
                        ) : (
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Amount to Withdraw ($ USD)
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <span style={{ position: 'absolute', left: '14px', color: 'var(--amber-light)', fontWeight: '700', fontSize: '1.1rem' }}>
                                $
                              </span>
                              <input
                                type="number"
                                min={stripeConnectData.minimumPayout || 20}
                                max={user?.walletBalance || 0}
                                step="0.01"
                                placeholder={(user?.walletBalance || 0).toFixed(2)}
                                value={payoutWithdrawAmount}
                                onChange={(e) => setPayoutWithdrawAmount(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '12px 14px 12px 30px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid var(--mocha-border)',
                                  borderRadius: '10px',
                                  color: 'var(--text-primary)',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                }}
                              />
                            </div>

                            {/* Quick Amount Chips */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                              {[20, 50, 100].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setPayoutWithdrawAmount(String(amt))}
                                  disabled={(user?.walletBalance || 0) < amt}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--mocha-border)',
                                    color: (user?.walletBalance || 0) >= amt ? 'var(--text-primary)' : 'var(--text-muted)',
                                    cursor: (user?.walletBalance || 0) >= amt ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  ${amt}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setPayoutWithdrawAmount(String((user?.walletBalance || 0).toFixed(2)))}
                                disabled={(user?.walletBalance || 0) < (stripeConnectData.minimumPayout || 20)}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(196, 143, 59, 0.15)',
                                  border: '1px solid rgba(196, 143, 59, 0.4)',
                                  color: '#e4b363',
                                  cursor: (user?.walletBalance || 0) >= (stripeConnectData.minimumPayout || 20) ? 'pointer' : 'not-allowed',
                                  fontWeight: '600',
                                }}
                              >
                                Max Available
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestPayout}
                        disabled={
                          !stripeConnectData.payoutsEnabled ||
                          (user?.walletBalance || 0) < (stripeConnectData.minimumPayout || 20) ||
                          isRequestingPayout
                        }
                        className="btn-primary"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          marginTop: '12px',
                          opacity: !stripeConnectData.payoutsEnabled || (user?.walletBalance || 0) < (stripeConnectData.minimumPayout || 20) ? 0.6 : 1,
                        }}
                      >
                        <span>
                          {isRequestingPayout
                            ? 'Processing Stripe Transfer...'
                            : !stripeConnectData.payoutsEnabled
                            ? 'Connect Stripe First'
                            : (user?.walletBalance || 0) < (stripeConnectData.minimumPayout || 20)
                            ? `Minimum $${(stripeConnectData.minimumPayout || 20).toFixed(2)} Required`
                            : 'Transfer to Bank via Stripe ⚡'}
                        </span>
                      </button>
                    </div>

                    {/* Right: Stripe Connect Status & Management Card */}
                    <div
                      style={{
                        background: '#140e0a',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '16px',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                            Stripe Connect Destination
                          </h3>
                          <button
                            type="button"
                            onClick={handleRefreshStripeStatus}
                            disabled={isStripeLoading}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                            }}
                            title="Refresh status from Stripe"
                          >
                            <RefreshCw size={13} className={isStripeLoading ? 'spin-icon' : ''} />
                            <span>Sync</span>
                          </button>
                        </div>

                        {stripeConnectData.payoutsEnabled ? (
                          <>
                            <div
                              style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: '700', fontSize: '0.92rem', marginBottom: '6px' }}>
                                <CheckCircle2 size={18} />
                                <span>Stripe Connect Active &amp; Verified</span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                Your Stripe Express account is ready to receive instant affiliate transfers. Payouts deposit directly to your connected bank account.
                              </p>
                              {stripeConnectData.stripeConnectAccountId && (
                                <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                  Stripe ID: {stripeConnectData.stripeConnectAccountId}
                                </div>
                              )}
                            </div>

                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                              You can manage your connected US bank account, debit card, tax information, and view statements anytime in your Stripe Express dashboard.
                            </p>
                          </>
                        ) : stripeConnectData.stripeConnectAccountId ? (
                          <>
                            <div
                              style={{
                                background: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                              }}
                            >
                              <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.92rem', marginBottom: '6px' }}>
                                ⚠ Onboarding Incomplete
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                Your Stripe Connect account is registered, but requires verification (bank account or ID) before transfers can be initiated.
                              </p>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                              Click below to finish setting up your bank or debit card on Stripe.
                            </p>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--mocha-border)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                              }}
                            >
                              <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--amber-light)', marginBottom: '6px' }}>
                                Direct Deposit via Stripe Express
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                Connect your US checking account (ACH) or debit card securely. Stripe manages identity checks and deposits your earnings automatically.
                              </p>
                            </div>

                            <ul style={{ paddingLeft: '18px', margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                              <li>Direct transfer into your local bank or debit card</li>
                              <li>Zero manual routing errors or hold delays</li>
                              <li>Bank-grade 256-bit encryption and 2FA protection</li>
                            </ul>
                          </>
                        )}
                      </div>

                      <div>
                        {stripeConnectData.payoutsEnabled ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={handleOpenStripeDashboard}
                              disabled={isConnectingStripe}
                              className="btn-secondary"
                              style={{ flex: 1, justifyContent: 'center' }}
                            >
                              <span>Manage in Stripe ↗</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleRefreshStripeStatus}
                              disabled={isStripeLoading}
                              className="btn-secondary"
                              style={{ padding: '0 14px', justifyContent: 'center' }}
                              title="Refresh verification status"
                            >
                              <RefreshCw size={15} className={isStripeLoading ? 'spin-icon' : ''} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleStartStripeOnboarding}
                            disabled={isConnectingStripe}
                            className="btn-primary"
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #635bff 0%, #4f46e5 100%)',
                              borderColor: '#635bff',
                            }}
                          >
                            <span>
                              {isConnectingStripe
                                ? 'Redirecting to Stripe...'
                                : stripeConnectData.stripeConnectAccountId
                                ? 'Resume Stripe Setup ↗'
                                : 'Connect with Stripe ↗'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payout History Section */}
                  <div
                    style={{
                      background: '#140e0a',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '16px',
                      padding: '22px',
                      marginTop: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                        Payout History &amp; Transfers
                      </h3>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {(stripeConnectData.payouts || []).length} transfer{(stripeConnectData.payouts || []).length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {stripeConnectData.payouts && stripeConnectData.payouts.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stripeConnectData.payouts.map((p) => {
                          const isPaid = p.status === 'paid';
                          const isFailed = p.status === 'failed';
                          return (
                            <div
                              key={p._id || p.stripeTransferId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--mocha-border)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                gap: '12px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                                    Stripe Direct Deposit
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: '700',
                                      textTransform: 'uppercase',
                                      padding: '2px 8px',
                                      borderRadius: '999px',
                                      background: isPaid
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : isFailed
                                        ? 'rgba(239, 68, 68, 0.15)'
                                        : 'rgba(59, 130, 246, 0.15)',
                                      color: isPaid ? 'var(--success)' : isFailed ? '#ef4444' : '#60a5fa',
                                      border: isPaid
                                        ? '1px solid rgba(16, 185, 129, 0.3)'
                                        : isFailed
                                        ? '1px solid rgba(239, 68, 68, 0.3)'
                                        : '1px solid rgba(59, 130, 246, 0.3)',
                                    }}
                                  >
                                    {p.status || 'processing'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  {new Date(p.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {p.stripeTransferId ? ` • Transfer ID: ${p.stripeTransferId}` : ''}
                                  {p.failureReason ? ` • Error: ${p.failureReason}` : ''}
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: isPaid ? 'var(--amber-light)' : 'var(--text-secondary)',
                                  }}
                                >
                                  ${Number(p.amount || 0).toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  USD • Instant Transfer
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed var(--mocha-border)',
                          borderRadius: '12px',
                          padding: '30px 20px',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}>
                          No payouts requested yet
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Once your balance reaches ${Number(stripeConnectData.minimumPayout || 20).toFixed(2)}, you can transfer your commission balance directly to Stripe.
                        </p>
                      </div>
                    )}
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
          </>
        )}
      </div>
    </div>
  );
}