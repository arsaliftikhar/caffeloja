'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CoffeeCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="coffee-card">
      <div className="coffee-card-img-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="coffee-card-img"
          loading="lazy"
        />
        <div className="coffee-card-overlay" />
      </div>

      {/* Content */}
      <div className="coffee-card-content">
        <h3 className="coffee-title">{product.name}</h3>
        <p className="coffee-tagline">{product.tagline}</p>

        {/* Price & Action */}
        <div className="coffee-card-footer" style={{ marginTop: '20px' }}>
          <div className="price-tag">
            <span className="currency">$</span>
            <span className="price-val">{product.price.toFixed(2)}</span>
            <span className="price-unit">USD</span>
          </div>

          <button
            onClick={() => addToCart(product, 1, 'Coffee Box (20 Pods)')}
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
