import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded]         = useState(false);
  const [imgError, setImgError]   = useState(false);

  const inCart = cartItems.find(i => i.id === item.id);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true); 
    setTimeout(() => setAdded(false), 1200);
  };

  // Fallback colours per category if image fails
  const fallbackBg = {
    'Main Course': '#fff3e0',
    'Biryani':     '#fce4ec',
    'Starters':    '#e8f5e9',
    'Breads':      '#fff8e1',
    'Desserts':    '#fce4ec',
    'Drinks':      '#e3f2fd',
  };
  const fallbackEmoji = {
    'Main Course': '🍛',
    'Biryani':     '🍚',
    'Starters':    '🥙',
    'Breads':      '🫓',
    'Desserts':    '🍮',
    'Drinks':      '🥤',
  };

  return (
    <div className="menu-card">
      {/* Image */}
      <div className="menu-card-img-wrap">
        {!imgError && item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="menu-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="menu-card-img-fallback"
            style={{ background: fallbackBg[item.category] || '#f9f9f9' }}
          >
            <span>{fallbackEmoji[item.category] || '🍽️'}</span>
          </div>
        )}

        {/* Veg / Non-veg badge */}
        <div className={`menu-card-dot ${item.isVeg ? 'veg' : 'nonveg'}`}>
          <span className="dot-inner" />
        </div>
      </div>

      {/* Body */}
      <div className="menu-card-body">
        <h3 className="menu-card-name">{item.name}</h3>
        <p className="menu-card-desc">{item.description}</p>
        <div className="menu-card-footer">
          <span className="menu-card-price">₹{item.price}</span>
          <button
            className={`add-btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
          >
            {added ? '✓ Added!' : inCart ? `+1 (${inCart.qty})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
