import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, Calendar } from 'lucide-react';
import SEO from '../components/common/SEO';

const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ORD-UNKNOWN';
  const method = searchParams.get('method') || 'cod';
  const isMock = searchParams.get('mock') === 'true';

  const estDeliveryDate = new Date();
  estDeliveryDate.setDate(estDeliveryDate.getDate() + 5);
  const formattedDelivery = estDeliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Order Success" 
        description="Your order was placed successfully."
        noindex={true}
      />
      <div className="max-w-md w-full bg-white p-8 border border-gray-100 rounded-sm shadow-sm text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <CheckCircle size={32} strokeWidth={1.5} />
        </div>

        <h1 className="text-xl font-bold uppercase tracking-widest text-black mb-2">
          Order Confirmed
        </h1>
        <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-bold">
          Thank you for shopping with ShivStyle
        </p>

        {/* Details Card */}
        <div className="border border-gray-100 rounded-sm p-4 bg-gray-50 text-left space-y-4 mb-8">
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Order Number</span>
            <span className="font-extrabold text-black uppercase tracking-wider">{orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Payment Mode</span>
            <span className="font-extrabold text-black uppercase tracking-wider">
              {method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid (Online)'}
            </span>
          </div>

          {isMock && (
            <div className="bg-brand-accent/10 border border-brand-accent/25 px-2.5 py-1.5 text-[9px] font-bold text-brand-accent text-center uppercase tracking-widest rounded-sm">
              Sandbox Dummy Payment Verified
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <Calendar size={14} className="text-gray-400" />
              <span className="font-bold text-gray-600">Estimated Delivery</span>
            </div>
            <p className="text-[11px] font-bold text-black pl-6">
              {formattedDelivery}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <Truck size={14} className="text-gray-400" />
              <span className="font-bold text-gray-600">Shipping Partner</span>
            </div>
            <p className="text-[11px] font-bold text-black pl-6 uppercase tracking-wider">
              Shiprocket Delivery
            </p>
          </div>

        </div>

        <p className="text-[10px] text-gray-400 mb-8 leading-relaxed">
          A confirmation SMS/Email containing your tracking code and receipt will be dispatched shortly.
        </p>

        {/* CTAs */}
        <div className="grid gap-2">
          <Link 
            to="/products"
            className="w-full bg-black text-white hover:bg-brand-accent transition-all text-xs font-bold uppercase tracking-widest py-4 text-center block"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/"
            className="w-full bg-transparent hover:bg-gray-100 text-black border border-black/10 transition-all text-[10px] font-bold uppercase tracking-widest py-3 text-center block"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
