import Link from 'next/link';
import { ArrowRight, ArrowDown } from 'lucide-react';

export const metadata = {
  title: 'Earn An Income | Caffeloja',
  description:
    'Learn how Caffeloja’s $69 monthly Coffee Box subscription keeps your account active to earn commissions across 4 levels ($10, $8, $6, $6).',
};

export default function EarnAnIncomePage() {
  const levels = [
    {
      level: 1,
      name: 'Level 1',
      who: 'Direct members you invite',
      amount: 10,
      barWidth: '100%',
    },
    {
      level: 2,
      name: 'Level 2',
      who: 'Members invited by your Level 1',
      amount: 8,
      barWidth: '80%',
    },
    {
      level: 3,
      name: 'Level 3',
      who: 'Members invited by your Level 2',
      amount: 6,
      barWidth: '60%',
    },
    {
      level: 4,
      name: 'Level 4',
      who: 'Members invited by your Level 3',
      amount: 6,
      barWidth: '60%',
    },
  ];

  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .income-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 56px;
        }
        .income-level-row {
          width: 100%;
          background: #1a120d;
          border: 1px solid var(--mocha-border);
          border-radius: 16px;
          padding: 20px 26px;
          display: grid;
          grid-template-columns: 1.3fr 1fr auto;
          align-items: center;
          gap: 20px;
        }
        @media (max-width: 820px) {
          .income-steps-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 16px !important;
          }
          .income-level-row {
            grid-template-columns: 1fr auto !important;
            padding: 18px 20px !important;
          }
          .income-level-bar {
            display: none !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '880px' }}>
        {/* 1. HEADER */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px' }}>
          <img
            src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
            alt="separator"
            style={{ margin: '0 auto 14px', display: 'block' }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '16px',
            }}
          >
            Earn An Income With Coffee
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.75' }}>
            Your <strong>$69 monthly subscription</strong> sends you a fresh box of <strong>20 gourmet coffee pods</strong> every month and keeps your account active to earn commissions from your downline.
          </p>
        </div>

        {/* 2. THREE SIMPLE STEPS */}
        <div className="income-steps-grid">
          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 01
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '8px' }}>
              $69 Monthly Box
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
              Subscribe for $69/month and receive 20 freshly roasted single-serve Arabica coffee pods delivered to your door.
            </p>
          </div>

          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 02
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '8px' }}>
              Active Account
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
              Your active monthly subscription qualifies your account to receive commissions on every order placed in your network.
            </p>
          </div>

          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Step 03
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '8px' }}>
              4-Level Commissions
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
              Every time a direct or downline member purchases their $69 Coffee Box, your commission is credited automatically.
            </p>
          </div>
        </div>

        {/* 3. GRAPHICAL 4-LEVEL COMPENSATION PLAN */}
        <div
          style={{
            background: '#140e0a',
            border: '1px solid var(--mocha-border)',
            borderRadius: '20px',
            padding: 'clamp(24px, 4vw, 44px)',
            marginBottom: '48px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginBottom: '8px' }}>
              4-Level Compensation Plan
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem' }}>
              Commission paid to you on every $69 Coffee Box purchased across 4 levels:
            </p>
          </div>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* YOU Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  background: 'var(--amber-primary)',
                  color: '#0d0907',
                  padding: '12px 28px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                }}
              >
                YOU &mdash; Active $69/mo Member
              </div>
              <div style={{ width: '2px', height: '24px', background: 'var(--mocha-border-light)' }} />
            </div>

            {/* 4 Levels */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {levels.map((item, idx) => (
                <div key={item.level} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="income-level-row">
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.who}
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="income-level-bar" style={{ width: '100%' }}>
                      <div
                        style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: item.barWidth,
                            height: '100%',
                            background: 'var(--amber-primary)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Commission Amount */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.85rem',
                          fontWeight: '700',
                          color: 'var(--amber-light)',
                          lineHeight: '1',
                        }}
                      >
                        ${item.amount}
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>per box</span>
                    </div>
                  </div>

                  {idx < levels.length - 1 && (
                    <div style={{ padding: '6px 0', color: 'var(--text-muted)' }}>
                      <ArrowDown size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. SIMPLE CTA */}
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
