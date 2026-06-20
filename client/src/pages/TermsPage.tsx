import React from 'react';
import SEO from '../components/common/SEO';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <SEO 
        title="Terms & Conditions" 
        description="Review the terms and conditions for shopping at ShivStyle. Acceptance of terms, product pricing rules, ordering guidelines, and liability boundaries."
        keywords="shivstyle terms, user agreement, shopping guidelines, cancellation terms"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Terms & Conditions</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Guidelines for shopping on the ShivStyle store</p>
      </div>

      <div className="space-y-10 text-sm text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">1. Acceptance of Terms</h2>
          <p>
            By accessing and ordering products on this website, you agree to comply with and be bound by these Terms & Conditions. Please read them carefully before placing an order.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">2. Products & Pricing</h2>
          <p>
            We strive to provide accurate product names, descriptions, images, and pricing. However, typographical errors or sizing differences may occur. We reserve the right to correct any errors and cancel orders if needed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">3. Orders & Cancellations</h2>
          <p>
            We reserve the right to refuse or cancel any order. If your order is cancelled after your payment is processed, we will issue a full refund to your original payment account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">4. Limitation of Liability</h2>
          <p>
            ShivStyle shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the products purchased from our store.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
