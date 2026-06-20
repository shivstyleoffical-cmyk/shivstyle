import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Category,
  Inventory,
  ShoppingCart,
  People,
  LocalOffer,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { path: '/', icon: Dashboard, label: 'Dashboard' },
  { path: '/categories', icon: Category, label: 'Categories' },
  { path: '/products', icon: Inventory, label: 'Products' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/customers', icon: People, label: 'Customers' },
  { path: '/coupons', icon: LocalOffer, label: 'Coupons' },
  { path: '/notifications', icon: Notifications, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '280px' : '84px',
          x: 0,
        }}
        className={`fixed left-0 top-0 h-screen bg-[#0a0a0a] text-white z-50 transition-all duration-500 ease-in-out shadow-2xl border-r border-white/5 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-24 px-6 mb-4">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3 transform hover:rotate-0 transition-all duration-300 cursor-pointer">
                  <span className="text-2xl font-black text-white">E</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight leading-none">E-COM</span>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mt-1">Admin Panel</span>
                </div>
              </motion.div>
            )}
            {!isOpen && (
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto"
               >
                 <span className="text-xl font-black text-white">E</span>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 px-4 h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`flex items-center justify-center ${isOpen ? 'mr-4' : 'mx-auto'}`}>
                    <Icon sx={{ fontSize: 24 }} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-primaryLight'} />
                </div>
                
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-bold text-sm tracking-wide"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isActive && !isOpen && (
                    <motion.div 
                        layoutId="active-indicator"
                        className="absolute right-[-16px] w-1 h-8 bg-brand-primary rounded-l-full" 
                    />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-6 left-4 right-4 group">
          <div className={`flex items-center p-4 rounded-3xl bg-white/5 border border-white/5 transition-all duration-300 ${isOpen ? 'justify-start' : 'justify-center border-none bg-transparent hover:bg-white/5'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl flex items-center justify-center border border-white/10 shadow-lg shrink-0">
              <span className="text-xs font-black text-white">AD</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-4 overflow-hidden"
                >
                  <p className="text-xs font-black truncate text-white uppercase tracking-wider">Admin User</p>
                  <p className="text-[10px] text-gray-500 truncate font-bold mt-0.5">admin@example.com</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
