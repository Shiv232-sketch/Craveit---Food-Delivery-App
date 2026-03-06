import React, { useState } from 'react';

const HIW_STEPS = [
  {
    step: '01', icon: '🍽️', title: 'Browse Menu',
    front: 'Browse our Indian menu',
    back: 'Filter by category, veg or non-veg, or search for your favourite dish. 16+ authentic Indian dishes available.',
    color: '#6366f1',
  },
  {
    step: '02', icon: '🛒', title: 'Add to Cart',
    front: 'Pick your favourites',
    back: 'Add items, adjust quantities and apply a coupon code. Your cart saves everything until checkout.',
    color: '#f59e0b',
  },
  {
    step: '03', icon: '📍', title: 'Enter Address',
    front: 'Tell us where to deliver',
    back: 'Enter your Home, Work or Other address. We deliver right to your doorstep across the city.',
    color: '#E8401C',
  },
  {
    step: '04', icon: '💳', title: 'Pay Securely',
    front: 'Choose how to pay',
    back: 'Pay via Card, UPI, Net Banking or Wallet. All transactions are 256-bit SSL encrypted for safety.',
    color: '#0ea5e9',
  },
  {
    step: '05', icon: '🔐', title: 'Get Your OTP',
    front: 'Your secret delivery code',
    back: 'A unique 6-digit OTP is sent to you. Share it only with your rider to confirm safe delivery.',
    color: '#ec4899',
  },
  {
    step: '06', icon: '🚀', title: 'Track Live',
    front: 'Watch it come to you',
    back: 'Follow every step in real-time — Order Placed → Preparing → Picked Up → Delivered. Live updates!',
    color: '#22c55e',
  },
];

function HowItWorksCards() {
  const [flipped, setFlipped] = useState(null);

  const toggle = (i) => setFlipped(flipped === i ? null : i);

  return (
    <div className="hiw-cards-grid">
      {HIW_STEPS.map((s, i) => (
        <div
          key={s.step}
          className={`hiw-card ${flipped === i ? 'flipped' : ''}`}
          onClick={() => toggle(i)}
          style={{ '--card-color': s.color }}
        >
          <div className="hiw-card-inner">
            {/* Front */}
            <div className="hiw-card-front">
              <div className="hiw-card-num">{s.step}</div>
              <div className="hiw-card-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.front}</p>
              <span className="hiw-card-hint">Click to learn more</span>
            </div>
            {/* Back */}
            <div className="hiw-card-back">
              <div className="hiw-card-icon big">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.back}</p>
              <span className="hiw-card-hint">Click to flip back</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Footer({ navigate }) {

  return (
    <footer className="footer">

      {/* ── How It Works — Flashcards ── */}
      <div className="footer-hiw">
        <div className="footer-hiw-inner">
          <div className="footer-hiw-header">
            <h3>How It Works</h3>
            <p>Click each card to learn more</p>
          </div>
          <HowItWorksCards />
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="footer-main">
        <div className="footer-inner">

          {/* Brand */}
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">🔥</span>
              <span className="logo-text">CraveIt</span>
            </div>
            <p className="footer-tagline">Your Cravings, Delivered Fast.</p>
            <p className="footer-desc">A single-restaurant online food ordering platform built with React, Node.js &amp; MongoDB.</p>
            <div className="footer-badges">
              <span className="footer-badge">🔒 SSL Secured</span>
              <span className="footer-badge">⚡ Fast Delivery</span>
              <span className="footer-badge">🌿 Fresh Food</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            {[['🏠 Home','home'],['🍔 Menu','menu'],['📦 Track Order','tracking'],['ℹ️ About','about']].map(([l,k]) => (
              <button key={k} onClick={() => navigate(k)}>{l}</button>
            ))}
          </div>

          {/* How It Works mini */}
          <div className="footer-col">
            <h4>How It Works</h4>
            {HIW_STEPS.slice(0,4).map(s => (
              <div key={s.step} className="footer-mini-step">
                <span className="footer-mini-num" style={{background: s.color + '22', color: s.color}}>{s.step}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="footer-contact-items">
              <p>📍 Lucknow, Uttar Pradesh</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ hello@craveit.in</p>
              <p>🕐 Open: 10 AM – 11 PM</p>
            </div>
            <div className="footer-social">
              <button className="social-btn">📘</button>
              <button className="social-btn">📸</button>
              <button className="social-btn">🐦</button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <p>© 2026 CraveIt — BCA Final Year Project, Integral University, Lucknow</p>
        <div className="footer-bottom-links">
          <button>Privacy Policy</button>
          <span>·</span>
          <button>Terms of Service</button>
          <span>·</span>
          <button>Refund Policy</button>
        </div>
      </div>

    </footer>
  );
}
