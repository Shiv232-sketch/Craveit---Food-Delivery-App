import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-icon">🔥</span>
            <span className="logo-text">CraveIt</span>
          </div>
          <p>Your Cravings, Delivered Fast.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <button onClick={() => navigate('home')}>Home</button>
          <button onClick={() => navigate('menu')}>Menu</button>
          <button onClick={() => navigate('tracking')}>Track Order</button>
          <button onClick={() => navigate('about')}>About</button>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📍 Lucknow, Uttar Pradesh</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ hello@craveit.in</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 CraveIt — BCA Final Year Project, Integral University</p>
      </div>
    </footer>
  );
}
