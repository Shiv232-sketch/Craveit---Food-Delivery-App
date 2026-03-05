import React, { useState } from 'react';
import MenuCard from '../components/MenuCard';

export const MENU_ITEMS = [
  { id: 1,  emoji: '🍔', name: 'Classic Smash Burger',    category: 'Burgers',  price: 199, isVeg: false, description: 'Double smashed patty, cheddar, lettuce, special sauce.' },
  { id: 2,  emoji: '🍔', name: 'Spicy Chicken Burger',    category: 'Burgers',  price: 179, isVeg: false, description: 'Crispy fried chicken with jalapeños and sriracha mayo.' },
  { id: 3,  emoji: '🍔', name: 'Veggie Delight Burger',   category: 'Burgers',  price: 149, isVeg: true,  description: 'Grilled veggie patty with avocado and fresh greens.' },
  { id: 4,  emoji: '🍕', name: 'Margherita Pizza',        category: 'Pizza',    price: 249, isVeg: true,  description: 'Classic tomato base, fresh mozzarella and basil.' },
  { id: 5,  emoji: '🍕', name: 'Pepperoni Blast',         category: 'Pizza',    price: 299, isVeg: false, description: 'Loaded with pepperoni, mozzarella, and oregano.' },
  { id: 6,  emoji: '🍕', name: 'BBQ Chicken Pizza',       category: 'Pizza',    price: 319, isVeg: false, description: 'Smoky BBQ sauce, grilled chicken, onion, peppers.' },
  { id: 7,  emoji: '🌮', name: 'Chicken Tacos (x3)',      category: 'Tacos',    price: 189, isVeg: false, description: 'Soft shell tacos with spiced chicken, slaw, and lime.' },
  { id: 8,  emoji: '🌮', name: 'Paneer Tikka Tacos',      category: 'Tacos',    price: 169, isVeg: true,  description: 'Indian twist — paneer tikka, mint chutney, onions.' },
  { id: 9,  emoji: '🍜', name: 'Wok Hakka Noodles',       category: 'Noodles',  price: 159, isVeg: true,  description: 'Stir-fried veggies and noodles with soy-ginger sauce.' },
  { id: 10, emoji: '🍜', name: 'Spicy Ramen Bowl',        category: 'Noodles',  price: 199, isVeg: false, description: 'Rich broth, ramen noodles, soft egg, and chashu pork.' },
  { id: 11, emoji: '🍣', name: 'Salmon Nigiri (x4)',      category: 'Sushi',    price: 349, isVeg: false, description: 'Fresh Atlantic salmon over hand-pressed sushi rice.' },
  { id: 12, emoji: '🍣', name: 'Avocado Roll (x8)',       category: 'Sushi',    price: 279, isVeg: true,  description: 'Creamy avocado wrapped in seasoned sushi rice & nori.' },
  { id: 13, emoji: '🍰', name: 'Molten Lava Cake',        category: 'Desserts', price: 129, isVeg: true,  description: 'Warm chocolate cake with a gooey liquid center.' },
  { id: 14, emoji: '🍰', name: 'New York Cheesecake',     category: 'Desserts', price: 149, isVeg: true,  description: 'Creamy baked cheesecake with strawberry compote.' },
  { id: 15, emoji: '🥤', name: 'Mango Lassi',             category: 'Drinks',   price: 89,  isVeg: true,  description: 'Thick, sweet, chilled mango lassi. Pure bliss.' },
  { id: 16, emoji: '🥤', name: 'Masala Chai',             category: 'Drinks',   price: 59,  isVeg: true,  description: 'Spiced Indian tea brewed with milk and cardamom.' },
];

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Tacos', 'Noodles', 'Sushi', 'Desserts', 'Drinks'];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filter, setFilter] = useState('all'); // all | veg | nonveg
  const [search, setSearch] = useState('');

  const filtered = MENU_ITEMS.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchFilter = filter === 'all' || (filter === 'veg' ? item.isVeg : !item.isVeg);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchFilter && matchSearch;
  });

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>Our Menu</h2>
          <p>Fresh ingredients. Bold flavours. Every time.</p>
        </div>

        {/* Search */}
        <div className="menu-search">
          <input
            type="text"
            placeholder="🔍 Search for a dish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="menu-filters">
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="veg-filter">
            {['all', 'veg', 'nonveg'].map(f => (
              <button
                key={f}
                className={`pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '🍽️ All' : f === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="menu-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="menu-grid">
            {filtered.map(item => <MenuCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="no-results">
            <p>😅 No items found. Try a different search or filter!</p>
          </div>
        )}
      </div>
    </div>
  );
}
