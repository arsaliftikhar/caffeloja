'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Coffee,
  Flame,
  Award,
  Users,
  ShieldCheck,
  Star,
  Play,
  ShoppingBag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Globe,
  Share2,
} from 'lucide-react';


export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      title: 'Distinct Aroma',
      subtitle: 'The World’s Best Coffee',
      desc: 'Small batch specialty roasts, directly sourced from high elevation volcanic slopes and fresh roasted continuously.',
      image: 'https://caffeloja.com/wp-content/uploads/2018/04/home-1-slider-image-1.jpg',
      ctaText: 'Explore Coffee',
      ctaLink: '/menu',
    },
    {
      title: 'Coffee Box (60 Pods)',
      subtitle: 'Premium Single-Serve Artisan Pods',
      desc: '60 hermetically sealed Keurig-compatible pods. Rich chocolate, toasted hazelnut, and warm caramel with smooth crema in every brew.',
      image: 'https://caffeloja.com/wp-content/uploads/2018/04/home-1-slider-image-2.jpg',
      ctaText: 'Order Coffee Box',
      ctaLink: '/menu',
    },
    {
      title: '4-Level Affiliate Network',
      subtitle: 'Earn An Income with Coffee',
      desc: 'Join our revolutionary 4-tier MLM partner program. Earn recurring commissions on every cup sold through your network.',
      image: 'https://caffeloja.com/wp-content/uploads/2018/04/home-1-slider-image-3.jpg',
      ctaText: 'Join Partner Program',
      ctaLink: '/affiliate',
    },
  ];

  // Auto-slide every 5 seconds unless paused by mouse hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const galleryItems = [
    { title: 'Perfect Cup', tag: 'Espresso Craft', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-1.jpg' },
    { title: 'Brewed', tag: 'Pour Over', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-2.jpg' },
    { title: 'Coffee Drips', tag: 'Artisan Chemex', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-3.jpg' },
    { title: 'Baked Beans', tag: 'Fresh Batch', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-7.jpg' },
    { title: 'Best Aromas', tag: 'Cupping Flight', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-5.jpg' },
    { title: 'Creams', tag: 'Latte Art', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-6.jpg' },
    { title: 'Enjoyment', tag: 'Specialty Moment', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-4.jpg' },
    { title: 'Big Mugs', tag: 'Morning Ritual', img: 'https://caffeloja.com/wp-content/uploads/2018/04/port-1-img-8.jpg' },
  ];

  return (
    <div className="home-page-root">
      {/* 1. HERO SLIDER (Original caffeloja.com Hero Images) */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(rgba(13, 9, 7, 0.65), rgba(13, 9, 7, 0.85)), url("${heroSlides[activeSlide].image}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.8s ease-in-out',
          padding: '120px 20px 80px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Previous Slide Arrow */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hero-slider-arrow hero-slider-prev"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next Slide Arrow */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hero-slider-arrow hero-slider-next"
        >
          <ChevronRight size={24} />
        </button>

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <img
            src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
            alt="separator"
            style={{ margin: '0 auto 16px', display: 'block' }}
          />

          <span style={{ fontSize: '0.95rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--amber-light)', fontWeight: '600' }}>
            {heroSlides[activeSlide].subtitle}
          </span>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.6rem', lineHeight: '1.15', margin: '14px 0 20px', fontWeight: '700' }}>
            {heroSlides[activeSlide].title}
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px', maxWidth: '640px', margin: '0 auto 32px' }}>
            {heroSlides[activeSlide].desc}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={heroSlides[activeSlide].ctaLink} className="btn-primary">
              <span>{heroSlides[activeSlide].ctaText}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Slide Indicator Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  background: activeSlide === idx ? 'var(--amber-primary)' : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. OUR DELICIOUS OFFER SECTION (caffeloja.com Content) */}
      <section style={{ padding: '90px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '50px' }}>
            <img
              src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
              alt="separator"
              style={{ margin: '0 auto 12px', display: 'block' }}
            />
            <span className="section-tag">What We Serve</span>
            <h2 className="section-title">Our Delicious Offer</h2>
            <p className="section-desc">
              Discover artisan roasts, specialty coffee varieties, and high-altitude beans selected for balanced body and clean finish.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{ background: '#19110c', border: '1px solid var(--mocha-border)', borderRadius: '20px', padding: '36px 28px', textAlign: 'center' }}>
              <img
                src="https://caffeloja.com/wp-content/uploads/2018/04/h2-custom-icon-5.png"
                alt="Types of Coffee"
                style={{ margin: '0 auto 20px', display: 'block' }}
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px' }}>Types of Coffee</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                From smooth French presses and dense espresso shots to single-serve K-Cup pods, we dial in perfection for every brewing style.
              </p>
              <Link href="/menu" style={{ color: 'var(--amber-light)', fontWeight: '600', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>View Products</span> <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ background: '#19110c', border: '1px solid var(--mocha-border)', borderRadius: '20px', padding: '36px 28px', textAlign: 'center' }}>
              <img
                src="https://caffeloja.com/wp-content/uploads/2018/04/h2-custom-icon-6.png"
                alt="Bean Varieties"
                style={{ margin: '0 auto 20px', display: 'block' }}
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px' }}>Bean Varieties</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                High-altitude Arabica lots from Central & South America, naturally processed and wet mill washed for rich cocoa and citrus undertones.
              </p>
              <Link href="/menu" style={{ color: 'var(--amber-light)', fontWeight: '600', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Explore Beans</span> <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ background: '#19110c', border: '1px solid var(--mocha-border)', borderRadius: '20px', padding: '36px 28px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(230,157,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-light)', margin: '0 auto 20px' }}>
                <Users size={30} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '12px' }}>4-Level MLM Rewards</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                Earn direct and multi-tier recurring commissions on coffee bags ordered through your unique affiliate referral code.
              </p>
              <Link href="/affiliate" style={{ color: 'var(--amber-light)', fontWeight: '600', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>Start Earning</span> <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE WORLD'S BEST COFFEE / CONTINUOUS FRESH ROASTED SECTION */}
      <section style={{ padding: '80px 0', background: '#140e0a', borderTop: '1px solid var(--mocha-border)', borderBottom: '1px solid var(--mocha-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div>
              <img
                src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
                alt="separator"
                style={{ marginBottom: '12px', display: 'block' }}
              />
              <span className="section-tag">Quality In Every Cup</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '20px' }}>
                The World&apos;s Best Coffee & Continuous Fresh Roasts
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '18px' }}>
                At Caffè Loja, we believe coffee is not just a morning habit, but an experience. Sourced responsibly and roasted with precision drum roasters to unlock delicate natural sweetness without burnt bitterness.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '28px' }}>
                All coffee orders are freshly roasted and dropshipped directly from our partner fulfillment roastery at <strong>Old Chicago Coffee Co.</strong>, ensuring unparalleled freshness.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/menu" className="btn-primary">
                  <span>Explore Catalog</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/about" className="btn-secondary">
                  <span>Our Story</span>
                </Link>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--mocha-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}>
                <img
                  src="https://caffeloja.com/wp-content/uploads/2025/10/1.jpg"
                  alt="Caffè Loja Barista Brew"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SPOTLIGHT: Flagship Coffee Box (60 Pods) */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <span className="section-tag">Featured Highlight</span>
            <h2 className="section-title">Flagship Coffee Box (60 Pods)</h2>
            <p className="section-desc">
              60 premium single-serve artisan coffee pods roasted to perfection and sealed for unmatched freshness.
            </p>
          </div>

          <div style={{ maxWidth: '520px', margin: '0 auto 40px' }}>
            {/* Spotlight Single Product Card */}
            <div style={{ background: '#1c140e', border: '1px solid var(--mocha-border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
              <div style={{ height: '320px', position: 'relative' }}>
                <img
                  src="/images/coffee-box-60-pods.png"
                  alt="Coffee Box (60 Pods)"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#120d09', padding: '16px' }}
                />
                <span className="coffee-badge">Flagship 60 Pods Box</span>
              </div>
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>SKU: CB-60PODS &bull; 60 SINGLE-SERVE PODS</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '8px 0' }}>Coffee Box (60 Pods)</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                  Handcrafted from select high-elevation Arabica beans. Rich notes of sweet chocolate, toasted hazelnut, and warm caramel with smooth crema in every cup. Keurig K-Cup compatible and 100% recyclable.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--mocha-border)', paddingTop: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Box of 60 Pods</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: '700', color: 'var(--amber-light)' }}>$110.00</span>
                  </div>
                  <Link href="/menu" className="btn-primary">
                    <ShoppingBag size={16} /> <span>Order Coffee Box</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR SWEET GALLERY SECTION (caffeloja.com 8 Portfolio Images) */}
      <section style={{ padding: '80px 0', background: '#120d09', borderTop: '1px solid var(--mocha-border)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <img
              src="https://caffeloja.com/wp-content/uploads/2018/04/title-separator.png"
              alt="separator"
              style={{ margin: '0 auto 12px', display: 'block' }}
            />
            <span className="section-tag">Visual Moments</span>
            <h2 className="section-title">Our Sweet Gallery</h2>
            <p className="section-desc">
              Moments of espresso craft, roasted beans, and morning perfection at Caffè Loja.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--mocha-border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(13, 9, 7, 0.95) 0%, rgba(13, 9, 7, 0.2) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '20px',
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: 'var(--amber-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {item.tag}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#fff' }}>
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
