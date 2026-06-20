import React, { useState } from 'react';
import { Mail, Phone, Clock } from 'lucide-react';
import SEO from '../components/common/SEO';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
      alert('Thank you for contacting us! We will get back to you shortly.');
    }, 1000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title="Contact Us" 
        description="Get in touch with the ShivStyle support team. Call +91 7001916432 or email shivstyleoffical@gmail.com for help with orders, sizing, shipping, or returns."
        keywords="contact shivstyle, shivstyle phone number, shivstyle email, shivstyle customer support"
      />
      <div className="text-center mb-16">
        <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-950 mb-3">Contact Us</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Get in touch with the ShivStyle team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-950">Reach Out</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Have questions about your order, sizing, or general inquiries? Drop us a line or give us a call. Our customer support team is ready to help you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                <Phone size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</h4>
                <a href="tel:+917001916432" className="text-sm font-bold text-zinc-800 hover:text-brand-accent transition-colors">+91 7001916432</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</h4>
                <a href="mailto:shivstyleoffical@gmail.com" className="text-sm font-bold text-zinc-800 hover:text-brand-accent transition-colors">shivstyleoffical@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Support Hours</h4>
                <p className="text-sm font-bold text-zinc-800">Monday - Saturday / 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="border border-zinc-100 p-8 md:p-10 bg-zinc-50/30">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-6">Send Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-black rounded-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-black rounded-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-black rounded-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-zinc-200 px-4 py-3 text-xs text-zinc-800 focus:outline-none focus:border-black rounded-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black hover:bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-widest py-3.5 transition-colors rounded-none"
            >
              {submitted ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
