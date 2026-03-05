import React from 'react';

export default function About() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>About CraveIt</h2>
          <p>Our story and values</p>
        </div>

        <div className="about-grid">
          <div className="about-text">
            <h3>🔥 Who We Are</h3>
            <p>
              CraveIt is a modern single-restaurant food ordering platform built to make
              enjoying great food as simple and fast as possible. We believe that every
              craving deserves to be satisfied — quickly, safely, and deliciously.
            </p>
            <p>
              Our system lets you browse our full menu, add your favourites to the cart,
              pay online securely, and track your order in real time — all from one place.
            </p>

            <h3 style={{ marginTop: '2rem' }}>💡 Our Mission</h3>
            <p>
              To bridge the gap between hungry customers and great food through technology —
              making the ordering experience seamless, transparent, and enjoyable.
            </p>
          </div>

          <div className="about-values">
            {[
              { icon: '🌿', title: 'Fresh Ingredients', desc: 'We use only the freshest locally sourced ingredients every single day.' },
              { icon: '⚡', title: 'Fast Delivery', desc: 'Average delivery time of under 30 minutes, every order, every time.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Your payment data is fully encrypted and secure with our gateway.' },
              { icon: '❤️', title: 'Made with Love', desc: 'Every dish is prepared with passion and care by our expert chefs.' },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <div>
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-project">
          <h3>🎓 About This Project</h3>
          <p>
            This website was developed as a <strong>BCA Final Year Student</strong> at{' '}
            <strong>Integral University</strong>. 
            
          </p>
          <div className="tech-tags">
            {['React.js', 'Context API', 'CSS3', 'Node.js (Planned)', 'MongoDB (Planned)', 'Express.js (Planned)'].map(t => (
              <span key={t} className="tech-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
