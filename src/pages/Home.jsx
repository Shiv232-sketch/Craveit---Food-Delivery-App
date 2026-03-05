import React from 'react';
import HeroSection from '../components/HeroSection';
import MenuCard from '../components/MenuCard';
import { MENU_ITEMS } from './Menu';

export default function Home({ navigate }) {
  const featured = MENU_ITEMS.slice(0, 4);

  return (
    <div>
      <HeroSection navigate={navigate} />

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>What Are You Craving?</h2>
            <p>Explore our categories</p>
          </div>
          <div className="categories-grid">
            {[
              { emoji: '🍔', label: 'Burgers' },
              { emoji: '🍕', label: 'Pizza' },
              { emoji: '🌮', label: 'Tacos' },
              { emoji: '🍜', label: 'Noodles' },
              { emoji: '🍣', label: 'Sushi' },
              { emoji: '🍰', label: 'Desserts' },
            ].map(cat => (
              <div key={cat.label} className="category-card" onClick={() => navigate('menu')}>
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2>🔥 Featured Dishes</h2>
            <p>Our most loved items</p>
          </div>
          <div className="menu-grid">
            {featured.map(item => <MenuCard key={item.id} item={item} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={() => navigate('menu')}>
              View Full Menu →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Order in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '🍽️', title: 'Browse Menu', desc: 'Explore our wide variety of fresh, delicious dishes.' },
              { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Select your favourite items and add them to your cart.' },
              { step: '03', icon: '🚀', title: 'Place Order', desc: 'Place your order and get it delivered hot to your door.' },
              
            ].map(s => (
              <div key={s.step} className="step-card">
                <div className="step-num">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
