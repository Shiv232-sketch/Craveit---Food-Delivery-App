import React, { useState, useEffect } from 'react';
import { MENU_ITEMS } from './Menu';
import { useOrders } from '../context/OrderContext';

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
function Dashboard({ orders, menuItems, userCount }) {
  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((s,o) => s + (o.pricing?.grandTotal || 0), 0);
  const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;

  const stats = [
    { label:'Total Revenue',    value:`₹${totalRevenue.toLocaleString()}`, icon:'💰', color:'#22c55e', sub:'From delivered orders' },
    { label:'Total Orders',     value:orders.length,   icon:'📦', color:'#3b82f6', sub:'All time' },
    { label:'Active Orders',    value:activeOrders,    icon:'🔥', color:'#E8401C', sub:'In progress' },
    { label:'Menu Items',       value:menuItems.length,icon:'🍽️', color:'#f59e0b', sub:`${menuItems.filter(i=>i.isVeg).length} veg · ${menuItems.filter(i=>!i.isVeg).length} non-veg` },
    { label:'Registered Users', value:userCount,icon:'👥',color:'#8b5cf6', sub:'Customers' },
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
                    <tr key={o._id||o.id}>
                      <td><span className="ap-order-id">{o._id||o.id}</span></td>
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
            {(() => {
              // Compute real order counts per menu item from actual orders
              const itemCounts = {};
              orders.forEach(o => {
                (o.items || []).forEach(item => {
                  const key = item.name;
                  if (!itemCounts[key]) itemCounts[key] = { count: 0, revenue: 0 };
                  itemCounts[key].count += (item.qty || 1);
                  itemCounts[key].revenue += (item.price || 0) * (item.qty || 1);
                });
              });
              // Rank menu items by real order count
              const ranked = menuItems.map(item => ({
                ...item,
                orderCount: itemCounts[item.name]?.count || 0,
                orderRevenue: itemCounts[item.name]?.revenue || 0,
              })).sort((a,b) => b.orderCount - a.orderCount).slice(0,5);
              return ranked.map((item,i) => (
                <div key={item.id||item._id} className="ap-top-dish">
                  <span className="ap-top-rank">#{i+1}</span>
                  <img src={item.image} alt={item.name} className="ap-dish-thumb" onError={e=>e.target.style.display='none'} />
                  <div className="ap-dish-info">
                    <p className="ap-dish-name">{item.name}</p>
                    <p className="ap-dish-cat">{item.category}</p>
                  </div>
                  <div className="ap-dish-stats">
                    <p className="ap-dish-orders">{item.orderCount} orders</p>
                    <p className="ap-dish-rev">₹{item.orderRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu Management ──
function MenuManagement({ menuItems, setMenuItems }) {
  const [showForm, setShowForm]         = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [search, setSearch]             = useState('');
  const [form, setForm]                 = useState({ name:'', category:'Main Course', price:'', isVeg:true, description:'', image:'' });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading]       = useState(false);
  const fileInputRef                    = React.useRef(null);
  const CATS = ['Main Course','Biryani','Starters','Breads','Desserts','Drinks'];
  const filtered = menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
  const adminToken = localStorage.getItem('craveit_admin');

  const openAdd  = () => { setForm({ name:'', category:'Main Course', price:'', isVeg:true, description:'', image:'' }); setImagePreview(''); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ name:item.name, category:item.category, price:item.price, isVeg:item.isVeg, description:item.description, image:item.image||'' }); setImagePreview(item.image||''); setEditItem(item._id||item.id); setShowForm(true); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image too large! Max 5MB.'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/webp', 0.6);
        setForm(prev => ({ ...prev, image: compressedBase64 }));
        setImagePreview(compressedBase64);
        setUploading(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const body = { ...form, price: Number(form.price) };
    try {
      if (editItem) {
        const res  = await fetch(`${API}/menu/${editItem}`, { method:'PUT', headers:{'Content-Type':'application/json','x-admin-token':adminToken}, body:JSON.stringify(body) });
        const data = await res.json();
        if (data.success) { setMenuItems(prev => prev.map(i => (i._id||i.id)===editItem ? {...data.item, id:data.item._id} : i)); }
        else { alert('Error: ' + data.message); return; }
      } else {
        const res  = await fetch(`${API}/menu`, { method:'POST', headers:{'Content-Type':'application/json','x-admin-token':adminToken}, body:JSON.stringify(body) });
        const data = await res.json();
        if (data.success) { setMenuItems(prev => [...prev, {...data.item, id:data.item._id}]); }
        else { alert('Error: ' + data.message); return; }
      }
    } catch { if (editItem) { setMenuItems(prev => prev.map(i => (i._id||i.id)===editItem ? {...i,...body} : i)); } else { setMenuItems(prev => [...prev, {...body, id:Date.now(), _id:Date.now().toString()}]); } }
    setShowForm(false); setImagePreview('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await fetch(`${API}/menu/${id}`, { method:'DELETE', headers:{'x-admin-token':adminToken} }); } catch {}
    setMenuItems(prev => prev.filter(i => (i._id||i.id) !== id));
  };

  const toggleAvail = async (id) => {
    try { await fetch(`${API}/menu/${id}/toggle`, { method:'PATCH', headers:{'x-admin-token':adminToken} }); } catch {}
    setMenuItems(prev => prev.map(i => (i._id||i.id)===id ? {...i, isAvailable:!(i.isAvailable!==false)} : i));
  };

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
                <tr key={item._id||item.id}>
                  <td><img src={item.image} alt={item.name} className="ap-dish-thumb" onError={e=>e.target.style.display='none'} /></td>
                  <td><strong>{item.name}</strong><br/><span className="ap-muted" style={{fontSize:'0.75rem'}}>{item.description?.slice(0,45)}...</span></td>
                  <td><span className="ap-cat-tag">{item.category}</span></td>
                  <td><strong>₹{item.price}</strong></td>
                  <td><span className="ap-veg-dot">{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span></td>
                  <td><button className={`ap-toggle ${item.isAvailable!==false?'on':'off'}`} onClick={()=>toggleAvail(item._id||item.id)}>{item.isAvailable!==false?'Available':'Hidden'}</button></td>
                  <td><div style={{display:'flex',gap:'0.4rem'}}>
                    <button className="ap-icon-btn edit" onClick={()=>openEdit(item)}>✏️</button>
                    <button className="ap-icon-btn delete" onClick={()=>handleDelete(item._id||item.id)}>🗑️</button>
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
              <div className="ap-field">
                <label>Dish Image</label>
                {imagePreview && (
                  <div style={{marginBottom:'0.75rem',position:'relative',display:'inline-block'}}>
                    <img src={imagePreview} alt="preview" style={{width:120,height:90,objectFit:'cover',borderRadius:10,border:'2px solid var(--border)',display:'block'}} onError={e=>e.target.style.display='none'} />
                    <button onClick={()=>{setImagePreview('');setForm(prev=>({...prev,image:''}));}} style={{position:'absolute',top:-6,right:-6,background:'#ef4444',color:'white',border:'none',borderRadius:'50%',width:20,height:20,fontSize:11,cursor:'pointer'}}>✕</button>
                  </div>
                )}
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                  <button type="button" onClick={()=>fileInputRef.current?.click()} style={{padding:'0.5rem 1rem',borderRadius:8,border:'1.5px dashed var(--primary)',background:'rgba(232,64,28,0.05)',color:'var(--primary)',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                    {uploading ? '⏳ Uploading...' : '📁 Choose Image from Computer'}
                  </button>
                  {imagePreview && <span style={{fontSize:12,color:'#22c55e',fontWeight:600}}>✓ Image selected</span>}
                </div>
                <p style={{fontSize:11,color:'var(--gray)',marginTop:'0.4rem'}}>Max size: 2MB. JPG, PNG, WEBP supported.</p>
              </div>
              <div className="ap-field"><label>Description</label><textarea rows={3} placeholder="Describe the dish..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
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

// ── Orders ──
function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const matchStatus = filter==='all' || o.status===filter;
    const matchSearch = o.customer?.toLowerCase().includes(search.toLowerCase()) || (o._id||o.id)?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>Order Management</h2>
        <input className="ap-search" placeholder="🔍 Search orders..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
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
          <div className="ap-empty"><div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📭</div><p>No orders yet. When customers place orders, they'll appear here in real time!</p></div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Address</th><th>Payment</th><th>Status</th><th>Update Status</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} className="ap-empty">No orders match this filter.</td></tr>
                  : filtered.map(o => (
                  <tr key={o._id||o.id}>
                    <td><span className="ap-order-id">{o._id||o.id}</span><br/><span className="ap-muted" style={{fontSize:'0.7rem'}}>{new Date(o.placedAt).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})}</span></td>
                    <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><div className="ap-user-avatar">{o.customer?.charAt(0)}</div><div><strong>{o.customer}</strong><p className="ap-muted" style={{fontSize:'0.72rem'}}>{o.phone}</p></div></div></td>
                    <td><div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>{o.items?.slice(0,2).map((item,i) => (<span key={i} style={{fontSize:'0.75rem'}}>{item.name} ×{item.qty}</span>))}{o.items?.length > 2 && <span className="ap-muted" style={{fontSize:'0.72rem'}}>+{o.items.length-2} more</span>}</div></td>
                    <td><strong>₹{o.pricing?.grandTotal}</strong><br/><span className="ap-muted" style={{fontSize:'0.72rem'}}>{o.payment?.method}</span></td>
                    <td><span className="ap-muted" style={{fontSize:'0.75rem',maxWidth:'140px',display:'block'}}>{o.address}</span></td>
                    <td><span className="ap-cat-tag">{o.payment?.method}</span></td>
                    <td><span className="ap-status-pill" style={{background:STATUS_COLORS[o.status]?.bg,color:STATUS_COLORS[o.status]?.color}}>{STATUS_COLORS[o.status]?.label}</span></td>
                    <td><div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                      {NEXT[o.status] && (<button className="ap-btn-sm" onClick={()=>updateOrderStatus(o._id||o.id, NEXT[o.status])}>→ {STATUS_COLORS[NEXT[o.status]]?.label}</button>)}
                      {o.status==='placed' && (<button className="ap-btn-sm cancel" onClick={()=>updateOrderStatus(o._id||o.id,'cancelled')}>✕ Cancel</button>)}
                      {o.status==='delivered' && <span style={{fontSize:'0.75rem',color:'#22c55e',fontWeight:700}}>✓ Done</span>}
                      {o.status==='cancelled' && <span style={{fontSize:'0.75rem',color:'#dc2626',fontWeight:700}}>✗ Cancelled</span>}
                    </div></td>
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

  const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
  const adminToken = localStorage.getItem('craveit_admin');

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading,          setLoading]         = useState(true);
  const [editUser,         setEditUser]        = useState(null);
  const [showEdit,         setShowEdit]        = useState(false);
  const [form,             setForm]            = useState({});
  const [search,           setSearch]          = useState('');
  const [deleteConfirm,    setDeleteConfirm]   = useState(null);
  const [filter,           setFilter]          = useState('all');

  // Fetch REAL registered users from MongoDB — once only
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/users`, {
          headers: { 'x-admin-token': adminToken }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setRegisteredUsers(data.users.map(u => ({
            ...u,
            id:     u._id || u.id,
            phone:  u.phone || '—',
            joined: new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
            type:   'registered', // ← Signed up via signup page
          })));
        }
      } catch (err) {
        console.log('Could not fetch users from backend:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Add order stats to registered users
  const registeredWithStats = registeredUsers.map(u => ({
    ...u,
    orders: orders.filter(o => o.user === (u._id||u.id) || o.customer?.toLowerCase() === u.name?.toLowerCase()).length,
    spent:  orders.filter(o => o.user === (u._id||u.id) || o.customer?.toLowerCase() === u.name?.toLowerCase()).reduce((s,x) => s+(x.pricing?.grandTotal||0), 0),
  }));

  // Guest users = placed orders but never signed up
  const registeredNamesLower = registeredUsers.map(u => u.name?.trim().toLowerCase());
  const guestUsers = [...new Map(orders.map(o => [o.customer, {
    id:     o._id||o.id,
    name:   o.customer,
    phone:  o.phone||'—',
    email:  `${o.customer?.split(' ')[0]?.toLowerCase()}@guest.com`,
    orders: orders.filter(x => x.customer===o.customer).length,
    spent:  orders.filter(x => x.customer===o.customer).reduce((s,x) => s+(x.pricing?.grandTotal||0), 0),
    joined: new Date(o.placedAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' }),
    type:   'guest',
  }])).values()]
  .filter(g => g && g.name && !registeredNamesLower.includes(g.name.trim().toLowerCase()));

  // Combine: registered first, then guests
  const allUsers = [...registeredWithStats, ...guestUsers];

  const filtered = allUsers.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || u.type===filter;
    return matchSearch && matchFilter;
  });

  const registeredCount = registeredWithStats.length;
  const guestCount      = guestUsers.length;

  const openEdit = (u) => { setForm({ name:u.name, email:u.email, phone:u.phone==='—'?'':u.phone }); setEditUser(u); setShowEdit(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    try {
      const res  = await fetch(`${API}/users/${editUser._id||editUser.id}`, { method:'PUT', headers:{'Content-Type':'application/json','x-admin-token':adminToken}, body:JSON.stringify(form) });
      const data = await res.json();
      if (data.success) setRegisteredUsers(prev => prev.map(u => (u._id||u.id)===(editUser._id||editUser.id) ? {...u,...form} : u));
    } catch { setRegisteredUsers(prev => prev.map(u => u===editUser ? {...u,...form} : u)); }
    setShowEdit(false);
  };

  const handleDelete = async (u) => {
    try { await fetch(`${API}/users/${u._id||u.id}`, { method:'DELETE', headers:{'x-admin-token':adminToken} }); } catch {}
    setRegisteredUsers(prev => prev.filter(x => (x._id||x.id)!==(u._id||u.id)));
    setDeleteConfirm(null);
  };

  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h2>User Management</h2>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
          <input className="ap-search" placeholder="🔍 Search users..." value={search} onChange={e=>setSearch(e.target.value)} />
          <span className="ap-badge">{allUsers.length} users</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{display:'flex',gap:'1rem',marginBottom:'1.25rem'}}>
        {[
          { label:'Total Users',          value:allUsers.length,   color:'#6366f1', icon:'👥' },
          { label:'Registered (Sign Up)', value:registeredCount,   color:'#22c55e', icon:'✅' },
          { label:'Guest (Order Only)',   value:guestCount,         color:'#f59e0b', icon:'🛒' },
        ].map(s => (
          <div key={s.label} style={{background:'white',borderRadius:12,border:'1.5px solid #e5e7eb',padding:'0.85rem 1.25rem',display:'flex',alignItems:'center',gap:'0.75rem',flex:1}}>
            <span style={{fontSize:'1.4rem'}}>{s.icon}</span>
            <div>
              <p style={{fontFamily:'var(--font-head)',fontSize:'1.4rem',fontWeight:900,color:s.color}}>{s.value}</p>
              <p style={{fontSize:'0.72rem',color:'var(--gray)',fontWeight:600}}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
        {[['all','All Users'],['registered','✅ Registered'],['guest','🛒 Guest']].map(([key,label]) => (
          <button key={key} onClick={()=>setFilter(key)} style={{padding:'0.4rem 1rem',borderRadius:8,fontSize:'0.82rem',fontWeight:700,background:filter===key?'var(--primary)':'white',color:filter===key?'white':'var(--gray)',border:filter===key?'1.5px solid var(--primary)':'1.5px solid #e5e7eb',cursor:'pointer'}}>{label}</button>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="ap-empty">Loading users...</td></tr>
              ) : filtered.length===0 ? (
                <tr><td colSpan={8} className="ap-empty">No users found.</td></tr>
              ) : filtered.map((u,i) => (
                <tr key={i}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                      <div className="ap-user-avatar" style={{background:u.type==='registered'?'#22c55e':'#f59e0b'}}>{u.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td className="ap-muted">{u.email}</td>
                  <td className="ap-muted">{u.phone}</td>
                  <td>
                    <span style={{fontSize:'0.72rem',fontWeight:700,padding:'0.2rem 0.6rem',borderRadius:20,background:u.type==='registered'?'#f0fdf4':'#fef3c7',color:u.type==='registered'?'#16a34a':'#d97706'}}>
                      {u.type==='registered' ? '✅ Registered' : '🛒 Guest'}
                    </span>
                  </td>
                  <td><span className="ap-badge">{u.orders} orders</span></td>
                  <td><strong style={{color:'#22c55e'}}>₹{u.spent?.toLocaleString()}</strong></td>
                  <td className="ap-muted">{u.joined}</td>
                  <td>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <button className="ap-icon-btn edit"   onClick={()=>openEdit(u)}        title="Edit">✏️</button>
                      <button className="ap-icon-btn delete" onClick={()=>setDeleteConfirm(u)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEdit && (
        <div className="ap-modal-overlay" onClick={()=>setShowEdit(false)}>
          <div className="ap-modal" onClick={e=>e.stopPropagation()}>
            <div className="ap-modal-head"><h3>Edit User</h3><button onClick={()=>setShowEdit(false)}>✕</button></div>
            <div className="ap-modal-body">
              <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'0.5rem'}}>
                <div className="ap-user-avatar" style={{width:48,height:48,fontSize:'1rem',background:'var(--primary)'}}>{form.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <p style={{fontWeight:700,color:'var(--dark)'}}>{form.name||'User Name'}</p>
              </div>
              <div className="ap-field"><label>Full Name *</label><input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
              <div className="ap-field"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
              <div className="ap-field"><label>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,'').slice(0,10)})} /></div>
            </div>
            <div className="ap-modal-foot">
              <button className="ap-btn-secondary" onClick={()=>setShowEdit(false)}>Cancel</button>
              <button className="ap-btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="ap-modal-overlay" onClick={()=>setDeleteConfirm(null)}>
          <div className="ap-modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div className="ap-modal-head"><h3>Delete User</h3><button onClick={()=>setDeleteConfirm(null)}>✕</button></div>
            <div className="ap-modal-body">
              <div style={{textAlign:'center',padding:'0.5rem 0'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🗑️</div>
                <p style={{fontWeight:700,color:'var(--dark)',marginBottom:'0.4rem'}}>Delete <span style={{color:'#dc2626'}}>{deleteConfirm.name}</span>?</p>
                <p style={{fontSize:'0.85rem',color:'var(--gray)'}}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="ap-modal-foot">
              <button className="ap-btn-secondary" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
              <button className="ap-btn-primary" style={{background:'#dc2626'}} onClick={()=>handleDelete(deleteConfirm)}>🗑️ Delete User</button>
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
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [menuItems,   setMenuItems]   = useState(MENU_ITEMS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userCount,   setUserCount]   = useState(0);

  const API        = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
  const adminToken = localStorage.getItem('craveit_admin');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res  = await fetch(`${API}/menu/admin/all`, {
          headers: { 'x-admin-token': adminToken }
        });
        const data = await res.json();
        if (data.success && data.items?.length > 0) setMenuItems(data.items.map(i => ({ ...i, id: i._id||i.id })));
      } catch { setMenuItems(MENU_ITEMS); }
    };
    const fetchUserCount = async () => {
      try {
        const res  = await fetch(`${API}/users`, { headers: { 'x-admin-token': adminToken } });
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) setUserCount(data.users.length);
      } catch { /* keep 0 */ }
    };
    fetchMenu();
    fetchUserCount();
  }, []);

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
            <button key={n.key} className={`ap-nav-item ${activeTab===n.key?'active':''}`} onClick={()=>setActiveTab(n.key)} title={n.label}>
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
          {activeTab==='dashboard' && <Dashboard orders={orders} menuItems={menuItems} userCount={userCount} />}
          {activeTab==='menu'      && <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />}
          {activeTab==='orders'    && <Orders />}
          {activeTab==='users'     && <Users />}
        </div>
      </div>
    </div>
  );
}
