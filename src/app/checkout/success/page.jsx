'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Package, Share2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number') || 'CL-' + Math.floor(100000 + Math.random() * 900000);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clear cart on successful checkout
    try {
      localStorage.removeItem('caffeloja_cart');
    } catch (e) {}
  }, []);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(52, 211, 153, 0.15)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '2px solid rgba(52, 211, 153, 0.4)',
        }}
      >
        <CheckCircle2 size={44} />
      </div>

      <span className="section-tag" style={{ color: '#34d399' }}>Payment Verified & Confirmed</span>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', margin: '12px 0 16px', fontWeight: '700' }}>
        Thank You For Your Order!
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '32px' }}>
        Your payment has been securely processed through Stripe. We are now preparing your <strong>Coffee Box (60 Pods)</strong> for fresh fulfillment and dispatch.
      </p>

      {/* Order Summary Card */}
      <div
        style={{
          background: '#19110c',
          border: '1px solid var(--mocha-border)',
          borderRadius: '20px',
          padding: '28px',
          textAlign: 'left',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--mocha-border)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Order Reference</span>
            <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--amber-light)' }}>
              {orderNumber}
            </strong>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}
          >
            Paid with Stripe
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Product</span>
            <span style={{ fontWeight: '600' }}>Coffee Box (60 Pods)</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Estimated Delivery</span>
            <span style={{ fontWeight: '600' }}>2 - 4 Business Days</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Fulfillment Partner</span>
            <span style={{ fontWeight: '600' }}>Old Chicago Coffee Co.</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Tracking Notification</span>
            <span style={{ fontWeight: '600' }}>Sent via Email</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn-primary">
          <ShoppingBag size={18} />
          <span>Return to Homepage</span>
        </Link>
        <Link href="/affiliate" className="btn-secondary">
          <Share2 size={18} />
          <span>Join Partner Affiliate</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
      <div className="container">
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading order confirmation...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
