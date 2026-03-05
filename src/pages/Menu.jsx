import React, { useState } from 'react';
import MenuCard from '../components/MenuCard';

export const MENU_ITEMS = [
  // ── Main Course ──
  {
    id: 1, name: 'Butter Chicken',
    category: 'Main Course', price: 299, isVeg: false,
    description: 'Tender chicken in a rich, creamy tomato-butter gravy. A timeless Indian classic.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2, name: 'Palak Paneer',
    category: 'Main Course', price: 249, isVeg: true,
    description: 'Fresh cottage cheese cubes in a smooth, spiced spinach gravy. Healthy and delicious.',
    image: 'https://i.pinimg.com/1200x/9e/d9/69/9ed96987f12746224c05acbc079f34f8.jpg',
  },
  {
    id: 3, name: 'Dal Makhani',
    category: 'Main Course', price: 229, isVeg: true,
    description: 'Slow-cooked black lentils simmered overnight in butter, cream, and aromatic spices.',
    image: 'https://i.pinimg.com/1200x/16/a8/8e/16a88e5b5d35140f254c25a87f3d3994.jpg',
  },
  {
    id: 4, name: 'Chicken Tikka Masala',
    category: 'Main Course', price: 319, isVeg: false,
    description: 'Char-grilled chicken tikka pieces in a smoky, tangy masala sauce.',
    image: 'https://i.pinimg.com/1200x/1d/dd/95/1ddd95f84379d5a5fb861868860ee5ef.jpg',
  },

  // ── Rice & Biryani ──
  {
    id: 5, name: 'Chicken Biryani',
    category: 'Biryani', price: 349, isVeg: false,
    description: 'Fragrant basmati rice layered with spiced chicken, saffron, and caramelised onions.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 6, name: 'Veg Dum Biryani',
    category: 'Biryani', price: 279, isVeg: true,
    description: 'Aromatic basmati rice slow-cooked with mixed vegetables, whole spices and fresh herbs.',
    image: 'https://i.pinimg.com/736x/f6/2b/85/f62b85c80d2b23c54299ac4c7e55f015.jpg',
  },
  {
    id: 7, name: 'Mutton Biryani',
    category: 'Biryani', price: 399, isVeg: false,
    description: 'Tender mutton pieces slow-cooked with long-grain basmati rice and Awadhi spices.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
  },

  // ── Starters ──
  {
    id: 8, name: 'Paneer Tikka',
    category: 'Starters', price: 229, isVeg: true,
    description: 'Marinated paneer cubes grilled in tandoor with peppers and onions. Served with mint chutney.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 9, name: 'Samosa (2 pcs)',
    category: 'Starters', price: 89, isVeg: true,
    description: 'Golden, crispy pastry filled with spiced potatoes and peas. Served with green chutney.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 10, name: 'Chicken Seekh Kebab',
    category: 'Starters', price: 259, isVeg: false,
    description: 'Minced chicken mixed with herbs and spices, skewered and grilled in a clay tandoor.',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80',
  },

  // ── Breads ──
  {
    id: 11, name: 'Butter Naan',
    category: 'Breads', price: 59, isVeg: true,
    description: 'Soft, pillowy leavened bread baked fresh in a clay tandoor and finished with butter.',
    image: 'https://i.pinimg.com/1200x/2d/a9/1f/2da91f6ba703b9a7fd6b6264db7a9fc1.jpg',
  },
  {
    id: 12, name: 'Garlic Naan',
    category: 'Breads', price: 69, isVeg: true,
    description: 'Tandoor-baked flatbread topped with fresh garlic, butter and coriander leaves.',
    image: 'https://i.pinimg.com/1200x/c3/98/b1/c398b1367a78955ae6f7edd80107cf18.jpg',
  },

  // ── Desserts ──
  {
    id: 13, name: 'Gulab Jamun',
    category: 'Desserts', price: 119, isVeg: true,
    description: 'Soft, spongy milk-solid dumplings soaked in rose-flavoured sugar syrup. Served warm.',
    image: 'https://i.pinimg.com/avif/1200x/04/3e/f8/043ef80ed6c4c1ad98be030f1c5afead.avf',
  },
  {
    id: 14, name: 'Kheer',
    category: 'Desserts', price: 99, isVeg: true,
    description: 'Creamy slow-cooked rice pudding with cardamom, saffron, almonds and pistachios.',
    image: 'https://i.pinimg.com/1200x/4f/ef/6e/4fef6eb53aedb0337475ccdd771005af.jpg',
  },

  // ── Drinks ──
  {
    id: 15, name: 'Mango Lassi',
    category: 'Drinks', price: 99, isVeg: true,
    description: 'Thick, chilled yoghurt blended with sweet Alphonso mango. Pure summer bliss.',
    image: 'https://i.pinimg.com/1200x/97/25/ec/9725eca29432bd79fc5dbc34d1dffc75.jpg',
  },
  {
    id: 16, name: 'Masala Chai',
    category: 'Drinks', price: 59, isVeg: true,
    description: 'Freshly brewed spiced tea with ginger, cardamom, and cinnamon. Served piping hot.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80',
  },
];

const CATEGORIES = ['All', 'Main Course', 'Biryani', 'Starters', 'Breads', 'Desserts', 'Drinks'];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MENU_ITEMS.filter(item => {
    const matchCat    = activeCategory === 'All' || item.category === activeCategory;
    const matchFilter = filter === 'all' || (filter === 'veg' ? item.isVeg : !item.isVeg);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchFilter && matchSearch;
  });

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>Our Menu</h2>
          <p>Authentic Indian flavours. Fresh ingredients. Every time.</p>
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
              <button key={cat}
                className={`pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="veg-filter">
            {[['all','🍽️ All'],['veg','🟢 Veg'],['nonveg','🔴 Non-Veg']].map(([f,l]) => (
              <button key={f}
                className={`pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <p className="menu-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>

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
