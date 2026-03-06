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
            {[
              { label: 'Main Course', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
              { label: 'Biryani',     image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80' },
              { label: 'Starters',   image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80' },
              { label: 'Breads',     image: 'https://i.pinimg.com/1200x/3b/6f/e4/3b6fe4c72fcf4881a9eae88598a1c0a4.jpg' },
              { label: 'Desserts',   image: 'https://i.pinimg.com/avif/1200x/04/3e/f8/043ef80ed6c4c1ad98be030f1c5afead.avf' },
              { label: 'Drinks',     image: 'https://i.pinimg.com/1200x/97/25/ec/9725eca29432bd79fc5dbc34d1dffc75.jpg' },
            ].map(cat => (
              <div key={cat.label} className="category-card" onClick={() => navigate('menu')}>
                <div className="cat-img-wrap">
                  <img src={cat.image} alt={cat.label} className="cat-img" loading="lazy" />
                  <div className="cat-overlay" />
                </div>
                <span className="cat-label">{cat.label}</span>
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
