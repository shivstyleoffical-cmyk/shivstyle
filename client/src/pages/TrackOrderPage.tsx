import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, CheckCircle, Truck, Clock, XCircle, ChevronDown, ChevronUp, ArrowLeft, ExternalLink } from 'lucide-react';
import api from '../services/api';

interface OrderItem {
  id: string;
  product_name: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  total_amount: number;
  product?: { image_url?: string };
}

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone: string;
}

interface TrackedOrder {
  order_number: string;
  status: string;
  payment_status: string;
  payment_type?: string;
  total_amount: number;
  shipping_amount: number;
  discount_amount?: number;
  net_amount: number;
  coupon_code?: string;
  delivery_partner?: string;
  tracking_number?: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress?: ShippingAddress;
  customer: { email?: string; phone?: string };
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  placed:    { label: 'Order Placed', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: <Clock size={13} /> },
  confirmed: { label: 'Confirmed',    bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', icon: <CheckCircle size={13} /> },
  shipped:   { label: 'Shipped',      bg: '#fffbeb', text: '#b45309', border: '#fde68a', icon: <Truck size={13} /> },
  delivered: { label: 'Delivered',    bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', icon: <CheckCircle size={13} /> },
  cancelled: { label: 'Cancelled',    bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', icon: <XCircle size={13} /> },
};

const PAYMENT_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  paid:     { label: 'Paid',     bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  not_paid: { label: 'Unpaid',   bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  cod:      { label: 'COD',      bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  refunded: { label: 'Refunded', bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
};

const fmt = (n: number) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  padding: '24px 28px',
};

const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [itemsOpen, setItemsOpen] = useState(true);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !identifier.trim()) { setError('Please fill in both fields.'); return; }
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await api.post('/orders/track', {
        order_number: orderNumber.trim().toUpperCase(),
        identifier: identifier.trim(),
      });
      setOrder(res.data.order);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Order not found. Please check your order number and email / phone.'
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setOrder(null); setError(''); setOrderNumber(''); setIdentifier(''); };

  const sMap = order ? (STATUS_MAP[order.status]  ?? STATUS_MAP['placed'])    : null;
  const pMap = order ? (PAYMENT_MAP[order.payment_status] ?? PAYMENT_MAP['not_paid']) : null;
  const dated = order ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      {/* Header */}
      <div style={{ background: '#000', color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>Track My Order</h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, margin: 0, maxWidth: 420 }}>
            Enter your order number and the email or phone used at checkout to instantly view your order status.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Form ── */}
        {!order && (
          <div style={{ ...card, padding: '36px 32px', marginBottom: 32 }}>
            <form onSubmit={handleTrack}>
              {[
                { label: 'Order Number', value: orderNumber, set: setOrderNumber, ph: 'e.g. ORD-1783089027866-726' },
                { label: 'Email or Phone Number', value: identifier, set: setIdentifier, ph: 'Email or phone used at checkout' },
              ].map(({ label, value, set, ph }) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>{label}</label>
                  <input
                    type="text" value={value} placeholder={ph} autoComplete="off" spellCheck={false}
                    onChange={(e) => set(e.target.value)}
                    style={{ width: '100%', border: '1px solid #e5e7eb', padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', borderRadius: 0 }}
                  />
                </div>
              ))}

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                  <XCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '15px 24px', fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
                {loading
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Searching...</>
                  : <><Search size={14} />Track Order</>}
              </button>

              <p style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', fontWeight: 500, marginTop: 16, marginBottom: 0 }}>
                Your order number is in the confirmation SMS or email received after placing the order.
              </p>
            </form>
          </div>
        )}

        {/* ── Result ── */}
        {order && sMap && pMap && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status card */}
            <div style={card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Order Number</p>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111', letterSpacing: '0.04em' }}>{order.order_number}</h2>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Placed on {dated}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { bg: sMap.bg, text: sMap.text, border: sMap.border, icon: sMap.icon, lbl: sMap.label },
                    { bg: pMap.bg, text: pMap.text, border: pMap.border, icon: null,      lbl: pMap.label },
                  ].map(({ bg, text, border, icon, lbl }) => (
                    <span key={lbl} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 6, border: `1px solid ${border}`, background: bg, color: text }}>
                      {icon}{lbl}
                    </span>
                  ))}
                </div>
              </div>

              {/* AWB */}
              {order.tracking_number && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>AWB / Tracking Number</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, fontFamily: 'monospace', color: '#111' }}>{order.tracking_number}</p>
                    {order.delivery_partner && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280', fontWeight: 500 }}>via {order.delivery_partner}</p>}
                  </div>
                  <a href={`https://shiprocket.co/tracking/${order.tracking_number}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#000', color: '#fff', padding: '10px 18px', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    <Truck size={13} />Track Shipment<ExternalLink size={11} />
                  </a>
                </div>
              )}

              {/* Masked customer */}
              {(order.customer?.email || order.customer?.phone) && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                  {order.customer.email && <span>Email: <strong style={{ color: '#111' }}>{order.customer.email}</strong></span>}
                  {order.customer.phone && <span>Phone: <strong style={{ color: '#111' }}>{order.customer.phone}</strong></span>}
                </div>
              )}
            </div>

            {/* Items accordion */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <button onClick={() => setItemsOpen(p => !p)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={15} color="#9ca3af" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>Items Ordered</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: 4 }}>
                    {order.orderItems?.length} {order.orderItems?.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                {itemsOpen ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
              </button>

              {itemsOpen && (
                <div style={{ padding: '0 24px', borderTop: '1px solid #f3f4f6' }}>
                  {order.orderItems?.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: idx < order.orderItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ width: 58, height: 58, background: '#f9f9f9', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.product?.image_url ? <img src={item.product.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="#d1d5db" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          {item.size  && <span style={{ fontSize: 10, fontWeight: 700, background: '#f9f9f9', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 3 }}>Size: {item.size}</span>}
                          {item.color && <span style={{ fontSize: 10, fontWeight: 700, background: '#f9f9f9', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 3 }}>Color: {item.color}</span>}
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 11, fontWeight: 500, color: '#6b7280' }}>Qty: {item.quantity} × {fmt(item.price)}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#111', flexShrink: 0 }}>{fmt(item.total_amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment + Shipping grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

              <div style={card}>
                <p style={{ margin: '0 0 18px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af' }}>Payment Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                    <span>Subtotal</span><strong style={{ color: '#111' }}>{fmt(order.total_amount)}</strong>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', fontWeight: 700 }}>
                      <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                      <span>- {fmt(order.discount_amount!)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                    <span>Shipping</span><strong style={{ color: '#111' }}>{fmt(order.shipping_amount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: '#111', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                    <span>Total</span><span>{fmt(order.net_amount)}</span>
                  </div>
                  {order.payment_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                      <span>Payment</span>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: 4 }}>
                        {order.payment_type === 'cod' ? 'Cash on Delivery' : order.payment_type.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {order.shippingAddress && (
                <div style={card}>
                  <p style={{ margin: '0 0 18px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af' }}>Shipping Address</p>
                  <div style={{ fontSize: 13, color: '#4b5563', fontWeight: 500, lineHeight: 1.8 }}>
                    <strong style={{ color: '#111', display: 'block' }}>{order.shippingAddress.full_name}</strong>
                    {order.shippingAddress.address_line1}<br />
                    {order.shippingAddress.address_line2 && <>{order.shippingAddress.address_line2}<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} — <strong style={{ color: '#111', fontFamily: 'monospace' }}>{order.shippingAddress.postal_code}</strong><br />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>{order.shippingAddress.country || 'India'}</span>
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#6b7280' }}>
                    <span>Contact</span>
                    <strong style={{ color: '#111', fontFamily: 'monospace', fontSize: 12 }}>{order.shippingAddress.phone}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button onClick={reset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: '2px solid #111', background: 'transparent', color: '#111', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                <ArrowLeft size={13} />Track Another Order
              </button>
              <Link to="/products"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#111', color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>

          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default TrackOrderPage;

