import React, { useEffect, useState } from 'react';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DatabaseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

import { Row, Col, Card, Statistic, Button, Empty } from 'antd';

interface StatCardProps {
  title: string;
  value: string | number;
  growth: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, growth, icon }) => {
  return (
    <Card 
      variant="borderless" 
      className="card-hover"
      style={{ 
        borderRadius: 24, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        height: '100%'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <Statistic
            title={<span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{title}</span>}
            value={value}
            valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 900, 
                color: '#1a1a1a',
                letterSpacing: '-0.02em'
            }}
          />
          <div className="mt-2 flex items-center">
            <span className={`flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide ${growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {growth >= 0 ? <ArrowUpOutlined className="mr-1" /> : <ArrowDownOutlined className="mr-1" />}
              {Math.abs(growth)}%
            </span>
            <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-wide">Since last month</span>
          </div>
        </div>
        <div className="w-14 h-14 bg-brand-primaryLight/50 rounded-2xl flex items-center justify-center text-brand-primary text-2xl">
          {icon}
        </div>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const stats = await dashboardService.getStats();
      setData(stats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 10 minutes (600,000 ms)
    const intervalId = setInterval(() => {
      console.log('Synchronizing Dashboard data...');
      fetchDashboardData(false); // Background refresh without full screen loader
    }, 600000);

    return () => clearInterval(intervalId);
  }, []);

  const COLORS = ['#C62828', '#1A1A1A', '#757575', '#BDBDBD', '#E0E0E0'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-primary"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Data Stream...</p>
      </div>
    );
  }

  if (!data) return <Empty description="Failed to load dashboard data" />;

  const { summary, growth, revenueData, categoryData, topProducts } = data;

  return (
    <div className="p-0 space-y-6 sm:space-y-12">
      {/* Header handled by Layout now if needed, but keeping page specific headers is good */}
      <Card variant="borderless" style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} styles={{ body: { padding: '24px 16px' } }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-accent tracking-tighter">Enterprise Overview</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-brand-textSecondary sm:text-[14px] text-[12px] font-medium">Real-time intelligence monitoring.</p>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Sync: {lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex items-center space-x-2 self-start md:self-center">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse ml-2" />
              <span className="text-[9px] sm:text-[10px] font-black text-gray-500 pr-3 uppercase tracking-widest leading-none">Global Cluster Live</span>
          </div>
        </div>
      </Card>
      
      {/* Stats Grid */}
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Revenue"
            value={`₹${summary.totalRevenue.toLocaleString()}`}
            growth={growth.revenue}
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Orders"
            value={summary.totalOrders}
            growth={growth.orders}
            icon={<ShoppingCartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Customers"
            value={summary.totalCustomers}
            growth={growth.customers}
            icon={<UserOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Products"
            value={summary.totalProducts}
            growth={growth.products}
            icon={<DatabaseOutlined />}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card 
            title={<span className="text-sm font-black uppercase tracking-widest text-brand-accent">Revenue Analytics</span>}
            variant="borderless" 
            className="hover:shadow-xl transition-all duration-500"
            style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            extra={<div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button className="px-4 py-1 text-[10px] bg-white shadow-sm rounded-lg font-black text-brand-primary">INCOME</button>
                <button className="px-4 py-1 text-[10px] font-bold text-gray-400 hover:text-brand-accent transition-colors">PLANS</button>
            </div>}
          >
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C62828" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#C62828" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C62828" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Category Chart */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span className="text-sm font-black uppercase tracking-widest text-brand-accent">Inventory Split</span>}
            variant="borderless" 
            className="hover:shadow-xl transition-all duration-500"
            style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={10}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-black text-brand-accent">100%</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between px-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-brand-accent">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        title={<span className="text-sm font-black uppercase tracking-widest text-brand-accent">High Performance Inventory</span>}
        extra={<Button type="link" className="font-black text-brand-primary text-xs p-0">EXPORT DATA</Button>}
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pb-6 px-4">Product Details</th>
                <th className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pb-6">Sales</th>
                <th className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pb-6">Revenue</th>
                <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pb-6 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 border-t border-gray-50">
              {topProducts.map((product) => (
                <tr key={product.name} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl mr-4 flex items-center justify-center border border-gray-200 group-hover:border-brand-primary/20 transition-colors overflow-hidden shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-brand-accent tracking-tight truncate">{product.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">SKU: PROD-{Math.floor(Math.random() * 1000)}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-6 text-center">
                    <span className="text-xs font-bold text-brand-textPrimary">{product.sales} units</span>
                  </td>
                  <td className="py-6 text-center">
                    <span className="text-xs font-black text-brand-accent">${product.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <span className="bg-green-50 text-green-600 text-[9px] font-black px-3 py-1.5 rounded-lg border border-green-100 uppercase tracking-widest">
                      In Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
