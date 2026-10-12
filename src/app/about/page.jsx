import Image from 'next/image';
import Link from 'next/link';
import { Coffee, Flame, Award, Globe, Heart, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Our Story & Heritage | Caffè Loja Lisbon Roasters',
  description:
    'Learn about Caffè Loja, our sustainable direct-trade partnerships with high altitude coffee farmers, and our Lisbon drum roastery.',
};

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Since 2018 &bull; Chiado, Lisbon</span>
          <h1 className="section-title">The Art & Soul of Caffè Loja</h1>
          <p className="section-desc">
            Bridging century-old European coffeehouse culture with third-wave micro-lot roasting and farm-level transparency.
          </p>
        </div>

        {/* Story Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center', marginBottom: '80px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', marginBottom: '18px', color: 'var(--amber-light)' }}>
              From Volcanic Terraces to the Golden Crema
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
              Caffè Loja was born from a deep reverence for the coffee plant. While commercial roasters prioritize speed and dark scorched beans, we seek the origin’s botanical voice.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '24px' }}>
              Our green beans are sourced exclusively above 1,400 meters elevation from smallholder farmer cooperatives in Yirgacheffe, Antigua, and Huila. At these elevations, slow maturation yields dense sugars, vibrant malic acidity, and complex floral aromas.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ borderLeft: '3px solid var(--amber-primary)', paddingLeft: '14px' }}>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-primary)' }}>100%</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Specialty Grade Arabica (86+ SCA)</span>
              </div>
              <div style={{ borderLeft: '3px solid var(--amber-primary)', paddingLeft: '14px' }}>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Zero</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Artificial Flavors or Additives</span>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--mocha-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80"
              alt="Raw Green Coffee Beans and Roasted Beans"
              style={{ width: '100%', height: '420px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Philosophy Cards */}
        <div style={{ background: '#140e0a', padding: '60px 40px', borderRadius: '24px', border: '1px solid var(--mocha-border)', marginBottom: '80px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', textAlign: 'center', marginBottom: '40px' }}>
            Our Four Guiding Commitments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#1d140f', padding: '24px', borderRadius: '14px', border: '1px solid var(--mocha-border)' }}>
              <Globe size={28} className="text-amber" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Direct Trade Ethics</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                We cut out middle brokers and visit partner washing stations annually, investing in soil revitalization projects.
              </p>
            </div>

            <div style={{ background: '#1d140f', padding: '24px', borderRadius: '14px', border: '1px solid var(--mocha-border)' }}>
              <Flame size={28} className="text-amber" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Batch Micro-Roasting</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                We roast strictly in 5kg to 12kg drums with real-time temperature curve profiling for repeatable excellence.
              </p>
            </div>

            <div style={{ background: '#1d140f', padding: '24px', borderRadius: '14px', border: '1px solid var(--mocha-border)' }}>
              <Coffee size={28} className="text-amber" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Dialed Precision Brews</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Reverse-osmosis remineralized brew water tuned specifically to 120 PPM for optimal coffee extraction.
              </p>
            </div>

            <div style={{ background: '#1d140f', padding: '24px', borderRadius: '14px', border: '1px solid var(--mocha-border)' }}>
              <Heart size={28} className="text-amber" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Portuguese Gastronomy</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Pairing specialty espresso with flaky custard pastéis baked hot every morning by our in-house pastry chef.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '16px' }}>
            Ready to taste the distinction?
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link href="/menu" className="btn-primary">
              <span>Order Fresh Roasted Beans</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn-secondary">
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
