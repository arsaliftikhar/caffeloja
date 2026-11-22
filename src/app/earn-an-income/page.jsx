import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CommissionCalculator from '@/components/CommissionCalculator';

export const metadata = {
  title: 'Earn An Income | Caffeloja',
  description:
    'Learn how Caffeloja’s $69 monthly Coffee Box subscription keeps your account active to earn recurring commissions across 4 levels ($10, $8, $6, $6).',
};

export default function EarnAnIncomePage() {
  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .income-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (max-width: 768px) {
          .income-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <img
            src="/images/title-separator.svg"
            alt="separator"
            style={{ margin: '0 auto 14px', display: 'block', height: '16px' }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '14px',
            }}
          >
            Earn An Income With Coffee
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Your <strong>$69 monthly subscription</strong> delivers a fresh box of <strong>20 gourmet coffee pods</strong> every month and keeps your account active to earn recurring commissions from your network.
          </p>
        </div>

        {/* Three Steps */}
        <div className="income-steps-grid">
          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '24px 20px',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 01
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', marginBottom: '8px' }}>
              $69 Monthly Box
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Subscribe for $69/month to receive 20 freshly roasted Arabica coffee pods delivered to your door.
            </p>
          </div>

          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '24px 20px',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 02
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', marginBottom: '8px' }}>
              Active Account
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Your active subscription qualifies your account to earn commissions on every box ordered in your downline.
            </p>
          </div>

          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '24px 20px',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 03
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', marginBottom: '8px' }}>
              4-Tier Commissions
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Earn $10, $8, $6, and $6 per box across 4 tiers whenever your network purchases their monthly coffee.
            </p>
          </div>
        </div>

        {/* Section Title for Plan & Calculator */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              marginBottom: '8px',
            }}
          >
            Compensation Plan & Calculator
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto 10px' }}>
            Out of every $69 box, $30 is shared back with active members. Adjust the subscribers in each tier to calculate your monthly recurring income:
          </p>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--amber-light)',
              fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
              fontWeight: '700',
              letterSpacing: '0.3px',
              margin: '0 auto',
            }}
          >
            An affiliate can earn $0 - $72,000 Per Month In This Business
          </p>
        </div>

        {/* Interactive Calculator */}
        <div style={{ marginBottom: '32px' }}>
          <CommissionCalculator />
        </div>

        {/* Qualification Note */}
        <div
          style={{
            background: '#140e0a',
            border: '1px solid var(--mocha-border)',
            borderRadius: '14px',
            padding: '16px 20px',
            textAlign: 'center',
            marginBottom: '44px',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>Qualification:</strong> An active $69/month Coffee Box subscription is required to receive downline commissions.
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-primary">
            <span>Get Started</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn-secondary">
            <span>Member Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
