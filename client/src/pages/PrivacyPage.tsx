import React from 'react';
import SEO from '../components/common/SEO';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <SEO 
        title="Privacy Policy" 
        description="Learn how ShivStyle collects, stores, and protects your personal data, secure payment gateways details, and customer shipping information."
        keywords="shivstyle privacy policy, data protection, secure checkout, payment security"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Privacy Policy</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Your privacy is extremely important to us</p>
      </div>

      <div className="space-y-10 text-sm text-zinc-600 leading-relaxed font-medium">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">1. Information We Collect</h2>
          <p>
            We collect personal information when you check out, sign up for announcements, or contact customer service. This includes name, billing/shipping address, email address, phone number, and transaction details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">2. How We Use Your Data</h2>
          <p>
            Your information is used strictly to process orders, manage deliveries, notify you about changes, provide customer support, and send you occasional discount offers (if consented to).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">3. Secure Payments</h2>
          <p>
            We do not store credit/debit card numbers or payment credentials on our servers. All online transactions are handled securely via third-party certified gateways (like Razorpay) using encrypted secure sockets layer (SSL) technology.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950">4. Sharing Information</h2>
          <p>
            We do not sell or rent your personal information to third parties. We only share essential shipping data with our courier partners (e.g. Bluedart, Delhivery) to facilitate order delivery.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
