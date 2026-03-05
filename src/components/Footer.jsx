import React from 'react';

export default function Footer({ navigate }) {
  const steps = [
    { step: '01', icon: '🍽️', title: 'Browse Menu',     desc: 'Explore our wide variety of fresh dishes — filter by category, veg/non-veg, or search for your favourite.' },
    { step: '02', icon: '🛒', title: 'Add to Cart',      desc: 'Select your items, adjust quantities, and apply a coupon code for extra savings on your order.' },
    { step: '03', icon: '📍', title: 'Enter Address',    desc: 'Add your delivery address — Home, Work, or Other. We deliver right to your doorstep.' },
    { step: '04', icon: '💳', title: 'Pay Securely',     desc: 'Pay via Card, UPI, Net Banking, or Wallet. All transactions are 256-bit SSL encrypted.' },
    { step: '05', icon: '🔐', title: 'Get Your OTP',     desc: 'Receive a unique delivery OTP. Share it with your rider to confirm safe receipt of your order.' },
    { step: '06', icon: '🚀', title: 'Track Live',       desc: 'Watch your order go from kitchen to your door in real time — every step of the way.' },
  ];

  return (
    <footer className="footer">

      {/* ── How It Works Strip ── */}
      <div className="footer-hiw">
        <div className="footer-hiw-inner">
          <div className="footer-hiw-header">
            <h3>How It Works</h3>
            <p>From craving to delivery in 6 simple steps</p>
          </div>
          <div className="footer-hiw-steps">
            {steps.map((s, i) => (
              <div key={s.step} className="footer-hiw-step">
                <div className="footer-hiw-top">
                  <div className="footer-hiw-num">{s.step}</div>
                  <div className="footer-hiw-icon">{s.icon}</div>
                  {i < steps.length - 1 && <div className="footer-hiw-connector" />}
                </div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
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
            {steps.slice(0,4).map(s => (
              <div key={s.step} className="footer-mini-step">
                <span className="footer-mini-num">{s.step}</span>
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
