import React from 'react';
import {
  Menu,
  Search,
  Notifications,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { IconButton, Badge, Menu as MuiMenu, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

interface AppBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AppBar: React.FC<AppBarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 transition-all duration-500 ease-in-out ${
        isSidebarOpen ? 'left-[280px]' : 'left-[84px]'
      }`}
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <IconButton
            onClick={toggleSidebar}
            className="hover:bg-brand-primaryLight transition-colors"
            sx={{ 
                color: '#1a1a1a',
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: '12px'
            }}
          >
            <Menu />
          </IconButton>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-2.5 w-[400px] group transition-all duration-300 focus-within:w-[450px] focus-within:bg-white focus-within:border-brand-primary focus-within:shadow-lg focus-within:shadow-brand-primary/5">
            <Search className="text-gray-400 mr-3 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search data, reports, settings..."
              className="bg-transparent outline-none flex-1 text-sm text-brand-textPrimary placeholder-gray-400 font-medium"
            />
            <div className="hidden lg:flex items-center px-2 py-1 bg-gray-200/50 rounded-lg text-[10px] font-bold text-gray-400 ml-2">
                CMD + K
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-5">
          {/* Status Badge */}
          <div className="hidden xl:flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-2" />
            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">System Live</span>
          </div>

          {/* Notifications */}
          <IconButton 
            onClick={handleNotifMenu} 
            sx={{ 
                color: '#1f2937',
                backgroundColor: 'rgba(0,0,0,0.02)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
            }}
          >
            <Badge 
              badgeContent={3} 
              sx={{ 
                '& .MuiBadge-badge': { 
                  backgroundColor: '#C62828', 
                  color: 'white',
                  fontWeight: 'black',
                  fontSize: '10px'
                } 
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>

          <MuiMenu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 320,
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                p: 1
              },
            }}
          >
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-black text-brand-accent text-sm uppercase tracking-wider">Notifications</h3>
              <span className="text-[10px] font-bold text-brand-primary">Mark all read</span>
            </div>
            <MenuItem onClick={handleClose} className="py-4 px-4 rounded-2xl hover:bg-brand-primaryLight/30 mt-1">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-brand-primary rounded-full" />
                </div>
                <div>
                    <p className="text-xs font-bold text-brand-textPrimary leading-tight">New inventory received</p>
                    <p className="text-[10px] text-gray-500 mt-1">Stock for "Red T-Shirt" updated +100</p>
                </div>
              </div>
            </MenuItem>
          </MuiMenu>

          {/* User Profile */}
          <div className="flex items-center space-x-4 pl-5 border-l border-gray-100 cursor-pointer group" onClick={handleProfileMenu}>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-brand-textPrimary uppercase tracking-tight">Admin User</p>
              <p className="text-[9px] text-brand-primary font-bold tracking-[0.1em] uppercase mt-0.5">Super Admin</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-300">
              <AccountCircle className="text-brand-primary group-hover:text-white transition-colors" fontSize="medium" />
            </div>
          </div>


          <MuiMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              },
            }}
          >
            <div className="p-4 border-b">
              <p className="font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
            <MenuItem onClick={handleClose} className="py-2">
              <AccountCircle className="mr-2 text-gray-600" fontSize="small" />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} className="py-2 text-red-600">
              <Logout className="mr-2" fontSize="small" />
              Logout
            </MenuItem>
          </MuiMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default AppBar;
