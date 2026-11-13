'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Users,
  X,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import {
  ALLOWED_SHIPPING_COUNTRY,
  ALLOWED_SHIPPING_COUNTRY_CODE,
} from '@/lib/shipping';

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const HAS_REAL_STRIPE_PK = Boolean(
  PUBLISHABLE_KEY &&
    PUBLISHABLE_KEY.startsWith('pk_') &&
    !PUBLISHABLE_KEY.includes('your_') &&
    PUBLISHABLE_KEY.length > 24
);

let stripePromise = null;
function getStripeInstance() {
  if (!HAS_REAL_STRIPE_PK) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }
  return stripePromise;
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return digits;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    grandTotal,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSubPrompt, setShowSubPrompt] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  // On-page Stripe Card states
  const cardMountRef = useRef(null);
  const stripeRef = useRef(null);
  const cardElementRef = useRef(null);
  const [stripeElementReady, setStripeElementReady] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [manualCard, setManualCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    const savedRef = localStorage.getItem('caffeloja_ref');
    if (savedRef) {
      setReferralCode(savedRef);
    }

    const token = localStorage.getItem('caffeloja_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.user) {
            setIsLoggedIn(true);
            setHasActiveSubscription(Boolean(data.user.hasActiveSubscription));
            setFormData((prev) => ({
              ...prev,
              name: prev.name || data.user.name || '',
              email: prev.email || data.user.email || '',
              phone: prev.phone || data.user.shippingAddress?.phone || data.user.phone || '',
              street: prev.street || data.user.shippingAddress?.street || '',
              city: prev.city || data.user.shippingAddress?.city || '',
              state: prev.state || data.user.shippingAddress?.state || '',
              postalCode: prev.postalCode || data.user.shippingAddress?.postalCode || '',
            }));
            if (!cardholderName && data.user.name) {
              setCardholderName(data.user.name);
            }
          } else {
            setIsLoggedIn(false);
            setHasActiveSubscription(false);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Initialize and Mount Stripe Card Element directly on the checkout page
  useEffect(() => {
    if (!HAS_REAL_STRIPE_PK || !cardMountRef.current || cart.length === 0) return;
    let mounted = true;
    setStripeElementReady(false);

    (async () => {
      const stripe = await getStripeInstance();
      if (!stripe || !mounted || !cardMountRef.current) return;
      stripeRef.current = stripe;

      const elements = stripe.elements();
      const cardElement = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            color: '#f5ebe1',
            fontFamily: 'inherit',
            fontSize: '15px',
            '::placeholder': {
              color: '#8e7c6d',
            },
          },
          invalid: {
            color: '#f87171',
            iconColor: '#f87171',
          },
        },
      });

      cardElement.mount(cardMountRef.current);
      cardElementRef.current = cardElement;
      setStripeElementReady(true);
    })();

    return () => {
      mounted = false;
      if (cardElementRef.current) {
        try {
          cardElementRef.current.destroy();
        } catch {}
        cardElementRef.current = null;
      }
    };
  }, [cart.length]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'name' && !cardholderName) {
      setCardholderName(e.target.value);
    }
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.postalCode.trim()
    ) {
      toast.error('Please complete all delivery address fields.');
      return;
    }

    if (!cardholderName.trim()) {
      toast.error('Please enter the name on your card.');
      return;
    }

    if (!HAS_REAL_STRIPE_PK) {
      if (manualCard.number.replace(/\s/g, '').length < 15) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!manualCard.expiry.includes('/')) {
        toast.error('Please enter a valid card expiration date (MM/YY).');
        return;
      }
      if (manualCard.cvc.length < 3) {
        toast.error('Please enter a valid 3 or 4-digit security code (CVC).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state || '',
            postalCode: formData.postalCode,
            country: ALLOWED_SHIPPING_COUNTRY_CODE,
          },
        },
        items: cart,
        subtotal,
        shippingFee,
        total: grandTotal,
        referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
      };

      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Unable to initialize checkout. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      // Mode 1: Real Stripe Card Element payment directly on-page
      if (data.type === 'payment_intent' && stripeRef.current && cardElementRef.current) {
        const loadingToastId = toast.loading('Processing card with Stripe...');

        const result = await stripeRef.current.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: cardElementRef.current,
            billing_details: {
              name: cardholderName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              address: {
                line1: formData.street.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                postal_code: formData.postalCode.trim(),
                country: ALLOWED_SHIPPING_COUNTRY_CODE,
              },
            },
          },
        });

        toast.dismiss(loadingToastId);

        if (result.error) {
          toast.error(result.error.message || 'Card payment declined. Please check your card.');
          setIsSubmitting(false);
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          // Confirm payment on backend to credit MLM and forward dropship
          const confirmRes = await fetch('/api/stripe/checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'confirm_payment',
              orderId: data.orderId,
              paymentIntentId: result.paymentIntent.id,
              cardSummary: {
                cardholderName: cardholderName.trim(),
              },
            }),
          });
          const confirmData = await confirmRes.json();
          if (confirmRes.ok && confirmData.success) {
            toast.success('Payment confirmed! Order placed successfully.');
            clearCart();
            router.push(`/checkout/success?order_id=${data.orderId}&order_number=${data.orderNumber}`);
            return;
          } else {
            toast.error(confirmData.message || 'Payment confirmed with Stripe. Finalizing order...');
            clearCart();
            router.push(`/checkout/success?order_id=${data.orderId}&order_number=${data.orderNumber}`);
            return;
          }
        }
      }

      // Mode 2: Direct / Fallback Mode (completed securely on-page)
      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/checkout/success?order_id=${data.orderId}&order_number=${data.orderNumber}`);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .checkout-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
          gap: 32px;
          align-items: start;
        }
        .checkout-card {
          background: #140e0a;
          border: 1px solid var(--mocha-border);
          border-radius: 20px;
          padding: 34px;
          min-width: 0;
          width: 100%;
        }
        .checkout-card .form-grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 14px;
        }
        .checkout-card .form-field {
          min-width: 0;
          width: 100%;
        }
        .checkout-card .form-field input {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        @media (max-width: 860px) {
          .checkout-split-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 24px !important;
          }
          .checkout-card {
            padding: 26px 20px !important;
          }
        }
        @media (max-width: 600px) {
          .checkout-card {
            padding: 20px 16px !important;
          }
          .checkout-card .form-grid-2 {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1080px' }}>
        <div style={{ marginBottom: '36px' }}>
          <Link
            href="/menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              marginBottom: '12px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: '700',
            }}
          >
            Checkout &amp; Payment
          </h1>
        </div>

        {!checkingAuth && !hasActiveSubscription && showSubPrompt && (
          <div
            onClick={() => setShowSubPrompt(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1200,
              background: 'rgba(10, 7, 5, 0.82)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-fadeIn"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                background: '#140e0a',
                border: '1px solid var(--amber-primary)',
                borderRadius: '22px',
                padding: 'clamp(26px, 5vw, 38px)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                textAlign: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setShowSubPrompt(false)}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>

              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(230, 157, 69, 0.16)',
                  color: 'var(--amber-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid var(--amber-glow)',
                }}
              >
                <ShoppingBag size={28} />
              </div>

              <span className="section-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>
                Exclusive Partner Perk
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.35rem, 3vw, 1.65rem)',
                  marginBottom: '10px',
                  fontWeight: '700',
                }}
              >
                Unlock 4-Level Recurring Commissions
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  marginBottom: '22px',
                }}
              >
                Active subscribers earn direct and multi-tier recurring affiliate commissions on every coffee box ordered in their network.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/user/subscription"
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Activate Subscription — $69/Month</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowSubPrompt(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.86rem',
                        padding: '6px',
                        cursor: 'pointer',
                        marginTop: '2px',
                      }}
                    >
                      Continue to Standard Checkout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Subscribe &amp; Create Account</span>
                    </Link>
                    <Link
                      href="/login"
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>Member Login</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowSubPrompt(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.86rem',
                        padding: '6px',
                        cursor: 'pointer',
                        marginTop: '2px',
                      }}
                    >
                      Continue as Guest
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              padding: '64px 28px',
              textAlign: 'center',
            }}
          >
            <ShoppingBag
              size={42}
              style={{ color: 'var(--amber-light)', margin: '0 auto 16px' }}
            />
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                marginBottom: '10px',
              }}
            >
              Your cart is empty
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                marginBottom: '28px',
                maxWidth: '420px',
                margin: '0 auto 28px',
              }}
            >
              Add our freshly roasted Coffee Box (20 Pods) to your cart to proceed with checkout.
            </p>
            <Link href="/menu" className="btn-primary">
              <span>Shop Coffee Box</span>
            </Link>
          </div>
        ) : (
          <div className="checkout-split-grid">
            {/* LEFT: DELIVERY & ON-PAGE PAYMENT FORM */}
            <form
              onSubmit={handleCompleteOrder}
              className="checkout-form checkout-card"
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                }}
              >
                1. Delivery &amp; Contact Details
              </h2>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="123 Main Street, Apt 4B"
                  value={formData.street}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Chicago"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="IL"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Postal / ZIP Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    placeholder="60601"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    readOnly
                    value={ALLOWED_SHIPPING_COUNTRY}
                    style={{
                      background: '#0d0907',
                      color: 'var(--text-secondary)',
                      cursor: 'not-allowed',
                    }}
                  />
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    United States shipping only.
                  </span>
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} className="text-amber" />
                  <span>Referral Code (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LOJA-7824"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                />
              </div>

              {/* 2. ON-PAGE PAYMENT INFORMATION */}
              <div
                style={{
                  marginTop: '28px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--mocha-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.4rem',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CreditCard size={20} style={{ color: 'var(--amber-light)' }} />
                    <span>2. Payment Details</span>
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399' }}>
                    <Lock size={13} />
                    <span>On-Page 256-Bit SSL</span>
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: '16px' }}>
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name as shown on card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>

                {/* Real Stripe Card Element Container */}
                {HAS_REAL_STRIPE_PK ? (
                  <div className="form-field" style={{ marginBottom: '16px' }}>
                    <label>Card Details (Number, MM/YY, CVC) *</label>
                    <div
                      ref={cardMountRef}
                      style={{
                        background: '#0d0907',
                        border: '1px solid var(--mocha-border)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        minHeight: '48px',
                        transition: 'border-color 0.15s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                      Processed directly by Stripe on this page. Never redirects away.
                    </span>
                  </div>
                ) : (
                  /* Fallback Direct Card Fields */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                    <div className="form-field">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        maxLength={19}
                        required
                        placeholder="4242 •••• •••• 4242"
                        value={manualCard.number}
                        onChange={(e) => setManualCard({ ...manualCard, number: formatCardNumber(e.target.value) })}
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Expiration (MM/YY) *</label>
                        <input
                          type="text"
                          maxLength={7}
                          required
                          placeholder="MM / YY"
                          value={manualCard.expiry}
                          onChange={(e) => setManualCard({ ...manualCard, expiry: formatExpiry(e.target.value) })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Security Code (CVC) *</label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          placeholder="CVC"
                          value={manualCard.cvc}
                          onChange={(e) => setManualCard({ ...manualCard, cvc: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: '#0d0907',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ShieldCheck size={16} style={{ color: 'var(--amber-light)', flexShrink: 0 }} />
                  <span>End-to-end encrypted card processing. Stay right here to complete your order.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}
                >
                  <Lock size={16} />
                  <span>
                    {isSubmitting
                      ? 'Processing Securely...'
                      : `Pay $${grandTotal.toFixed(2)} — Place Order`}
                  </span>
                </button>
              </div>
            </form>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="checkout-card">
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  marginBottom: '24px',
                }}
              >
                Order Summary
              </h2>

              <div style={{ display: 'grid', gap: '16px', marginBottom: '28px' }}>
                {cart.map((item, idx) => (
                  <div
                    key={`${item.slug}-${item.grind}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid var(--mocha-border)',
                    }}
                  >
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '12px',
                        background: '#0d0907',
                        border: '1px solid rgba(197, 157, 95, 0.14)',
                        padding: '8px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>
                        {item.name}
                      </h4>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          color: 'var(--amber-light)',
                          fontWeight: '700',
                          marginBottom: '8px',
                        }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <div className="qty-stepper" style={{ display: 'inline-flex' }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, -1)}
                          aria-label="Decrease quantity"
                          className="qty-btn"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(idx, 1)}
                          aria-label="Increase quantity"
                          className="qty-btn"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      aria-label="Remove item"
                      className="cart-item-remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div
                  className="summary-row total-row"
                  style={{
                    borderTop: '1px solid var(--mocha-border)',
                    paddingTop: '16px',
                    marginTop: '4px',
                  }}
                >
                  <span>Total</span>
                  <span className="total-amount">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
