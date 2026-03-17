import React, { useState, useEffect } from 'react';
import MenuCard from '../components/MenuCard';

const API = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

// Keep hardcoded items as fallback (when backend is offline)
export const MENU_ITEMS = [
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
    image: 'https://i.pinimg.com/1200x/a7/bb/29/a7bb29a06c102c4eb5b94113393c521f.jpg',
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
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 7, name: 'Mutton Biryani',
    category: 'Biryani', price: 399, isVeg: false,
    description: 'Tender mutton pieces slow-cooked with long-grain basmati rice and Awadhi spices.',
    image: 'https://i.pinimg.com/1200x/4d/ff/58/4dff58c766b2ebb7bc8f0639857fb606.jpg',
  },

  // ── Starters ──
  {
    id: 8, name: 'Paneer Tikka',
    category: 'Starters', price: 229, isVeg: true,
    description: 'Marinated paneer cubes grilled in tandoor with peppers and onions. Served with mint chutney.',
    image: 'https://i.pinimg.com/1200x/b5/5d/6f/b55d6f1c767cd0d9b1a60646afeac3e1.jpg',
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
    image: 'https://i.pinimg.com/1200x/ff/58/52/ff585212e6577fd3bd64cc109f13bbdb.jpg',
  },
  {
    id: 12, name: 'Garlic Naan',
    category: 'Breads', price: 69, isVeg: true,
    description: 'Tandoor-baked flatbread topped with fresh garlic, butter and coriander leaves.',
    image: 'https://i.pinimg.com/1200x/c4/23/fd/c423fd0afd69b890610b464668c1187e.jpg',
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
    image: 'https://i.pinimg.com/1200x/4d/46/b9/4d46b912d1f63044be152371d7ea0962.jpg',
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
    image: 'https://i.pinimg.com/736x/22/33/bf/2233bf899709fc983fa0f2dc1cd3bc35.jpg',
  },
];

const CATEGORIES = ['All', 'Main Course', 'Biryani', 'Starters', 'Breads', 'Desserts', 'Drinks'];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filter, setFilter]                 = useState('all');
  const [search, setSearch]                 = useState('');
  const [menuItems, setMenuItems]           = useState(MENU_ITEMS);
  const [loading, setLoading]               = useState(true);

  // Fetch from backend on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res  = await fetch(`${API}/menu`);
        const data = await res.json();
        if (data.success && data.items?.length > 0) {
          // Normalize MongoDB _id to id for compatibility
          const normalized = data.items.map(item => ({
            ...item,
            id: item._id || item.id,
          }));
          setMenuItems(normalized);
        }
      } catch {
        // Backend offline — keep hardcoded MENU_ITEMS as fallback
        setMenuItems(MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filtered = menuItems.filter(item => {
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
            {loading ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray)' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🍳</div>
                <p>Loading menu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray)' }}>
                <p>No items found.</p>
              </div>
            ) : (
              filtered.map(item => <MenuCard key={item._id || item.id} item={item} />)
            )}
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
