import React, { useState } from 'react';
import { MENU_ITEMS } from './Menu';
import { useOrders } from '../context/OrderContext';

const FAKE_USERS = [
  { id:1, name:'Rohit Sharma',  email:'rohit@gmail.com',  phone:'9876543210', orders:8,  spent:4820, joined:'Jan 2026' },
  { id:2, name:'Priya Singh',   email:'priya@gmail.com',  phone:'9765432109', orders:5,  spent:2340, joined:'Feb 2026' },
  { id:3, name:'Arjun Mehta',   email:'arjun@yahoo.com',  phone:'9654321098', orders:12, spent:8760, joined:'Dec 2025' },
  { id:4, name:'Sneha Gupta',   email:'sneha@gmail.com',  phone:'9543210987', orders:3,  spent:1290, joined:'Mar 2026' },
  { id:5, name:'Vikram Yadav',  email:'vikram@yahoo.com', phone:'9432109876', orders:7,  spent:3870, joined:'Jan 2026' },
];


const STATUS_COLORS = {
  placed:    { bg:'#eff6ff', color:'#3b82f6', label:'Placed' },
  confirmed: { bg:'#fef3c7', color:'#d97706', label:'Confirmed' },
  preparing: { bg:'#fff7ed', color:'#ea580c', label:'Preparing' },
  pickup:    { bg:'#fdf4ff', color:'#9333ea', label:'Out for Delivery' },
  delivered: { bg:'#f0fdf4', color:'#16a34a', label:'Delivered' },
  cancelled: { bg:'#fef2f2', color:'#dc2626', label:'Cancelled' },
};
const NEXT = { placed:'confirmed', confirmed:'preparing', preparing:'pickup', pickup:'delivered' };

