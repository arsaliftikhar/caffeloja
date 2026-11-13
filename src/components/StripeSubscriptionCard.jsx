'use client';

import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ALLOWED_SHIPPING_COUNTRY,
  isUnitedStatesCountry,
  US_ONLY_SHIPPING_ERROR,
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

function detectCardBrand(digits) {
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Card';
}

export default function StripeSubscriptionCard({
  user,
  shippingForm,
  setShippingForm,
  onSaveShipping,
  isSavingShipping,
  onActivated,
}) {
  const cardMountRef = useRef(null);
  const stripeRef = useRef(null);
  const cardElementRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Shipping Details, 2: Stripe Payment
  const [cardholderName, setCardholderName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [stripeElementReady, setStripeElementReady] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (user?.name && !cardholderName) {
      setCardholderName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (step !== 2 || !HAS_REAL_STRIPE_PK || !cardMountRef.current) return;
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
  }, [step]);

  const handleContinueStep = async (e) => {
    e.preventDefault();
    if (!validateShipping()) return;
    const saved = await onSaveShipping();
    if (saved) {
      setStep(2);
    }
  };

  const validateShipping = () => {
    if (
      !shippingForm.phone.trim() ||
      !shippingForm.street.trim() ||
      !shippingForm.city.trim() ||
      !shippingForm.postalCode.trim()
    ) {
      toast.error('Please fill in your phone number, street address, city, and ZIP code.');
      return false;
    }
    if (!isUnitedStatesCountry(shippingForm.country)) {
      toast.error(US_ONLY_SHIPPING_ERROR);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateShipping()) return;

    if (!cardholderName.trim()) {
      toast.error('Please enter the name on your card.');
      return;
    }

    const authToken = localStorage.getItem('caffeloja_token');
    setIsSubscribing(true);

    try {
      // Mode 1: Real Stripe Publishable Key configured -> Stripe Card Element PaymentIntent
      if (HAS_REAL_STRIPE_PK && stripeRef.current && cardElementRef.current) {
        const intentRes = await fetch('/api/user/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            action: 'create_payment_intent',
            shipping: shippingForm,
          }),
        });
        const intentData = await intentRes.json();

        if (!intentRes.ok || !intentData.success) {
          toast.error(intentData.message || 'Unable to initialize Stripe payment.');
          return;
        }

        const result = await stripeRef.current.confirmCardPayment(intentData.clientSecret, {
          payment_method: {
            card: cardElementRef.current,
            billing_details: {
              name: cardholderName.trim(),
              email: user?.email || undefined,
              phone: shippingForm.phone.trim(),
            },
          },
        });

        if (result.error) {
          toast.error(result.error.message || 'Card payment declined. Please check your card.');
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          const confirmRes = await fetch('/api/user/subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              action: 'confirm_stripe_payment',
              shipping: shippingForm,
              paymentIntentId: result.paymentIntent.id,
              subscriptionId: intentData.subscriptionId,
              orderId: intentData.orderId,
              cardSummary: {
                brand: 'Stripe Card',
                last4: 'Card',
                cardholderName: cardholderName.trim(),
              },
            }),
          });
          const confirmData = await confirmRes.json();
          if (confirmRes.ok && confirmData.success) {
            onActivated(confirmData.user, confirmData.message);
          } else {
            toast.error(confirmData.message || 'Payment succeeded, but activation failed.');
          }
        }
        return;
      }

      // Mode 2: Standard / Test Mode Embedded Card Form
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 15 || digits.length > 16) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }

      const expDigits = cardExpiry.replace(/\D/g, '');
      if (expDigits.length !== 4) {
        toast.error('Please enter a valid expiration date (MM / YY).');
        return;
      }
      const expMonth = parseInt(expDigits.slice(0, 2), 10);
      const expYear = 2000 + parseInt(expDigits.slice(2, 4), 10);
      const now = new Date();
      if (
        expMonth < 1 ||
        expMonth > 12 ||
        expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
      ) {
        toast.error('Your card expiration date is invalid or expired.');
        return;
      }

      const cvcDigits = cardCvc.replace(/\D/g, '');
      if (cvcDigits.length < 3 || cvcDigits.length > 4) {
        toast.error('Please enter a valid 3 or 4 digit CVC.');
        return;
      }

      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action: 'subscribe',
          shipping: shippingForm,
          cardSummary: {
            brand: detectCardBrand(digits),
            last4: digits.slice(-4),
            cardholderName: cardholderName.trim(),
          },
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onActivated(data.user, data.message);
      } else {
        toast.error(data.message || 'Unable to process subscription payment.');
      }
    } catch {
      toast.error('Connection error while processing subscription payment.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div>
      {/* Clean 2-Step Progress Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '22px',
          background: '#0d0907',
          border: '1px solid var(--mocha-border)',
          borderRadius: '12px',
          padding: '5px',
        }}
      >
        <button
          type="button"
          onClick={() => setStep(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            background: step === 1 ? 'rgba(230, 157, 69, 0.16)' : 'transparent',
            color: step === 1 ? 'var(--amber-light)' : step > 1 ? 'var(--success)' : 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: step > 1 ? 'rgba(16, 185, 129, 0.18)' : step === 1 ? 'var(--amber-primary)' : 'rgba(255,255,255,0.08)',
              color: step > 1 ? 'var(--success)' : step === 1 ? '#120c08' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            {step > 1 ? <Check size={12} /> : '1'}
          </span>
          <span>Shipping</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateShipping()) setStep(2);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            background: step === 2 ? 'rgba(230, 157, 69, 0.16)' : 'transparent',
            color: step === 2 ? 'var(--amber-light)' : 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: step === 2 ? 'var(--amber-primary)' : 'rgba(255,255,255,0.08)',
              color: step === 2 ? '#120c08' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            2
          </span>
          <span>Payment</span>
        </button>
      </div>

      {/* STEP 1: SHIPPING DETAILS */}
      {step === 1 && (
        <form onSubmit={handleContinueStep} className="checkout-form animate-fadeIn">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '4px' }}>
            Step 1: Shipping Details
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Where should we deliver your monthly Coffee Box (20 Pods)?
          </p>

          <div className="form-field">
            <label>Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+1 (555) 234-5678"
              value={shippingForm.phone}
              onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Street Address *</label>
            <input
              type="text"
              required
              placeholder="123 Main Street, Apt 4B"
              value={shippingForm.street}
              onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div className="form-field">
              <label>City *</label>
              <input
                type="text"
                required
                placeholder="Chicago"
                value={shippingForm.city}
                onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>State / Province</label>
              <input
                type="text"
                placeholder="IL"
                value={shippingForm.state}
                onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div className="form-field">
              <label>ZIP / Postal Code *</label>
              <input
                type="text"
                required
                placeholder="60601"
                value={shippingForm.postalCode}
                onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
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
                Shipping available to United States only.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingShipping}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', marginTop: '8px' }}
          >
            <span>{isSavingShipping ? 'Saving Shipping...' : 'Save & Continue to Payment'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* STEP 2: STRIPE CARD PAYMENT */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="checkout-form animate-fadeIn">
          {/* Compact saved address preview */}
          <div
            style={{
              background: '#0d0907',
              border: '1px solid var(--mocha-border)',
              borderRadius: '10px',
              padding: '11px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>
                Shipping To
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '500', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {shippingForm.street}, {shippingForm.city}
                {shippingForm.state ? `, ${shippingForm.state}` : ''} {shippingForm.postalCode} — {ALLOWED_SHIPPING_COUNTRY}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--amber-light)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                flexShrink: 0,
                textDecoration: 'underline',
              }}
            >
              Edit
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: 'var(--amber-light)' }} />
              <span>Step 2: Card Details</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} />
              Secured by Stripe
            </span>
          </div>

          <div className="form-field">
            <label>Name on Card *</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
            />
          </div>

          {HAS_REAL_STRIPE_PK ? (
            <div className="form-field">
              <label>Card Information *</label>
              <div
                ref={cardMountRef}
                style={{
                  background: '#0d0907',
                  border: '1px solid var(--mocha-border)',
                  borderRadius: '10px',
                  padding: '13px 14px',
                  minHeight: '46px',
                }}
              />
              {!stripeElementReady && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Loading Stripe secure card input...
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="form-field">
                <label>Card Number *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-field">
                  <label>Expiration Date *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  />
                </div>

                <div className="form-field">
                  <label>Security Code (CVC) *</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={isSubscribing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}
            >
              <span>
                {isSubscribing
                  ? 'Processing Payment...'
                  : user?.hasActiveSubscription
                  ? 'Pay $69.00 & Renew Subscription'
                  : 'Pay $69.00 & Activate Subscription'}
              </span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Shipping Details</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Billed monthly ($69.00/mo) &bull; Cancel anytime
          </div>
        </form>
      )}
    </div>
  );
}
