import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Bank','Punjab National Bank'];

export default function PaymentModal({ onClose, onSuccess, deliveryAddress, addressType, recipientName, recipientPhone }) {
  const { totalPrice, cartItems } = useCart();
  const [method, setMethod] = useState('card');
  const [step, setStep] = useState('form'); // form | processing | success | failed
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [upi, setUpi] = useState('');
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('');
  const [errors, setErrors] = useState({});

  const taxes = Math.round(totalPrice * 0.05);
  const deliveryFee = totalPrice > 300 ? 0 : 40;
  const grandTotal = totalPrice + taxes + deliveryFee;

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 2 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  const validate = () => {
    const e = {};
    if (method === 'card') {
      if (card.number.replace(/\s/g,'').length < 16) e.number = 'Enter a valid 16-digit card number';
      if (!card.name.trim()) e.name = 'Enter cardholder name';
      if (card.expiry.length < 5) e.expiry = 'Enter valid expiry (MM/YY)';
      if (card.cvv.length < 3) e.cvv = 'Enter valid CVV';
    }
    if (method === 'upi' && !upi.includes('@')) e.upi = 'Enter a valid UPI ID (e.g. name@upi)';
    if (method === 'netbanking' && !bank) e.bank = 'Please select a bank';
    if (method === 'wallet' && !wallet) e.wallet = 'Please select a wallet';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => setStep(Math.random() > 0.15 ? 'success' : 'failed'), 2500);
  };

  const orderId = 'CRAVEIT-' + Date.now().toString().slice(-6);
  const addrIcon = addressType === 'Home' ? '🏠' : addressType === 'Work' ? '🏢' : '📌';

  if (step === 'processing') return (
    <div className="pay-inline">
      <div className="pay-header">
        <span className="pay-logo">🔥 CraveIt</span>
        <span className="pay-secure">🔒 Secure Checkout</span>
      </div>
      <div className="processing-modal">
        <div className="spinner" />
        <p className="processing-text">Processing Payment...</p>
        <p className="processing-sub">Please do not close this window</p>
        <div className="processing-amount">₹{grandTotal}</div>
      </div>
    </div>
  );

  if (step === 'success') return (
    <div className="pay-inline">
      <div className="pay-header">
        <span className="pay-logo">🔥 CraveIt</span>
      </div>
      <div className="success-modal">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p className="success-amount">₹{grandTotal} paid</p>
        <div className="success-details">
          <div className="success-row"><span>Order ID</span><strong>{orderId}</strong></div>
          <div className="success-row"><span>Method</span><strong>{method === 'card' ? '💳 Card' : method === 'upi' ? '📱 UPI' : method === 'netbanking' ? '🏦 Net Banking' : '👛 Wallet'}</strong></div>
          <div className="success-row"><span>Status</span><strong className="status-success">✓ Confirmed</strong></div>
          <div className="success-row addr-row-success">
            <span>Delivering to</span>
            <strong>{addrIcon} {deliveryAddress}</strong>
          </div>
        </div>
        <p className="success-msg">Your food is being prepared! Track your order status below.</p>
        <button className="btn-pay success-btn" onClick={onSuccess}>🚀 Track My Order</button>
      </div>
    </div>
  );

  if (step === 'failed') return (
    <div className="pay-inline">
      <div className="pay-header">
        <span className="pay-logo">🔥 CraveIt</span>
      </div>
      <div className="failed-modal">
        <div className="failed-icon">✕</div>
        <h2>Payment Failed</h2>
        <p className="failed-msg">Your transaction could not be processed. Please try again.</p>
        <div className="failed-actions">
          <button className="btn-pay" onClick={() => setStep('form')}>🔄 Try Again</button>
          <button className="btn-secondary-pay" onClick={onClose}>← Change Address</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pay-inline">
      {/* Header */}
      <div className="pay-header">
        <div className="pay-brand">
          <button className="back-btn" onClick={onClose}>←</button>
          <span className="pay-logo">🔥 CraveIt</span>
          <span className="pay-secure">🔒 Secure Checkout</span>
        </div>
      </div>

      <div className="pay-inline-body">
        {/* Delivery Address Banner */}
        <div className="pay-addr-banner">
          <span className="pay-addr-icon">{addrIcon}</span>
          <div className="pay-addr-info">
            <p className="pay-addr-label">Delivering to <strong>{addressType}</strong> — {recipientName}</p>
            <p className="pay-addr-text">{deliveryAddress}</p>
            {recipientPhone && <p className="pay-addr-phone">📞 {recipientPhone}</p>}
          </div>
          <button className="pay-addr-change" onClick={onClose}>Change</button>
        </div>

        {/* Order Summary */}
        <div className="pay-summary-inline">
          <div className="pay-items">
            {cartItems.map(item => (
              <div key={item.id} className="pay-item">
                <span className="pay-item-emoji">{item.emoji}</span>
                <span className="pay-item-name">{item.name} × {item.qty}</span>
                <span className="pay-item-price">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="pay-breakdown">
            <div className="pay-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            <div className="pay-row"><span>Taxes (5%)</span><span>₹{taxes}</span></div>
            <div className="pay-row"><span>Delivery</span><span>{deliveryFee === 0 ? <span className="free">FREE</span> : `₹${deliveryFee}`}</span></div>
            <div className="pay-row total-row"><span>Total</span><strong>₹{grandTotal}</strong></div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="pay-section-label">Choose Payment Method</div>
        <div className="pay-methods">
          {[{key:'card',icon:'💳',label:'Card'},{key:'upi',icon:'📱',label:'UPI'},{key:'netbanking',icon:'🏦',label:'Net Banking'},{key:'wallet',icon:'👛',label:'Wallet'}].map(m => (
            <button key={m.key} className={`method-tab ${method === m.key ? 'active' : ''}`}
              onClick={() => { setMethod(m.key); setErrors({}); }}>
              <span>{m.icon}</span><span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        {method === 'card' && (
          <div className="pay-inputs">
            <div className="card-visual">
              <div className="card-chip">▣</div>
              <div className="card-num-display">{card.number || '•••• •••• •••• ••••'}</div>
              <div className="card-info-display">
                <span>{card.name || 'YOUR NAME'}</span>
                <span>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="1234 5678 9012 3456" value={card.number}
                onChange={e => setCard({...card, number: formatCard(e.target.value)})} />
              {errors.number && <span className="err">{errors.number}</span>}
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input type="text" placeholder="Name on card" value={card.name}
                onChange={e => setCard({...card, name: e.target.value})} />
              {errors.name && <span className="err">{errors.name}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry</label>
                <input type="text" placeholder="MM/YY" value={card.expiry}
                  onChange={e => setCard({...card, expiry: formatExpiry(e.target.value)})} />
                {errors.expiry && <span className="err">{errors.expiry}</span>}
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" placeholder="•••" maxLength={4} value={card.cvv}
                  onChange={e => setCard({...card, cvv: e.target.value.replace(/\D/g,'').slice(0,4)})} />
                {errors.cvv && <span className="err">{errors.cvv}</span>}
              </div>
            </div>
          </div>
        )}

        {/* UPI */}
        {method === 'upi' && (
          <div className="pay-inputs">
            <div className="upi-apps">
              {[{name:'GPay',color:'#4285F4',icon:'G'},{name:'PhonePe',color:'#5f259f',icon:'P'},{name:'Paytm',color:'#00BAF2',icon:'₹'},{name:'BHIM',color:'#FF6600',icon:'B'}].map(app => (
                <button key={app.name}
                  className={`upi-app-btn ${upi === `demo@${app.name.toLowerCase()}` ? 'selected' : ''}`}
                  style={{'--app-color': app.color}}
                  onClick={() => setUpi(`demo@${app.name.toLowerCase()}`)}>
                  <span className="upi-icon" style={{background: app.color}}>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
            <div className="form-group">
              <label>Or Enter UPI ID</label>
              <input type="text" placeholder="yourname@upi" value={upi}
                onChange={e => setUpi(e.target.value)} />
              {errors.upi && <span className="err">{errors.upi}</span>}
            </div>
            <p className="upi-note">💡 Tip: Use any@upi for demo</p>
          </div>
        )}

        {/* Net Banking */}
        {method === 'netbanking' && (
          <div className="pay-inputs">
            <div className="form-group">
              <label>Select Your Bank</label>
              <select value={bank} onChange={e => setBank(e.target.value)}>
                <option value="">-- Select Bank --</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.bank && <span className="err">{errors.bank}</span>}
            </div>
            {bank && (
              <div className="bank-selected">
                <span>🏦 {bank}</span>
                <span className="bank-note">You'll be redirected to your bank's portal</span>
              </div>
            )}
          </div>
        )}

        {/* Wallet */}
        {method === 'wallet' && (
          <div className="pay-inputs">
            <div className="wallet-options">
              {['Paytm Wallet','Amazon Pay','Freecharge','Mobikwik'].map(w => (
                <button key={w} className={`wallet-btn ${wallet === w ? 'selected' : ''}`}
                  onClick={() => setWallet(w)}>👛 {w}</button>
              ))}
            </div>
            {errors.wallet && <span className="err">{errors.wallet}</span>}
          </div>
        )}

        <button className="btn-pay" onClick={handlePay}>
          🔒 Pay ₹{grandTotal}
        </button>
        <p className="pay-note">🔐 256-bit SSL encrypted. Your data is safe.</p>
      </div>
    </div>
  );
}
