import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const STATUS_META = {
  placed:    { label: 'Order Placed',       color: '#6366f1', bg: '#eff6ff',   icon: '📋' },
  confirmed: { label: 'Confirmed',          color: '#d97706', bg: '#fef3c7',   icon: '✅' },
  preparing: { label: 'Preparing',          color: '#ea580c', bg: '#fff7ed',   icon: '👨‍🍳' },
  pickup:    { label: 'Out for Delivery',   color: '#9333ea', bg: '#fdf4ff',   icon: '🛵' },
  delivered: { label: 'Delivered',          color: '#16a34a', bg: '#f0fdf4',   icon: '✓'  },
  cancelled: { label: 'Cancelled',          color: '#dc2626', bg: '#fef2f2',   icon: '✕'  },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = orders.filter(o =>
    filter === 'all' || o.status === filter
  );

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="oh-page">
      <div className="container">

        {/* Header */}
        <div className="oh-header">
          <div className="oh-header-left">
            <button className="oh-back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h1>My Orders</h1>
              <p>{user?.name ? `Hi ${user.name.split(' ')[0]}! ` : ''}You have placed <strong>{orders.length}</strong> order{orders.length !== 1 ? 's' : ''} so far.</p>
            </div>
          </div>
          {/* Summary chips */}
          <div className="oh-summary-chips">
            <div className="oh-chip delivered">
              <span>{orders.filter(o => o.status === 'delivered').length}</span>
              <p>Delivered</p>
            </div>
            <div className="oh-chip active">
              <span>{orders.filter(o => !['delivered','cancelled'].includes(o.status)).length}</span>
              <p>Active</p>
            </div>
            <div className="oh-chip cancelled">
              <span>{orders.filter(o => o.status === 'cancelled').length}</span>
              <p>Cancelled</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="oh-filter-tabs">
          {[
            ['all',       'All Orders'],
            ['placed',    'Placed'],
            ['confirmed', 'Confirmed'],
            ['preparing', 'Preparing'],
            ['pickup',    'Out for Delivery'],
            ['delivered', 'Delivered'],
            ['cancelled', 'Cancelled'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`oh-tab ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {STATUS_META[key]?.icon && key !== 'all' && <span>{STATUS_META[key].icon}</span>}
              {label}
              <span className="oh-tab-count">
                {key === 'all' ? orders.length : orders.filter(o => o.status === key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="oh-empty">
            <div className="oh-empty-icon">🍽️</div>
            <h3>No orders yet!</h3>
            <p>You haven't placed any orders. Browse our menu and order something delicious!</p>
            <button className="btn-primary" onClick={() => navigate('/menu')}>Browse Menu →</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="oh-empty">
            <div className="oh-empty-icon">🔍</div>
            <h3>No {STATUS_META[filter]?.label} orders</h3>
            <p>You don't have any orders with this status.</p>
          </div>
        ) : (
          <div className="oh-list">
            {filtered.map(order => {
              const meta = STATUS_META[order.status] || STATUS_META.placed;
              const isOpen = expanded === order.id;

              return (
                <div key={order.id} className={`oh-card ${isOpen ? 'expanded' : ''}`}>

                  {/* Card Header */}
                  <div className="oh-card-top" onClick={() => toggleExpand(order.id)}>
                    <div className="oh-card-left">
                      <div className="oh-status-icon" style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon}
                      </div>
                      <div className="oh-card-info">
                        <div className="oh-card-id-row">
                          <span className="oh-order-id">{order.id}</span>
                          <span className="oh-status-pill" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="oh-card-date">{formatDate(order.placedAt)}</p>
                        <p className="oh-card-preview">
                          {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                          {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="oh-card-right">
                      <p className="oh-card-total">₹{order.pricing?.grandTotal}</p>
                      <p className="oh-card-items">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                      <span className="oh-expand-icon">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="oh-card-body">
                      <div className="oh-card-grid">

                        {/* Items */}
                        <div className="oh-detail-section">
                          <h4>🍽️ Items Ordered</h4>
                          <div className="oh-items-list">
                            {order.items?.map((item, i) => (
                              <div key={i} className="oh-item-row">
                                {item.image
                                  ? <img src={item.image} alt={item.name} className="oh-item-img" onError={e => e.target.style.display='none'} />
                                  : <span className="oh-item-emoji">{item.emoji || '🍽️'}</span>
                                }
                                <span className="oh-item-name">{item.name}</span>
                                <span className="oh-item-qty">× {item.qty}</span>
                                <span className="oh-item-price">₹{item.price * item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing & Address */}
                        <div>
                          {/* Price breakdown */}
                          <div className="oh-detail-section">
                            <h4>💰 Bill Summary</h4>
                            <div className="oh-bill">
                              <div className="oh-bill-row"><span>Subtotal</span><span>₹{order.pricing?.subtotal}</span></div>
                              <div className="oh-bill-row"><span>Taxes (5%)</span><span>₹{order.pricing?.taxes}</span></div>
                              <div className="oh-bill-row"><span>Delivery</span><span>{order.pricing?.deliveryFee === 0 ? 'FREE' : `₹${order.pricing?.deliveryFee}`}</span></div>
                              <div className="oh-bill-row total"><span>Total Paid</span><strong>₹{order.pricing?.grandTotal}</strong></div>
                            </div>
                          </div>

                          {/* Address */}
                          {order.address && (
                            <div className="oh-detail-section" style={{ marginTop: '1rem' }}>
                              <h4>📍 Delivered To</h4>
                              <div className="oh-address-box">
                                <p className="oh-addr-name">{order.customer}</p>
                                <p className="oh-addr-text">{order.address}</p>
                                {order.phone && <p className="oh-addr-phone">📞 {order.phone}</p>}
                              </div>
                            </div>
                          )}

                          {/* Payment */}
                          <div className="oh-detail-section" style={{ marginTop: '1rem' }}>
                            <h4>💳 Payment</h4>
                            <div className="oh-payment-row">
                              <span className="oh-pay-method">{order.payment?.method || 'Online'}</span>
                              <span className="oh-pay-status paid">✓ Paid</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="oh-card-actions">
                        {!['delivered','cancelled'].includes(order.status) && (
                          <button className="oh-action-btn track" onClick={() => navigate('/tracking')}>
                            🛵 Track This Order
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button className="oh-action-btn reorder" onClick={() => navigate('/menu')}>
                            🔄 Order Again
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <p className="oh-cancelled-note">❌ This order was cancelled by the restaurant.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
