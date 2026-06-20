import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-3xl font-black tracking-tighter mb-6 block">
              <span className="text-brand-accent">SHIV</span>STYLE
            </span>
            <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
              Premium quality clothing for the modern individual. Designed with comfort and style in mind. Look legit.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors text-sm">New Arrivals</Link></li>
              <li><Link to="/category/men" className="text-gray-400 hover:text-white transition-colors text-sm">Men's Collection</Link></li>
              <li><Link to="/category/women" className="text-gray-400 hover:text-white transition-colors text-sm">Women's Collection</Link></li>
              <li><Link to="/category/kids" className="text-gray-400 hover:text-white transition-colors text-sm">Kids' Collection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/support/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/support/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQs</Link></li>
              <li><Link to="/support/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">Shipping</Link></li>
              <li><Link to="/support/returns" className="text-gray-400 hover:text-white transition-colors text-sm">Returns</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 md:mb-0">
            © 2026 SHIVSTYLE. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Privacy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
