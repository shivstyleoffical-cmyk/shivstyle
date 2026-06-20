import React from 'react';
import SEO from '../components/common/SEO';

const ShippingPage: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <SEO 
        title="Shipping Policy" 
        description="Learn about ShivStyle's shipping rates, processing times, free shipping offers over ₹999, and standard transit times within India."
        keywords="shivstyle shipping, free shipping, delivery tracking, delivery time"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Shipping Policy</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">How we deliver premium streetwear to your doorstep</p>
      </div>

      <div className="space-y-10 text-sm text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">1. Processing Times</h2>
          <p>
            All orders are processed and prepared for shipping within 1 to 2 business days. Orders are not shipped or delivered on Sundays or national holidays.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">2. Shipping Rates & Free Shipping</h2>
          <p>
            We offer **FREE SHIPPING** on all prepaid and COD orders over ₹999 across India. For orders below ₹999, a flat shipping fee of ₹99 is applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">3. Delivery Estimates</h2>
          <p>
            Standard shipping times typically take **3 to 7 business days** to arrive depending on your city:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1.5">
            <li>**Metro Cities:** 2 to 4 business days</li>
            <li>**Tier-2 / Tier-3 Cities:** 4 to 6 business days</li>
            <li>**Remote Regions / North East:** 6 to 9 business days</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">4. Shipment Confirmation & Tracking</h2>
          <p>
            You will receive a shipment confirmation email and SMS containing your tracking number(s) once your order has been dispatched. The tracking number will be active within 24 hours.
          </p>
        </section>

        <section className="space-y-3 font-bold border-t border-zinc-100 pt-8">
          <p className="text-zinc-500 text-xs">
            For urgent deliveries or special requests, please contact our support team at <a href="mailto:shivstyleoffical@gmail.com" className="text-zinc-800 underline">shivstyleoffical@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPage;
