'use client';

import Link from 'next/link';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid rgba(239, 68, 68, 0.4)',
          }}
        >
          <XCircle size={38} />
        </div>

        <span className="section-tag" style={{ color: '#ef4444' }}>Checkout Incomplete</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '12px 0 16px', fontWeight: '700' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '32px' }}>
          Your Stripe checkout session was cancelled and no charges were made to your account. Your cart items have been saved.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/menu" className="btn-primary">
            <ShoppingBag size={18} />
            <span>Return to Coffee Box</span>
          </Link>
          <Link href="/" className="btn-secondary">
            <ArrowLeft size={18} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
