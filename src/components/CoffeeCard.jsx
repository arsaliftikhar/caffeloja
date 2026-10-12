'use client';

import { ShoppingBag, Flame, Sparkles, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CoffeeCard({ product }) {
  const { addToCart } = useCart();

  const getRoastColor = (roast) => {
    switch (roast) {
      case 'Light': return '#e6a15c';
      case 'Medium-Light': return '#c47d3d';
      case 'Medium': return '#965527';
      case 'Medium-Dark': return '#6d3916';
      case 'Dark': return '#42200b';
      default: return '#c59d5f';
    }
  };

  return (
    <div className="coffee-card">
      {/* Product Image and Badges */}
      <div className="coffee-card-img-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="coffee-card-img"
          loading="lazy"
        />
        <div className="coffee-card-overlay" />

        {product.badge && (
          <span className="coffee-badge">
            <Sparkles size={12} className="inline mr-1" />
            {product.badge}
          </span>
        )}

        {product.sku && (
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(13, 9, 7, 0.88)',
              border: '1px solid var(--mocha-border)',
              borderRadius: '9999px',
              padding: '3px 9px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Tag size={11} />
            <span>SKU: {product.sku}</span>
          </div>
        )}

        {product.roastLevel && product.roastLevel !== 'N/A' && (
          <div
            className="roast-pill"
            style={{ borderColor: getRoastColor(product.roastLevel) }}
          >
            <Flame size={13} style={{ color: getRoastColor(product.roastLevel) }} />
            <span>{product.roastLevel} Roast</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="coffee-card-content">
        <div className="coffee-card-origin-rating">
          <span className="coffee-origin">{product.origin}</span>
        </div>

        <h3 className="coffee-title">{product.name}</h3>
        <p className="coffee-tagline">{product.tagline}</p>

        {/* Flavor Notes Badges */}
        {product.flavorNotes && product.flavorNotes.length > 0 && (
          <div className="flavor-notes-row">
            {product.flavorNotes.slice(0, 3).map((note) => (
              <span key={note} className="flavor-chip">
                {note}
              </span>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="coffee-card-footer" style={{ marginTop: '20px' }}>
          <div className="price-tag">
            <span className="currency">$</span>
            <span className="price-val">{product.price.toFixed(2)}</span>
            <span className="price-unit">USD</span>
          </div>

          <button
            onClick={() => addToCart(product, 1, 'Coffee Box (60 Pods)')}
            className="btn-add-bag"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
