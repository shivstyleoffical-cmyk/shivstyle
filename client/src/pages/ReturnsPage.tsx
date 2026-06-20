import React from 'react';
import SEO from '../components/common/SEO';

const ReturnsPage: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <SEO 
        title="Returns & Exchanges Policy" 
        description="Learn about ShivStyle's hassle-free 15-day return and exchange policy. Free exchanges, quality inspection parameters, and quick refund timelines."
        keywords="shivstyle returns, return policy, free exchanges, refund money"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Returns & Exchanges</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Hassle-free 15-day return and exchange policy</p>
      </div>

      <div className="space-y-10 text-sm text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">1. Return Window</h2>
          <p>
            We offer a **15-day return and exchange policy**. This means you have 15 days after receiving your item to request a return or exchange.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">2. Eligibility & Product Condition</h2>
          <p>
            To be eligible for a return or exchange, your item must be:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1.5">
            <li>Unworn, unwashed, and in the same condition that you received it</li>
            <li>In its original packaging</li>
            <li>With all brand tags, labels, and hygiene seals intact</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">3. Exchange Process (Free!)</h2>
          <p>
            Want to switch to a different size or color? Exchanges are **completely free**! We will arrange a reverse pickup from your address and ship the new size once the original item passes quality checks at our warehouse.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">4. How to Initiate a Return</h2>
          <p>
            To initiate a return or exchange, please send an email to <a href="mailto:shivstyleoffical@gmail.com" className="text-zinc-800 underline font-bold">shivstyleoffical@gmail.com</a> with:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 pt-1.5">
            <li>Your Order Number (e.g. #SS-1002)</li>
            <li>The item(s) you wish to return/exchange</li>
            <li>The reason for the request (or the new size required)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">5. Refunds</h2>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds are processed within 5-7 business days to your original payment method, or as store credit for COD orders.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnsPage;
