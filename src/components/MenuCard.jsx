import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = cartItems.find(i => i.id === item.id);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="menu-card">
      <div className="menu-card-emoji">{item.emoji}</div>
      <div className="menu-card-badge">{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</div>
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
