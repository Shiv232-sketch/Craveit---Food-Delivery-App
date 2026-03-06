import React, { useState, useEffect, useCallback } from 'react';
import { useOrders } from '../context/OrderContext';

const STATUSES = [
  { key: 'placed',    label: 'Order Placed',       icon: '📋', desc: 'We have received your order!',             color: '#6366f1' },
  { key: 'confirmed', label: 'Order Confirmed',     icon: '✅', desc: 'Restaurant has confirmed your order.',     color: '#f59e0b' },
  { key: 'preparing', label: 'Preparing Your Food', icon: '👨‍🍳', desc: 'Our chefs are cooking your meal fresh.',  color: '#f97316' },
  { key: 'pickup',    label: 'Rider Picked Up',     icon: '🛵', desc: 'Delivery rider is on the way.',           color: '#E8401C' },
  { key: 'delivered', label: 'Delivered!',          icon: '🎉', desc: 'Enjoy your meal. Bon appétit!',            color: '#22c55e' },
];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function OrderTracking({ activeOrderId }) {
  const { orders } = useOrders();
  const [otp, setOtp] = useState(generateOTP());
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpRefreshing, setOtpRefreshing] = useState(false);

  // Get the active order from shared context (live updates)
  const order = orders.find(o => o.id === activeOrderId) || orders[0] || null;

  const currentStep = order
    ? STATUSES.findIndex(s => s.key === order.status)
    : 0;

  const isDelivered  = order?.status === 'delivered';
  const isRiderPickedUp = currentStep >= 3;

  // OTP countdown
  useEffect(() => {
    if (isDelivered || !order) return;
    const interval = setInterval(() => {
      setOtpTimer(t => {
        if (t <= 1) { refreshOTP(); return 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDelivered, order]);

  const refreshOTP = useCallback(() => {
    setOtpRefreshing(true);
    setTimeout(() => { setOtp(generateOTP()); setOtpRefreshing(false); }, 400);
  }, []);

  const manualRefresh = () => { setOtpTimer(30); refreshOTP(); };

  if (!order) return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>📦 Order Tracking</h2>
          <p>No active order found. Place an order to track it here!</p>
        </div>
        <div className="tracking-empty">
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🍽️</div>
          <p>You haven't placed any orders yet.</p>
        </div>
      </div>
    </div>
  );

  const addrIcon = order.addressType === 'Home' ? '🏠' : order.addressType === 'Work' ? '🏢' : '📌';

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>📦 Live Order Tracking</h2>
          <p>Your order is being prepared!</p>
        </div>

        <div className="tracking-page-grid">

          {/* LEFT — Timeline */}
          <div className="tracking-left">

            {/* Order ID Banner */}
            <div className="order-id-banner">
              <div>
                <p className="order-id-label">Order ID</p>
                <p className="order-id-value">{order.id}</p>
              </div>
              <div>
                <span className={`order-badge ${isDelivered ? 'delivered' : 'active'}`}>
                  {isDelivered ? '✓ Delivered' : '● Live'}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="tracking-timeline-card">
              <h3 className="tracking-card-title">Order Status</h3>
              <div className="timeline">
                {STATUSES.map((status, i) => (
                  <div key={status.key}
                    className={`timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                    <div className="timeline-left">
                      <div className="timeline-icon" style={i <= currentStep ? { background: status.color } : {}}>
                        {i <= currentStep ? status.icon : '○'}
                      </div>
                      {i < STATUSES.length - 1 && (
                        <div className={`timeline-line ${i < currentStep ? 'done' : ''}`}
                          style={i < currentStep ? { background: status.color } : {}} />
                      )}
                    </div>
                    <div className="timeline-info">
                      <p className="timeline-label">{status.label}</p>
                      {i === currentStep && <p className="timeline-desc">{status.desc}</p>}
                      {i < currentStep && <p className="timeline-done-text">Completed</p>}
                    </div>
                    {i === currentStep && (
                      <div className="timeline-pulse">
                        <div className="pulse-dot" style={{ background: status.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="tracking-info-card">
                <h3 className="tracking-card-title">📍 Delivering To</h3>
                <div className="delivery-addr">
                  <span className="delivery-addr-icon">{addrIcon}</span>
                  <div>
                    <p className="delivery-name">{order.customer}</p>
                    <p className="delivery-addr-text">{order.address}</p>
                    {order.phone && <p className="delivery-phone">📞 {order.phone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — OTP + Items */}
          <div className="tracking-right">

            {/* OTP Card */}
            <div className={`otp-card ${isDelivered ? 'otp-done' : ''}`}>
              {!isDelivered ? (
                <>
                  <div className="otp-header">
                    <div>
                      <h3 className="otp-title">🔐 Delivery OTP</h3>
                      <p className="otp-subtitle">
                        {isRiderPickedUp
                          ? 'Share this OTP with your rider to confirm delivery'
                          : 'This OTP activates when your rider picks up the order'}
                      </p>
                    </div>
                    <div className={`otp-timer-ring ${otpTimer <= 10 ? 'urgent' : ''}`}>
                      <svg viewBox="0 0 36 36">
                        <path className="otp-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="otp-ring-fill"
                          style={{ strokeDasharray: `${(otpTimer/30)*100}, 100`, stroke: otpTimer<=10 ? '#ef4444' : 'var(--primary)' }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className={`otp-timer-num ${otpTimer<=10?'urgent':''}`}>{otpTimer}s</span>
                    </div>
                  </div>

                  <div className={`otp-display ${otpRefreshing?'refreshing':''} ${isRiderPickedUp?'otp-active':'otp-waiting'}`}>
                    {otp.split('').map((digit, i) => (
                      <div key={i} className="otp-digit">{digit}</div>
                    ))}
                  </div>

                  <div className="otp-actions">
                    <button className="otp-refresh-btn" onClick={manualRefresh}>🔄 Refresh OTP</button>
                    <p className="otp-refresh-note">Auto-refreshes every 30 seconds</p>
                  </div>

                  <div className={`otp-status-bar ${isRiderPickedUp ? 'active' : 'waiting'}`}>
                    {isRiderPickedUp
                      ? '🛵 Rider is on the way! Share OTP on arrival.'
                      : '⏳ OTP will activate when rider picks up your order.'}
                  </div>
                </>
              ) : (
                <div className="otp-delivered">
                  <div className="otp-delivered-icon">🎉</div>
                  <h3>Order Delivered!</h3>
                  <p>Confirmed by admin. Enjoy your meal!</p>
                  <div className="otp-delivered-checkmark">✓ Delivery Confirmed</div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div className="tracking-info-card">
                <h3 className="tracking-card-title">🍽️ Your Order</h3>
                <div className="tracking-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="tracking-item">
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{width:32,height:32,borderRadius:6,objectFit:'cover'}} />
                        : <span className="tracking-item-emoji">{item.emoji || '🍽️'}</span>}
                      <span className="tracking-item-name">{item.name}</span>
                      <span className="tracking-item-qty">× {item.qty}</span>
                      <span className="tracking-item-price">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="tracking-total">
                  <span>Total Paid</span>
                  <strong>₹{order.pricing?.grandTotal}</strong>
                </div>
              </div>
            )}

            {/* Rider info */}
            {isRiderPickedUp && !isDelivered && (
              <div className="rider-card">
                <h3 className="tracking-card-title">🛵 Your Delivery Rider</h3>
                <div className="rider-info">
                  <div className="rider-avatar">🧑‍🦱</div>
                  <div className="rider-details">
                    <p className="rider-name">Rahul Kumar</p>
                    <p className="rider-phone">📞 +91 98765 XXXXX</p>
                  </div>
                  <button className="rider-call-btn">📞 Call</button>
                </div>
                <div className="rider-eta">
                  <span>🕐 Estimated Arrival</span>
                  <strong>8–12 mins</strong>
                </div>
              </div>
            )}

            {/* Rating after delivery */}
            {isDelivered && (
              <div className="delivered-card">
                <p>🌟 Rate your experience</p>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(s => <button key={s} className="star-btn">⭐</button>)}
                </div>
                <p className="rating-note">Your feedback helps us improve!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
