import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Notifications from './pages/Notifications';
import Locations from './pages/Locations';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="locations" element={<Locations />} />
          
          {/* Settings placeholder or other routes can go here */}
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page coming soon...</p></div>} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
