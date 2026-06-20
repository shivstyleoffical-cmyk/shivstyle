import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Badge, Space, Input, Dropdown, Drawer, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  BlockOutlined,
  ProductOutlined,
  PercentageOutlined,
  NotificationOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

import logo from '../../assets/logo.png';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/" className="font-bold tracking-tight">Dashboard</Link>,
    },
    {
      key: '/categories',
      icon: <BlockOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/categories" className="font-bold tracking-tight">Categories</Link>,
    },
    {
      key: '/products',
      icon: <ProductOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/products" className="font-bold tracking-tight">Products</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/orders" className="font-bold tracking-tight">Orders</Link>,
    },
    {
      key: '/customers',
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/customers" className="font-bold tracking-tight">Customers</Link>,
    },
    {
      key: '/coupons',
      icon: <PercentageOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/coupons" className="font-bold tracking-tight">Coupons</Link>,
    },
    {
      key: '/notifications',
      icon: <NotificationOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/notifications" className="font-bold tracking-tight">Notifications</Link>,
    },
    {
      key: '/locations',
      icon: <EnvironmentOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/locations" className="font-bold tracking-tight">Locations</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined style={{ fontSize: 18 }} />,
      label: <Link to="/settings" className="font-bold tracking-tight">Settings</Link>,
    },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col bg-[#09090b]">
        <div className="flex flex-col items-center justify-center py-12 px-6 border-b border-white/5">
          <div className="flex flex-col items-center transition-all duration-500">
             <div className={`shrink-0 transition-all duration-500 ${(collapsed && !isMobile) ? 'w-12 h-12 mb-0' : 'w-20 h-20 mb-5'} bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-primary/50 shadow-2xl shadow-brand-primary/10`}>
                <img src={logo} alt="ShivStyle Logo" className="w-[85%] h-auto object-contain" />
             </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col items-center text-center">
                <span className="text-white/40 text-[8px] font-black tracking-[0.3em] mb-1.5 uppercase">Premium Management</span>
                <span className="text-white text-2xl font-black tracking-tighter leading-none italic uppercase">SHIVSTYLE</span>
                <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mt-3">Admin Console</span>
                <div className="flex items-center mt-3 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                   <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">Dashboard</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2 px-3 overflow-y-auto custom-sider-menu flex-1">
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={() => isMobile && setMobileVisible(false)}
                style={{ background: 'transparent', border: 'none' }}
                className="premium-menu pt-4"
            />
        </div>
        
        <div className="p-6">
            <div className={`bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-md transition-all duration-500 overflow-hidden ${(collapsed && !isMobile) ? 'flex justify-center' : 'flex items-center space-x-4'}`}>
              <Avatar 
                size={(collapsed && !isMobile) ? 40 : 44} 
                className="bg-brand-primary border border-white/10 shrink-0"
                icon={<UserOutlined />}
              />
              {(!collapsed || isMobile) && (
                <div className="flex flex-col min-w-0">
                    <p className="text-white text-[11px] font-black truncate uppercase tracking-widest leading-none mb-1">Admin User</p>
                    <p className="text-gray-500 text-[9px] truncate font-bold uppercase tracking-tight">Platform Master</p>
                </div>
              )}
            </div>
        </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile ? (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={280}
          collapsedWidth={80}
          theme="dark"
          style={{
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: '#09090b',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            zIndex: 1000,
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {SidebarContent}
        </Sider>
      ) : (
        <Drawer
          placement="left"
          onClose={() => setMobileVisible(false)}
          open={mobileVisible}
          size={280}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
            wrapper: { boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }
          }}
        >
          {SidebarContent}
        </Drawer>
      )}
      
      <Layout 
        style={{ 
            marginLeft: (isMobile) ? 0 : (collapsed ? 80 : 280), 
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '100vh',
            background: '#f8f9fb'
        }}
      >
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 32px',
            height: 72,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            width: '100%',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-center space-x-3 sm:space-x-6 flex-1">
            <Button
              type="text"
              icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => isMobile ? setMobileVisible(true) : setCollapsed(!collapsed)}
              style={{
                width: 40,
                height: 40,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: '10px'
              }}
            />
            
            <div className="max-w-[400px] w-full hidden md:block">
                <Input
                  placeholder="Universal search..."
                  prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 16 }} />}
                  style={{ 
                    borderRadius: 12, 
                    padding: '8px 16px',
                    background: '#f8f9fb', 
                    border: '1px solid #eee',
                    fontSize: '14px'
                  }}
                />
            </div>
          </div>
          
          <Space size={isMobile ? 8 : 24}>
            <Badge count={3} size="small" offset={[-2, 6]}>
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: 20, color: '#1a1a1a' }} />} 
                style={{ 
                    width: 40, 
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '10px'
                }}
              />
            </Badge>
            
            <Dropdown
              menu={{
                items: [
                  { key: '1', icon: <UserOutlined />, label: 'Profile Settings' },
                  { key: '2', icon: <SettingOutlined />, label: 'System Preferences' },
                  { type: 'divider' },
                  { key: '3', icon: <LogoutOutlined />, label: 'Sign Out', onClick: handleLogout },
                ],
              }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 sm:space-x-5 cursor-pointer hover:bg-black/5 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 border border-transparent hover:border-black/5">
                {!isMobile && (
                  <div className="text-right hidden md:flex flex-col justify-center mr-1">
                    <p className="text-[13px] font-black leading-none mb-1.5 text-gray-900 tracking-tight">ADMIN USER</p>
                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.15em] leading-none opacity-90">Super Admin</p>
                  </div>
                )}
                <Avatar 
                  size={isMobile ? 36 : 44} 
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                  }}
                  icon={<UserOutlined />}
                  className="shrink-0"
                />
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        <Content
          style={{
            margin: isMobile ? '16px 12px' : '40px 24px',
            padding: 0,
            minHeight: 'calc(100vh - 150px)',
          }}
        >
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </Content>

        <footer className="py-10 text-center px-4">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                ShivStyle Console © 2026 Integrated Neural Network
            </p>
        </footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
