// ── Home.jsx ──
import React from 'react';
import HeroSection from '../components/HeroSection';
import MenuCard from '../components/MenuCard';
import { MENU_ITEMS } from './Menu';

export default function Home({ navigate }) {
  return (
    <div>
      <HeroSection navigate={navigate} />
      <section className="section categories-section">
        <div className="container">
          <div className="section-header"><h2>What Are You Craving?</h2><p>Explore our categories</p></div>
          <div className="categories-grid">
            {[{emoji:'🍔',label:'Burgers'},{emoji:'🍕',label:'Pizza'},{emoji:'🌮',label:'Tacos'},{emoji:'🍜',label:'Noodles'},{emoji:'🍣',label:'Sushi'},{emoji:'🍰',label:'Desserts'}].map(cat => (
              <div key={cat.label} className="category-card" onClick={() => navigate('menu')}>
                <span className="cat-emoji">{cat.emoji}</span><span className="cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section featured-section">
        <div className="container">
          <div className="section-header"><h2>🔥 Featured Dishes</h2><p>Our most loved items</p></div>
          <div className="menu-grid">{MENU_ITEMS.slice(0,4).map(item => <MenuCard key={item.id} item={item} />)}</div>
          <div style={{textAlign:'center',marginTop:'2rem'}}>
            <button className="btn-primary" onClick={() => navigate('menu')}>View Full Menu →</button>
          </div>
        </div>
      </section>

    </div>
  );
}