// ── Dashboard ──
function Dashboard({ orders, menuItems }) {
  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((s,o) => s + (o.pricing?.grandTotal || 0), 0);
  const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;

  const stats = [
    { label:'Total Revenue',    value:`₹${totalRevenue.toLocaleString()}`, icon:'💰', color:'#22c55e', sub:'From delivered orders' },
    { label:'Total Orders',     value:orders.length,   icon:'📦', color:'#3b82f6', sub:'All time' },
    { label:'Active Orders',    value:activeOrders,    icon:'🔥', color:'#E8401C', sub:'In progress' },
    { label:'Menu Items',       value:menuItems.length,icon:'🍽️', color:'#f59e0b', sub:`${menuItems.filter(i=>i.isVeg).length} veg · ${menuItems.filter(i=>!i.isVeg).length} non-veg` },
    { label:'Registered Users', value:FAKE_USERS.length,icon:'👥',color:'#8b5cf6', sub:'Customers' },
    { label:'Avg Order Value',  value:orders.length ? `₹${Math.round(orders.reduce((s,o)=>s+(o.pricing?.grandTotal||0),0)/orders.length)}` : '₹0', icon:'📊', color:'#06b6d4', sub:'Per order' },
  ];

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>Dashboard Overview</h2>
        <span className="ap-badge live">● Live</span>
      </div>
      <div className="ap-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="ap-stat-card" style={{'--stat-color':s.color}}>
            <div className="ap-stat-icon">{s.icon}</div>
            <div className="ap-stat-info">
              <p className="ap-stat-value">{s.value}</p>
              <p className="ap-stat-label">{s.label}</p>
              <p className="ap-stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="ap-dash-grid">
        <div className="ap-card">
          <div className="ap-card-head"><h3>Recent Orders</h3><span className="ap-count">{orders.length}</span></div>
          {orders.length === 0 ? (
            <div className="ap-empty">No orders yet. Orders placed by customers will appear here.</div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {orders.slice(0,6).map(o => (
                    <tr key={o.id}>
                      <td><span className="ap-order-id">{o.id}</span></td>
                      <td>{o.customer}</td>
                      <td><strong>₹{o.pricing?.grandTotal}</strong></td>
                      <td><span className="ap-status-pill" style={{background:STATUS_COLORS[o.status]?.bg,color:STATUS_COLORS[o.status]?.color}}>{STATUS_COLORS[o.status]?.label}</span></td>
                      <td className="ap-muted">{new Date(o.placedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="ap-card">
          <div className="ap-card-head"><h3>Top Selling Dishes</h3></div>
          <div className="ap-top-dishes">
            {menuItems.slice(0,5).map((item,i) => (
              <div key={item.id} className="ap-top-dish">
                <span className="ap-top-rank">#{i+1}</span>
                <img src={item.image} alt={item.name} className="ap-dish-thumb" onError={e=>e.target.style.display='none'} />
                <div className="ap-dish-info">
                  <p className="ap-dish-name">{item.name}</p>
                  <p className="ap-dish-cat">{item.category}</p>
                </div>
                <div className="ap-dish-stats">
                  <p className="ap-dish-orders">{40-i*5} orders</p>
                  <p className="ap-dish-rev">₹{(item.price*(40-i*5)).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu Management ──
function MenuManagement({ menuItems, setMenuItems }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name:'', category:'Main Course', price:'', isVeg:true, description:'', image:'' });
  const CATS = ['Main Course','Biryani','Starters','Breads','Desserts','Drinks'];
  const filtered = menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ name:'', category:'Main Course', price:'', isVeg:true, description:'', image:'' }); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ name:item.name, category:item.category, price:item.price, isVeg:item.isVeg, description:item.description, image:item.image||'' }); setEditItem(item.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editItem) {
      setMenuItems(prev => prev.map(i => i.id===editItem ? {...i,...form,price:Number(form.price)} : i));
    } else {
      setMenuItems(prev => [...prev, {...form, id:Date.now(), price:Number(form.price)}]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => { if (window.confirm('Delete this item?')) setMenuItems(prev => prev.filter(i => i.id!==id)); };
  const toggleAvail = (id) => setMenuItems(prev => prev.map(i => i.id===id ? {...i, isAvailable:!(i.isAvailable!==false)} : i));

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>Menu Management</h2>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <input className="ap-search" placeholder="🔍 Search dishes..." value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="ap-btn-primary" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Type</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><img src={item.image} alt={item.name} className="ap-dish-thumb" onError={e=>e.target.style.display='none'} /></td>
                  <td><strong>{item.name}</strong><br/><span className="ap-muted" style={{fontSize:'0.75rem'}}>{item.description?.slice(0,45)}...</span></td>
                  <td><span className="ap-cat-tag">{item.category}</span></td>
                  <td><strong>₹{item.price}</strong></td>
                  <td><span className="ap-veg-dot">{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span></td>
                  <td><button className={`ap-toggle ${item.isAvailable!==false?'on':'off'}`} onClick={()=>toggleAvail(item.id)}>{item.isAvailable!==false?'Available':'Hidden'}</button></td>
                  <td><div style={{display:'flex',gap:'0.4rem'}}>
                    <button className="ap-icon-btn edit" onClick={()=>openEdit(item)}>✏️</button>
                    <button className="ap-icon-btn delete" onClick={()=>handleDelete(item.id)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <div className="ap-modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="ap-modal" onClick={e=>e.stopPropagation()}>
            <div className="ap-modal-head"><h3>{editItem?'Edit Item':'Add New Item'}</h3><button onClick={()=>setShowForm(false)}>✕</button></div>
            <div className="ap-modal-body">
              <div className="ap-form-row">
                <div className="ap-field"><label>Item Name *</label><input placeholder="e.g. Butter Chicken" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="ap-field"><label>Price (₹) *</label><input type="number" placeholder="299" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
              </div>
              <div className="ap-form-row">
                <div className="ap-field"><label>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="ap-field"><label>Type</label><select value={form.isVeg} onChange={e=>setForm({...form,isVeg:e.target.value==='true'})}><option value="true">🟢 Vegetarian</option><option value="false">🔴 Non-Vegetarian</option></select></div>
              </div>
              <div className="ap-field"><label>Image URL</label><input placeholder="https://images.unsplash.com/..." value={form.image} onChange={e=>setForm({...form,image:e.target.value})} /></div>
              <div className="ap-field"><label>Description</label><textarea rows={3} placeholder="Describe the dish..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              {form.image && <img src={form.image} alt="preview" className="ap-img-preview" onError={e=>e.target.style.display='none'} />}
            </div>
            <div className="ap-modal-foot">
              <button className="ap-btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="ap-btn-primary" onClick={handleSave}>{editItem?'Save Changes':'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Orders (reads from shared OrderContext) ──
function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const matchStatus = filter==='all' || o.status===filter;
    const matchSearch = o.customer?.toLowerCase().includes(search.toLowerCase()) || o.id?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>Order Management</h2>
        <input className="ap-search" placeholder="🔍 Search orders..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Status filter tabs */}
      <div className="ap-filter-tabs">
        {['all','placed','confirmed','preparing','pickup','delivered','cancelled'].map(s => (
          <button key={s} className={`ap-filter-tab ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>
            {s==='all' ? 'All Orders' : STATUS_COLORS[s]?.label}
            <span className="ap-tab-count">{s==='all' ? orders.length : orders.filter(o=>o.status===s).length}</span>
          </button>
        ))}
      </div>

      <div className="ap-card">
        {orders.length === 0 ? (
          <div className="ap-empty">
            <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📭</div>
            <p>No orders yet. When customers place orders, they'll appear here in real time!</p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Address</th><th>Payment</th><th>Status</th><th>Update Status</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} className="ap-empty">No orders match this filter.</td></tr>
                  : filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span className="ap-order-id">{o.id}</span>
                      <br/><span className="ap-muted" style={{fontSize:'0.7rem'}}>{new Date(o.placedAt).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}</span>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div className="ap-user-avatar">{o.customer?.charAt(0)}</div>
                        <div>
                          <strong>{o.customer}</strong>
                          <p className="ap-muted" style={{fontSize:'0.72rem'}}>{o.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
                        {o.items?.slice(0,2).map((item,i) => (
                          <span key={i} style={{fontSize:'0.75rem'}}>{item.name} ×{item.qty}</span>
                        ))}
                        {o.items?.length > 2 && <span className="ap-muted" style={{fontSize:'0.72rem'}}>+{o.items.length-2} more</span>}
                      </div>
                    </td>
                    <td><strong>₹{o.pricing?.grandTotal}</strong><br/><span className="ap-muted" style={{fontSize:'0.72rem'}}>{o.payment?.method}</span></td>
                    <td><span className="ap-muted" style={{fontSize:'0.75rem',maxWidth:'140px',display:'block'}}>{o.address}</span></td>
                    <td><span className="ap-cat-tag">{o.payment?.method}</span></td>
                    <td><span className="ap-status-pill" style={{background:STATUS_COLORS[o.status]?.bg,color:STATUS_COLORS[o.status]?.color}}>{STATUS_COLORS[o.status]?.label}</span></td>
                    <td>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                        {NEXT[o.status] && (
                          <button className="ap-btn-sm" onClick={()=>updateOrderStatus(o.id, NEXT[o.status])}>
                            → {STATUS_COLORS[NEXT[o.status]]?.label}
                          </button>
                        )}
                        {o.status==='placed' && (
                          <button className="ap-btn-sm cancel" onClick={()=>updateOrderStatus(o.id,'cancelled')}>✕ Cancel</button>
                        )}
                        {o.status==='delivered' && <span style={{fontSize:'0.75rem',color:'#22c55e',fontWeight:700}}>✓ Done</span>}
                        {o.status==='cancelled' && <span style={{fontSize:'0.75rem',color:'#dc2626',fontWeight:700}}>✗ Cancelled</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Users ──
function Users() {
  const { orders } = useOrders();

  const realCustomers = [...new Map(orders.map(o => [o.customer, {
    id: o.id, name: o.customer, phone: o.phone||'—',
    email: `${o.customer?.split(' ')[0]?.toLowerCase()}@gmail.com`,
    orders: orders.filter(x=>x.customer===o.customer).length,
    spent: orders.filter(x=>x.customer===o.customer).reduce((s,x)=>s+(x.pricing?.grandTotal||0),0),
    joined: new Date(o.placedAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}),
    isReal: true,
  }])).values()];

  const [users, setUsers] = useState(() => [
    ...realCustomers,
    ...FAKE_USERS.filter(u => !realCustomers.find(r => r.name === u.name))
  ]);
  const [editUser, setEditUser]   = useState(null);   // user being edited
  const [showEdit, setShowEdit]   = useState(false);
  const [form, setForm]           = useState({});
  const [search, setSearch]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to confirm delete

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone });
    setEditUser(u);
    setShowEdit(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    setUsers(prev => prev.map(u =>
      u === editUser ? { ...u, ...form } : u
    ));
    setShowEdit(false);
  };

  const handleDelete = (u) => {
    setUsers(prev => prev.filter(x => x !== u));
    setDeleteConfirm(null);
  };

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>User Management</h2>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <input className="ap-search" placeholder="🔍 Search users..." value={search} onChange={e=>setSearch(e.target.value)} />
          <span className="ap-badge">{users.length} users</span>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="ap-empty">No users found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                      <div className="ap-user-avatar" style={u.isReal?{background:'#22c55e'}:{}}>{u.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <div>
                        <strong>{u.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td className="ap-muted">{u.email}</td>
                  <td className="ap-muted">{u.phone}</td>
                  <td><span className="ap-badge">{u.orders} orders</span></td>
                  <td><strong style={{color:'#22c55e'}}>₹{u.spent?.toLocaleString()}</strong></td>
                  <td className="ap-muted">{u.joined}</td>
                  <td>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <button className="ap-icon-btn edit" onClick={() => openEdit(u)} title="Edit user">✏️</button>
                      <button className="ap-icon-btn delete" onClick={() => setDeleteConfirm(u)} title="Delete user">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="ap-modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div className="ap-modal-head">
              <h3>Edit User</h3>
              <button onClick={() => setShowEdit(false)}>✕</button>
            </div>
            <div className="ap-modal-body">
              {/* Avatar preview */}
              <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'0.5rem'}}>
                <div className="ap-user-avatar" style={{width:48,height:48,fontSize:'1rem',background: editUser?.isReal ? '#22c55e' : 'var(--primary)'}}>
                  {form.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <p style={{fontWeight:700,color:'var(--dark)'}}>{form.name || 'User Name'}</p>
                </div>
              </div>
              <div className="ap-field">
                <label>Full Name *</label>
                <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="ap-field">
                <label>Email *</label>
                <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="ap-field">
                <label>Phone</label>
                <input type="tel" placeholder="10-digit number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} />
              </div>
            </div>
            <div className="ap-modal-foot">
              <button className="ap-btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="ap-btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="ap-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ap-modal" style={{maxWidth:380}} onClick={e => e.stopPropagation()}>
            <div className="ap-modal-head">
              <h3>Delete User</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="ap-modal-body">
              <div style={{textAlign:'center',padding:'0.5rem 0'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🗑️</div>
                <p style={{fontWeight:700,color:'var(--dark)',marginBottom:'0.4rem'}}>Delete <span style={{color:'#dc2626'}}>{deleteConfirm.name}</span>?</p>
                <p style={{fontSize:'0.85rem',color:'var(--gray)'}}>This action cannot be undone. The user's data will be permanently removed.</p>
              </div>
            </div>
            <div className="ap-modal-foot">
              <button className="ap-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="ap-btn-primary" style={{background:'#dc2626'}} onClick={() => handleDelete(deleteConfirm)}>🗑️ Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════
//  MAIN ADMIN PANEL
// ════════════════════════════════════════
export default function AdminPanel({ onLogout }) {
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeCount = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;

  const NAV = [
    { key:'dashboard', icon:'📊', label:'Dashboard' },
    { key:'menu',      icon:'🍽️', label:'Menu Items' },
    { key:'orders',    icon:'📦', label:'Orders', badge: activeCount },
    { key:'users',     icon:'👥', label:'Users' },
  ];

  return (
    <div className="admin-panel">
      <aside className={`ap-sidebar ${sidebarOpen?'':'collapsed'}`}>
        <div className="ap-sidebar-brand">
          <span className="ap-brand-icon">🔥</span>
          {sidebarOpen && <span className="ap-brand-name">CraveIt</span>}
        </div>
        {sidebarOpen && <p className="ap-sidebar-sub">Admin Panel</p>}
        <nav className="ap-nav">
          {NAV.map(n => (
            <button key={n.key} className={`ap-nav-item ${activeTab===n.key?'active':''}`}
              onClick={()=>setActiveTab(n.key)} title={n.label}>
              <span className="ap-nav-icon">{n.icon}</span>
              {sidebarOpen && <span className="ap-nav-label">{n.label}</span>}
              {n.badge > 0 && <span className="ap-nav-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="ap-sidebar-footer">
          <button className="ap-nav-item" onClick={onLogout}>
            <span className="ap-nav-icon">🚪</span>
            {sidebarOpen && <span className="ap-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="ap-main">
        <div className="ap-topbar">
          <button className="ap-collapse-btn" onClick={()=>setSidebarOpen(o=>!o)}>{sidebarOpen?'◀':'▶'}</button>
          <div className="ap-topbar-title">{NAV.find(n=>n.key===activeTab)?.icon} {NAV.find(n=>n.key===activeTab)?.label}</div>
          <div className="ap-topbar-right">
            {activeCount > 0 && <span className="ap-badge live" style={{marginRight:'0.75rem'}}>● {activeCount} active</span>}
            <span className="ap-admin-chip">👨‍💼 Admin</span>
          </div>
        </div>
        <div className="ap-content">
          {activeTab==='dashboard' && <Dashboard orders={orders} menuItems={menuItems} />}
          {activeTab==='menu'      && <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />}
          {activeTab==='orders'    && <Orders />}
          {activeTab==='users'     && <Users />}
        </div>
      </div>
    </div>
  );
}
