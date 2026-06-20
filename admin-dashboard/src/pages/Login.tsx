import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { 
  UserOutlined,
  EyeInvisibleOutlined, 
  EyeTwoTone,
  ArrowRightOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { email, password } = values;
    
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('admin_token', response.token);
      message.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] relative overflow-hidden">
      {/* Background brand accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-accent/5 rounded-full blur-[80px]" />
      
      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px] px-6"
      >
        <Card 
            variant="borderless" 
            style={{ 
                borderRadius: 32, 
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                padding: '12px'
            }}
            styles={{ body: { padding: '24px 16px' } }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-brand-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-brand-primary/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl font-black text-white leading-none">S</span>
            </div>
            <h1 className="text-3xl font-black text-brand-accent mt-8 tracking-tight text-center leading-none">ShivStyle Admin</h1>
            <div className="h-1.5 w-12 bg-brand-primary rounded-full mt-4" />
          </div>

          <Form
            name="login"
            layout="vertical"
            initialValues={{ email: 'admin@example.com', password: 'admin123' }}
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Domain</span>}
              rules={[{ required: true, type: 'email', message: 'Please input your email!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-300" />} 
                placeholder="admin@example.com" 
                style={{ borderRadius: 16, height: 54, paddingLeft: 16 }}
                className="bg-gray-50 border-none hover:bg-gray-100 transition-colors"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Access Key</span>}
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<SafetyCertificateOutlined className="text-gray-300" />}
                placeholder="••••••••"
                style={{ borderRadius: 16, height: 54, paddingLeft: 16 }}
                iconRender={visible => (visible ? <EyeTwoTone twoToneColor="#C62828" /> : <EyeInvisibleOutlined />)}
                className="bg-gray-50 border-none hover:bg-gray-100 transition-colors"
              />
            </Form.Item>

            <Form.Item className="mt-8">
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                icon={<ArrowRightOutlined />}
                style={{ 
                    borderRadius: 16, 
                    height: 58, 
                    fontSize: 16, 
                    fontWeight: 900,
                    boxShadow: '0 10px 20px rgba(198, 40, 40, 0.2)'
                }}
              >
                Authenticate Session
              </Button>
            </Form.Item>

            <div className="bg-brand-primaryLight/30 p-5 rounded-2xl flex items-center space-x-4 border border-brand-primary/10">
              <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black text-xs">DEV</div>
              <div>
                <p className="text-[10px] text-brand-primary font-black tracking-widest uppercase">Development Bypass</p>
                <p className="text-[11px] text-brand-accent font-bold mt-0.5">admin@example.com / admin123</p>
              </div>
            </div>
          </Form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Text className="text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">
              © 2026 Enterprise Systems
            </Text>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
