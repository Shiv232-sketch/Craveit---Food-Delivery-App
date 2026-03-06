import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import PaymentModal from './PaymentModal';

export default function Cart({ onOrderSuccess }) {
  const { cartItems, removeFromCart, updateQty, totalPrice, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [step, setStep] = useState('cart');
  const [address, setAddress] = useState({ name:'', phone:'', flat:'', area:'', city:'', state:'', pincode:'', type:'Home' });
  const [errors, setErrors] = useState({});

  const taxes = Math.round(totalPrice * 0.05);
  const deliveryFee = totalPrice > 300 ? 0 : 40;
  const grandTotal = totalPrice + taxes + deliveryFee;

  const validateAddress = () => {
    const e = {};
    if (!address.name.trim()) e.name = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!address.flat.trim()) e.flat = 'Flat / House No. is required';
    if (!address.area.trim()) e.area = 'Area / Street is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state.trim()) e.state = 'State is required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToPayment = () => { if (validateAddress()) setStep('payment'); };

  const handlePaymentSuccess = (paymentMethod) => {
    // Create the order in shared OrderContext
    const fullAddress = `${address.flat}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;
    const newOrder = placeOrder({
      customer: address.name,
      phone: address.phone,
      items: cartItems.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, image: i.image, qty: i.qty, price: i.price })),
      address: fullAddress,
      addressType: address.type,
      pricing: { subtotal: totalPrice, taxes, deliveryFee, grandTotal },
      payment: { method: paymentMethod, status: 'paid' },
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
    });

    clearCart();
    setStep('cart');
    setIsCartOpen(false);
    setAddress({ name:'', phone:'', flat:'', area:'', city:'', state:'', pincode:'', type:'Home' });
    onOrderSuccess(newOrder.id);
  };

  const handleClose = () => { setStep('cart'); setIsCartOpen(false); };
  const fullAddress = `${address.flat}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={handleClose} />
      <div className="cart-drawer">

        {/* Step Indicator */}
        {cartItems.length > 0 && (
          <div className="cart-steps">
            {['Cart','Address','Payment'].map((s,i) => {
              const keys = ['cart','address','payment'];
              const cur = keys.indexOf(step);
              return (
                <React.Fragment key={s}>
                  <div className={`cart-step ${cur===i?'active':''} ${cur>i?'done':''}`}>
                    <span className="step-circle">{cur>i?'✓':i+1}</span>
                    <span className="step-name">{s}</span>
                  </div>
                  {i<2 && <div className={`step-conn ${cur>i?'done':''}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* CART */}
        {step === 'cart' && (
          <>
            <div className="cart-header">
              <h2>🛒 Your Cart</h2>
              <button className="cart-close" onClick={handleClose}>✕</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🍽️</div>
                <p>Your cart is empty!</p>
                <span>Add some delicious items from the menu.</span>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <span className="cart-item-emoji">{item.image
                        ? <img src={item.image} alt={item.name} style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} />
                        : item.emoji}</span>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-price">₹{item.price}</p>
                      </div>
                      <div className="cart-qty">
                        <button onClick={() => updateQty(item.id, item.qty-1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty+1)}>+</button>
                      </div>
                      <button className="cart-remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-breakdown">
                    <div className="cart-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
                    <div className="cart-row"><span>Taxes (5%)</span><span>₹{taxes}</span></div>
                    <div className="cart-row">
                      <span>Delivery</span>
                      <span>{deliveryFee===0 ? <span style={{color:'#22c55e',fontWeight:600}}>FREE</span> : `₹${deliveryFee}`}</span>
                    </div>
                    {deliveryFee===0 && <p className="free-delivery-note">🎉 Free delivery on orders above ₹300!</p>}
                  </div>
                  <div className="cart-total"><span>Total</span><strong>₹{grandTotal}</strong></div>
                  <button className="checkout-btn" onClick={() => setStep('address')}>📍 Add Delivery Address</button>
                </div>
              </>
            )}
          </>
        )}

        {/* ADDRESS */}
        {step === 'address' && (
          <>
            <div className="cart-header">
              <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                <button className="back-btn" onClick={() => setStep('cart')}>←</button>
                <h2>📍 Delivery Address</h2>
              </div>
              <button className="cart-close" onClick={handleClose}>✕</button>
            </div>
            <div className="address-form-wrap">
              <div className="addr-type-row">
                {[['Home','🏠'],['Work','🏢'],['Other','📌']].map(([t,icon]) => (
                  <button key={t} className={`addr-type-btn ${address.type===t?'active':''}`} onClick={() => setAddress({...address,type:t})}>{icon} {t}</button>
                ))}
              </div>
              <div className="addr-row-grid">
                <div className="addr-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Your full name" value={address.name} onChange={e=>setAddress({...address,name:e.target.value})} />
                  {errors.name && <span className="addr-err">{errors.name}</span>}
                </div>
                <div className="addr-group">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="10-digit mobile" value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value.replace(/\D/g,'').slice(0,10)})} />
                  {errors.phone && <span className="addr-err">{errors.phone}</span>}
                </div>
              </div>
              <div className="addr-group">
                <label>Flat / House No. / Building *</label>
                <input type="text" placeholder="e.g. Flat 4B, Green Apartments" value={address.flat} onChange={e=>setAddress({...address,flat:e.target.value})} />
                {errors.flat && <span className="addr-err">{errors.flat}</span>}
              </div>
              <div className="addr-group">
                <label>Area / Street / Locality *</label>
                <input type="text" placeholder="e.g. MG Road, Near City Mall" value={address.area} onChange={e=>setAddress({...address,area:e.target.value})} />
                {errors.area && <span className="addr-err">{errors.area}</span>}
              </div>
              <div className="addr-row-grid">
                <div className="addr-group">
                  <label>City *</label>
                  <input type="text" placeholder="e.g. Lucknow" value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} />
                  {errors.city && <span className="addr-err">{errors.city}</span>}
                </div>
                <div className="addr-group">
                  <label>State *</label>
                  <input type="text" placeholder="e.g. Uttar Pradesh" value={address.state} onChange={e=>setAddress({...address,state:e.target.value})} />
                  {errors.state && <span className="addr-err">{errors.state}</span>}
                </div>
              </div>
              <div className="addr-group">
                <label>Pincode *</label>
                <input type="text" placeholder="6-digit pincode" value={address.pincode} onChange={e=>setAddress({...address,pincode:e.target.value.replace(/\D/g,'').slice(0,6)})} />
                {errors.pincode && <span className="addr-err">{errors.pincode}</span>}
              </div>
              {address.flat && address.city && (
                <div className="addr-preview">
                  <span className="addr-preview-icon">{address.type==='Home'?'🏠':address.type==='Work'?'🏢':'📌'}</span>
                  <div>
                    <p className="addr-preview-type">{address.type} • {address.name}</p>
                    <p className="addr-preview-text">{fullAddress}</p>
                    {address.phone && <p className="addr-preview-phone">📞 {address.phone}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="cart-footer">
              <button className="checkout-btn" onClick={handleProceedToPayment}>💳 Proceed to Payment</button>
            </div>
          </>
        )}

        {/* PAYMENT */}
        {step === 'payment' && (
          <PaymentModal
            onClose={() => setStep('address')}
            onSuccess={handlePaymentSuccess}
            deliveryAddress={fullAddress}
            addressType={address.type}
            recipientName={address.name}
            recipientPhone={address.phone}
          />
        )}
      </div>
    </>
  );
}
