import React, { useState, useEffect, useCallback } from 'react';

const STATUSES = [
  { key: 'placed',    label: 'Order Placed',       icon: '📋', desc: 'We have received your order!',              color: '#6366f1' },
  { key: 'confirmed', label: 'Order Confirmed',     icon: '✅', desc: 'Restaurant has confirmed your order.',      color: '#f59e0b' },
  { key: 'preparing', label: 'Preparing Your Food', icon: '👨‍🍳', desc: 'Our chefs are cooking your meal fresh.',   color: '#f97316' },
  { key: 'pickup',    label: 'Rider Picked Up',     icon: '🛵', desc: 'Delivery rider has picked up your order.',  color: '#E8401C' },
  { key: 'delivered', label: 'Delivered!',          icon: '🎉', desc: 'Enjoy your meal. Bon appétit!',             color: '#22c55e' },
];

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function OrderTracking({ orderData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [otp, setOtp] = useState(generateOTP());
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpRefreshing, setOtpRefreshing] = useState(false);
  const [orderId] = useState(orderData?.orderId || 'CRAVEIT-' + Date.now().toString().slice(-6));

  // Auto-advance order steps every 6 seconds for demo
  useEffect(() => {
    if (currentStep >= STATUSES.length - 1) return;
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 6000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // OTP countdown — refreshes every 30 seconds
  useEffect(() => {
    if (currentStep === STATUSES.length - 1) return; // stop after delivery
    const interval = setInterval(() => {
      setOtpTimer(t => {
        if (t <= 1) {
          refreshOTP();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const refreshOTP = useCallback(() => {
    setOtpRefreshing(true);
    setTimeout(() => {
      setOtp(generateOTP());
      setOtpRefreshing(false);
    }, 400);
  }, []);

  const manualRefresh = () => {
    setOtpTimer(30);
    refreshOTP();
  };

  const isDelivered = currentStep === STATUSES.length - 1;
  const isRiderPickedUp = currentStep >= 3; // show OTP from step 3

  return (
    <div className="section">
      <div className="container">

        {/* ── Page Header ── */}
        <div className="section-header">
          <h2>📦 Live Order Tracking</h2>
          <p>Your order is on its way!</p>
        </div>

        <div className="tracking-page-grid">

          {/* ── LEFT: Timeline ── */}
          <div className="tracking-left">

            {/* Order ID Banner */}
            <div className="order-id-banner">
              <div>
                <p className="order-id-label">Order ID</p>
                <p className="order-id-value">{orderId}</p>
              </div>
              <div className="order-id-status">
                <span className={`order-badge ${isDelivered ? 'delivered' : 'active'}`}>
                  {isDelivered ? '✓ Delivered' : '● Live'}
                </span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="tracking-timeline-card">
              <h3 className="tracking-card-title">Order Status</h3>
              <div className="timeline">
                {STATUSES.map((status, i) => (
                  <div key={status.key}
                    className={`timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                    <div className="timeline-left">
                      <div className="timeline-icon"
                        style={i <= currentStep ? { background: status.color } : {}}>
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

            {/* Delivery Info */}
            {orderData?.address && (
              <div className="tracking-info-card">
                <h3 className="tracking-card-title">📍 Delivering To</h3>
                <div className="delivery-addr">
                  <span className="delivery-addr-icon">
                    {orderData.addressType === 'Home' ? '🏠' : orderData.addressType === 'Work' ? '🏢' : '📌'}
                  </span>
                  <div>
                    <p className="delivery-name">{orderData.recipientName}</p>
                    <p className="delivery-addr-text">{orderData.address}</p>
                    {orderData.recipientPhone && <p className="delivery-phone">📞 {orderData.recipientPhone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: OTP + Items ── */}
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
                          ? 'Share this OTP with your delivery rider to confirm receipt'
                          : 'This OTP will be required when your rider arrives'}
                      </p>
                    </div>
                    <div className={`otp-timer-ring ${otpTimer <= 10 ? 'urgent' : ''}`}>
                      <svg viewBox="0 0 36 36">
                        <path className="otp-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="otp-ring-fill"
                          style={{ strokeDasharray: `${(otpTimer / 30) * 100}, 100`, stroke: otpTimer <= 10 ? '#ef4444' : 'var(--primary)' }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className={`otp-timer-num ${otpTimer <= 10 ? 'urgent' : ''}`}>{otpTimer}s</span>
                    </div>
                  </div>

                  <div className={`otp-display ${otpRefreshing ? 'refreshing' : ''} ${isRiderPickedUp ? 'otp-active' : 'otp-waiting'}`}>
                    {otp.split('').map((digit, i) => (
                      <div key={i} className="otp-digit">{digit}</div>
                    ))}
                  </div>

                  <div className="otp-actions">
                    <button className="otp-refresh-btn" onClick={manualRefresh}>
                      🔄 Refresh OTP
                    </button>
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
                  <p>OTP verified successfully. Enjoy your meal!</p>
                  <div className="otp-delivered-checkmark">✓ Delivery Confirmed</div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {orderData?.items && (
              <div className="tracking-info-card">
                <h3 className="tracking-card-title">🍽️ Your Order</h3>
                <div className="tracking-items">
                  {orderData.items.map(item => (
                    <div key={item.id} className="tracking-item">
                      <span className="tracking-item-emoji">{item.emoji}</span>
                      <span className="tracking-item-name">{item.name}</span>
                      <span className="tracking-item-qty">× {item.qty}</span>
                      <span className="tracking-item-price">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="tracking-total">
                  <span>Total Paid</span>
                  <strong>₹{orderData.grandTotal}</strong>
                </div>
              </div>
            )}

            {/* Rider Info (shows when picked up) */}
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

            {/* Delivered success */}
            {isDelivered && (
              <div className="delivered-card">
                <p>🌟 Rate your experience</p>
                <div className="rating-stars">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="star-btn">⭐</button>
                  ))}
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
