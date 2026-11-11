import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export const metadata = {
  title: 'Our Story | Caffeloja',
  description:
    'Learn about Caffeloja — 100% organically grown Arabica coffee, continuous fresh roasting, and gourmet single-serve pods.',
};

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '130px', paddingBottom: '90px', minHeight: '90vh', overflowX: 'hidden' }}>
      <style>{`
        .about-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 50px;
          align-items: center;
          margin-bottom: 72px;
        }
        .about-split-col {
          min-width: 0;
          width: 100%;
        }
        .about-img-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--mocha-border);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.65);
        }
        .about-img {
          width: 100%;
          height: 390px;
          object-fit: cover;
          display: block;
          filter: brightness(0.82) contrast(0.96);
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 72px;
        }
        @media (max-width: 900px) {
          .about-split-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 28px !important;
            margin-bottom: 48px !important;
          }
          .about-values-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 18px !important;
            margin-bottom: 48px !important;
          }
          .about-img {
            height: 270px !important;
          }
        }
        @media (max-width: 600px) {
          .about-img {
            height: 220px !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '660px', margin: '0 auto 56px' }}>
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
              marginBottom: '14px',
            }}
          >
            Our Story
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.75' }}>
            We truly feel our coffee is the best tasting coffee in the world. Our goal is simple: get freshly roasted coffee into the hands and homes of coffee lovers everywhere.
          </p>
        </div>

        {/* Main Story Split */}
        <div className="about-split-grid">
          <div className="about-split-col">
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.65rem, 3.2vw, 2.2rem)',
                lineHeight: '1.25',
                marginBottom: '18px',
              }}
            >
              150 Years of Roasting Tradition
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' }}>
              Experience true freshly roasted coffee. Quite often the coffee grounds are still warm when packaged, offering the freshest cup anywhere. Our beans are 100% organically grown Arabica beans roasted in continuous batches for a smooth, rich finish without bitterness.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8', marginBottom: '24px' }}>
              There are no artificial colors, additives, or preservatives in our coffee—just pure, high-grown Arabica flavor sealed into convenient single-serve gourmet pods.
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '10px',
              }}
            >
              {[
                '100% Organically Grown Arabica Beans',
                'Freshly Roasted & Packaged at Peak Aroma',
                'No Artificial Colors or Preservatives',
                'Gourmet Single-Serve Pods for Instant Rich Brews',
              ].map((point) => (
                <li
                  key={point}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                >
                  <Check size={16} style={{ color: 'var(--amber-light)', flexShrink: 0 }} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-split-col">
            <div className="about-img-wrap">
              <img
                src="/images/freshly-roast-coffee.jpg"
                alt="Freshly Roasted Coffee at Caffeloja"
                className="about-img"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(13,9,7,0.12) 0%, rgba(13,9,7,0.38) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* 3 Simple Pillars */}
        <div className="about-values-grid">
          <div
            style={{
              background: '#140e0a',
              border: '1px solid var(--mocha-border)',
              borderRadius: '16px',
              padding: '28px 24px',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '10px', color: 'var(--amber-light)' }}>
              Pure Arabica
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.7' }}>
              Sourced from high-altitude organic farms and selected for natural sweetness, rich body, and clean aroma.
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
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '10px', color: 'var(--amber-light)' }}>
              Continuous Freshness
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.7' }}>
              Roasted continuously and sealed into 20-pod boxes so every cup tastes like it was ground moments ago.
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
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '10px', color: 'var(--amber-light)' }}>
              Shared Community
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.7' }}>
              We reward our community directly—enjoy your monthly coffee box and earn commissions when you share Caffeloja with others.
            </p>
          </div>
        </div>

        {/* Simple Closing CTA */}
        <div
          style={{
            background: '#140e0a',
            border: '1px solid var(--mocha-border)',
            borderRadius: '20px',
            padding: '44px 28px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3vw, 2rem)', marginBottom: '12px' }}>
            Experience the Difference in Every Cup
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto 28px', lineHeight: '1.7' }}>
            Order your monthly box of 20 gourmet coffee pods or learn how you can earn an income sharing Caffeloja.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/menu" className="btn-primary">
              <span>Shop Coffee Box ($69)</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/earn-an-income" className="btn-secondary">
              <span>Earn An Income</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
