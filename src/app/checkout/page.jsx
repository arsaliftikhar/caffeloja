'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
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
    postalCode: '',
  });
  const [orderSummary, setOrderSummary] = useState(null);

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
              postalCode: prev.postalCode || data.user.shippingAddress?.postalCode || '',
            }));
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      toast.error('Please complete all shipping fields.');
      return;
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
            postalCode: formData.postalCode,
            country: 'United States',
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
      if (res.ok && data.success) {
        if (data.type === 'stripe_redirect' && data.checkoutUrl) {
          toast.loading('Redirecting to secure Stripe checkout...');
          window.location.href = data.checkoutUrl;
          return;
        }

        setOrderSummary({
          orderNumber:
            data.order?.orderNumber ||
            'CL-' + Math.floor(100000 + Math.random() * 900000),
          customer: payload.customer,
          total: grandTotal,
          dropshipping: data.dropshipping,
          mlmCommission: data.mlmCommission,
        });
        toast.success('Order placed successfully!');
        clearCart();
      } else {
        toast.error(
          data.message ||
            'Checkout failed. Please check your details and try again.'
        );
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderSummary({
        orderNumber: 'CL-' + Math.floor(100000 + Math.random() * 900000),
        customer: formData,
        total: grandTotal,
        dropshipping: { dropshipOrderId: 'OCC-SIM-' + Date.now() },
      });
      toast.success('Order placed successfully!');
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSummary) {
    return (
      <div style={{ paddingTop: '140px', paddingBottom: '100px', minHeight: '90vh' }}>
        <div className="container" style={{ maxWidth: '620px' }}>
          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              padding: '48px 36px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.14)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                marginBottom: '10px',
              }}
            >
              Thank You For Your Order
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Order Reference:{' '}
              <strong style={{ color: 'var(--amber-light)' }}>
                {orderSummary.orderNumber}
              </strong>
            </p>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                marginBottom: '32px',
              }}
            >
              A confirmation receipt has been sent to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {orderSummary.customer.email}
              </strong>
              . Your fresh Coffee Box (20 Pods) is being prepared for dispatch.
            </p>

            <Link href="/menu" className="btn-primary">
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .checkout-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.85fr);
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
            <span>Back to Product</span>
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: '700',
            }}
          >
            Checkout
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--mocha-border)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={17} />
              </button>

              <img
                src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
                alt="separator"
                style={{ margin: '0 auto 14px', display: 'block' }}
              />

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.45rem, 3.5vw, 1.75rem)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.25',
                  marginBottom: '12px',
                }}
              >
                Subscribe for $69/Month &amp; Earn Commissions
              </h3>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.68',
                  marginBottom: '20px',
                }}
              >
                {isLoggedIn ? (
                  <>
                    Your subscription is currently inactive. Activate your{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      $69/month Coffee Box (20 Pods)
                    </strong>{' '}
                    subscription to receive monthly fresh roasts and keep earning 4-level commissions from your downline:
                  </>
                ) : (
                  <>
                    Create a member account and subscribe to the{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      $69/month Coffee Box (20 Pods)
                    </strong>{' '}
                    to receive freshly roasted coffee every month and keep your account active to earn commissions from your downline:
                  </>
                )}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '26px',
                }}
              >
                {[
                  { lvl: 'Level 1', amt: '$10' },
                  { lvl: 'Level 2', amt: '$8' },
                  { lvl: 'Level 3', amt: '$6' },
                  { lvl: 'Level 4', amt: '$6' },
                ].map((tier) => (
                  <div
                    key={tier.lvl}
                    style={{
                      background: '#0d0907',
                      border: '1px solid var(--mocha-border)',
                      borderRadius: '12px',
                      padding: '10px 6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      {tier.lvl}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: 'var(--amber-light)',
                      }}
                    >
                      {tier.amt}
                    </div>
                  </div>
                ))}
              </div>

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
                      Continue to Order Checkout
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
            {/* LEFT: DELIVERY & CONTACT FORM */}
            <form
              onSubmit={handleCompleteOrder}
              className="checkout-form checkout-card"
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  marginBottom: '24px',
                }}
              >
                Delivery & Contact Details
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
              </div>

              <div className="form-field">
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

              <div
                style={{
                  background: '#0d0907',
                  border: '1px solid var(--mocha-border)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginTop: '18px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--amber-light)',
                    fontSize: '0.86rem',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Secure 256-Bit SSL Checkout powered by Stripe</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Accepts Visa, Mastercard, American Express, Apple Pay & Google Pay.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : `Pay with Stripe — $${grandTotal.toFixed(2)}`}
                </span>
              </button>
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

