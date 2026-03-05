// HeroSection.jsx
import React from 'react';
export default function HeroSection({ navigate }) {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-blob blob1" /><div className="hero-blob blob2" /><div className="hero-blob blob3" />
      </div>
      <div className="hero-content">
        <div className="hero-badge">🍽️ Now Taking Orders</div>
        <h1 className="hero-title">Your Cravings,<br /><span className="hero-accent">Delivered Fast</span></h1>
        <p className="hero-subtitle">Fresh, hot, and delicious food delivered straight to your door. Order in seconds, enjoy in minutes.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('menu')}>🍔 Order Now</button>
          <button className="btn-secondary" onClick={() => navigate('tracking')}>📦 Track Order</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Menu Items</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">30 min</span><span className="stat-label">Avg Delivery</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">4.9 ⭐</span><span className="stat-label">Rating</span></div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="food-showcase">
          {['🍕','🍔','🌮','🍜','🍣'].map((e,i) => <div key={i} className={`food-orb orb-${i+1}`}>{e}</div>)}
          <div className="center-orb">🔥</div>
        </div>
      </div>
    </section>
  );
}
