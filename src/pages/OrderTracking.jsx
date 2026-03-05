import React, { useState, useEffect } from 'react';

const STATUSES = [
  { key: 'placed',    label: 'Order Placed',        icon: '📋', desc: 'We have received your order!' },
  { key: 'confirmed', label: 'Order Confirmed',      icon: '✅', desc: 'Restaurant confirmed your order.' },
  { key: 'preparing', label: 'Preparing Your Food',  icon: '👨‍🍳', desc: 'Our chefs are cooking your meal.' },
  { key: 'delivery',  label: 'Out for Delivery',     icon: '🛵', desc: 'Your food is on the way!' },
  { key: 'delivered', label: 'Delivered!',            icon: '🎉', desc: 'Enjoy your meal. Bon appétit!' },
];

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demo, setDemo] = useState(false);

  // Demo: auto-advance through steps
  useEffect(() => {
    if (!demo) return;
    if (currentStep >= STATUSES.length - 1) return;
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 2000);
    return () => clearTimeout(timer);
  }, [demo, currentStep]);

  const handleTrack = () => {
    if (!orderId.trim()) return;
    setCurrentStep(0);
    setTracking(true);
    setDemo(true);
  };

  const handleDemo = () => {
    setOrderId('CRAVEIT-2026-DEMO');
    setCurrentStep(0);
    setTracking(true);
    setDemo(true);
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h2>📦 Track Your Order</h2>
          <p>Enter your Order ID to see the live status</p>
        </div>

        <div className="tracking-box">
          <div className="tracking-input-row">
            <input
              type="text"
              placeholder="Enter your Order ID (e.g. CRAVEIT-2026-XXXX)"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
            />
            <button className="btn-primary" onClick={handleTrack}>Track</button>
          </div>
          <button className="demo-btn" onClick={handleDemo}>
            🎮 Try Demo Tracking
          </button>
        </div>

        {tracking && (
          <div className="tracking-timeline">
            <div className="tracking-order-id">
              Order ID: <strong>{orderId}</strong>
            </div>
            <div className="timeline">
              {STATUSES.map((status, i) => (
                <div key={status.key} className={`timeline-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                  <div className="timeline-icon">{i <= currentStep ? status.icon : '○'}</div>
                  <div className="timeline-info">
                    <p className="timeline-label">{status.label}</p>
                    {i === currentStep && <p className="timeline-desc">{status.desc}</p>}
                  </div>
                  {i < STATUSES.length - 1 && (
                    <div className={`timeline-line ${i < currentStep ? 'done' : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {currentStep === STATUSES.length - 1 && (
              <div className="delivered-banner">
                🎉 Your order has been delivered! We hope you enjoyed it!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
