import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/common/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How long does shipping take?",
      answer: "Orders are processed within 1-2 business days. Shipping across India typically takes between 3 to 7 business days depending on your location."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer a hassle-free 15-day return and exchange policy. Items must be unworn, unwashed, and in their original packaging with tags intact. Exchange shipping is completely free!"
    },
    {
      question: "How do I check my order status?",
      answer: "Once your order is shipped, we will send you an email and SMS containing your package tracking link. You can also view details from your checkout summary."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We support secure payments via credit cards, debit cards, UPI (GPay, PhonePe, Paytm), NetBanking, and other major payment gateways in India."
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, we offer Cash on Delivery for most pincodes in India. You can select the COD option during checkout if eligible."
    },
    {
      question: "How do I choose the correct size?",
      answer: "Every product details page contains an accordion panel with size details. We base our sizes on standard Indian silhouette sizing. If you are between sizes, we recommend ordering one size up for a comfortable fit."
    }
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
      <SEO 
        title="Frequently Asked Questions" 
        description="Find answers to common questions about ShivStyle orders, size charts, shipping speeds, refund policies, and payment terms."
        keywords="shivstyle faq, support, shipping support, size support, return policies"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Frequently Asked Questions</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Find quick answers to common queries</p>
      </div>

      <div className="border border-zinc-100 divide-y divide-zinc-100 bg-white">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="transition-all duration-200">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left py-5 px-6 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">{faq.question}</span>
                {isOpen ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-40 border-t border-zinc-50/50 bg-zinc-50/20' : 'max-h-0'
                }`}
              >
                <p className="p-6 text-sm text-zinc-500 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FaqPage;
