import React, { useEffect, useState, useCallback } from 'react';
import { Table, message, Button, Tag, Select, Space, Modal, Grid, Input } from 'antd';
import { 
  EyeOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { orderService } from '../services/orderService';
import type { Order } from '../types';
import { format } from 'date-fns';

const { useBreakpoint } = Grid;

const PACKAGE_TEMPLATES = [
  { label: 'Single Apparel (Envelope) - 300g (15x15x2 cm)', value: 'single_apparel', weight: '0.30', length: '15', breadth: '15', height: '2' },
  { label: 'Standard Shirt Box - 500g (25x20x5 cm)', value: 'shirt_box', weight: '0.50', length: '25', breadth: '20', height: '5' },
  { label: 'Medium Shoes Box - 1.0kg (30x20x12 cm)', value: 'medium_box', weight: '1.00', length: '30', breadth: '20', height: '12' },
  { label: 'Large Cargo Box - 2.5kg (40x30x20 cm)', value: 'large_box', weight: '2.50', length: '40', breadth: '30', height: '20' },
  { label: 'Custom dimensions...', value: 'custom', weight: '0.50', length: '15', breadth: '15', height: '10' }
];

const DEFAULT_PICKUP_LOCATIONS = [
  { label: 'Primary Store (734001)', value: 'Primary' },
];

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  });

  const [packageDetails, setPackageDetails] = useState({
    weight: '0.30',
    length: '15',
    breadth: '15',
    height: '2',
    pickupLocation: 'Primary',
    template: 'single_apparel'
  });

  const [liveRates, setLiveRates] = useState<any[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [rawPickupLocations, setRawPickupLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchPickupLocations = async () => {
      try {
        const res = await orderService.getPickupLocations();
        if (res.success && res.locations) {
          setRawPickupLocations(res.locations);
          const formatted = res.locations.map((loc: any) => ({
            label: `${loc.pickupLocation} (${loc.pincode}) - ${loc.city}`,
            value: loc.pickupLocation
          }));
          setPickupLocations(formatted);
          if (res.locations.length > 0) {
            setPackageDetails(prev => ({
              ...prev,
              pickupLocation: res.locations[0].pickupLocation
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load pickup locations:', err);
      }
    };
    fetchPickupLocations();
  }, []);

  useEffect(() => {
    setLiveRates([]);
    if (selectedOrder && selectedOrder.orderItems) {
      const totalItems = selectedOrder.orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      const computedWeight = (totalItems * 0.30).toFixed(2);
      
      let detectedTemplate = 'single_apparel';
      let l = '15', b = '15', h = '2';
      
      if (totalItems > 3) {
        detectedTemplate = 'medium_box';
        l = '30'; b = '20'; h = '12';
      } else if (totalItems > 1) {
        detectedTemplate = 'shirt_box';
        l = '25'; b = '20'; h = '5';
      }
      
      setPackageDetails({
        weight: computedWeight,
        length: l,
        breadth: b,
        height: h,
        pickupLocation: rawPickupLocations.length > 0 ? rawPickupLocations[0].pickupLocation : 'Primary',
        template: detectedTemplate
      });
    }
  }, [selectedOrder, rawPickupLocations]);

  const handleSendToShiprocket = async () => {
    if (!selectedOrder) return;
    try {
      setBookingLoading(true);
      const res = await orderService.bookShipment(selectedOrder.id, packageDetails);
      if (res.success) {
        message.success(res.message || 'Shipment successfully booked on Shiprocket!');
        // Refresh details
        const updated = await orderService.getById(selectedOrder.id);
        setSelectedOrder(updated);
        fetchOrders();
      } else {
        message.error(res.message || 'Failed to book shipment');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to book shipment on Shiprocket');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFetchRates = async () => {
    if (!selectedOrder) return;
    try {
      setRatesLoading(true);
      const res = await orderService.getShippingRates(selectedOrder.id, packageDetails);
      if (res.success) {
        setLiveRates(res.rates || []);
        message.success('Successfully retrieved live courier rates!');
      } else {
        message.error('Failed to fetch shipping rates');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to fetch shipping rates from Shiprocket');
    } finally {
      setRatesLoading(false);
    }
  };

  const handleStartEditingAddress = () => {
    if (!selectedOrder || !selectedOrder.shippingAddress) return;
    const addr = selectedOrder.shippingAddress;
    setAddressForm({
      full_name: addr.full_name || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postal_code: addr.postal_code || '',
      phone: addr.phone || '',
    });
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    if (!selectedOrder) return;
    try {
      const res = await orderService.updateShippingAddress(selectedOrder.id, addressForm);
      if (res.success) {
        message.success('Shipping address updated successfully');
        setIsEditingAddress(false);
        // Refresh details
        const updated = await orderService.getById(selectedOrder.id);
        setSelectedOrder(updated);
        fetchOrders();
      } else {
        message.error(res.message || 'Failed to update shipping address');
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to update shipping address');
    }
  };

  // Filters
  const [searchInput, setSearchInput] = useState(''); // immediate input display
  const [search, setSearch] = useState('');           // debounced BE query value
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Debounce: only update `search` (BE query) 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll({
        page,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
      });
      setOrders(data.orders || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      message.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this order?',
      content: 'This action cannot be undone and will permanently remove all order records from the database.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Keep',
      centered: true,
      onOk: async () => {
        try {
          await orderService.delete(orderId);
          message.success('Order deleted successfully');
          fetchOrders();
        } catch (error) {
          message.error('Failed to delete order');
        }
      }
    });
  };

  const handleBulkDeleteOrders = () => {
    Modal.confirm({
      title: 'Bulk Delete Orders',
      content: `Are you sure you want to permanently delete the ${selectedRowKeys.length} selected orders? This action cannot be undone.`,
      okText: 'Yes, Delete All',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          const ids = selectedRowKeys.map(key => String(key));
          await orderService.bulkDelete(ids);
          message.success(`${ids.length} orders deleted successfully`);
          setSelectedRowKeys([]);
          fetchOrders();
        } catch (error) {
          message.error('Failed to delete selected orders');
        }
      }
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; label: string; icon?: React.ReactNode }> = {
      placed: { bg: 'bg-slate-50 border-slate-200 text-slate-600', label: 'Placed', icon: <ClockCircleOutlined className="text-slate-400" /> },
      confirmed: { bg: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Confirmed', icon: <CheckCircleOutlined className="text-blue-400" /> },
      processing: { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Processing', icon: <SyncOutlined spin className="text-amber-500" /> },
      shipped: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700', label: 'Shipped', icon: <TruckOutlined className="text-indigo-500" /> },
      out_for_delivery: { bg: 'bg-purple-50 border-purple-200 text-purple-700', label: 'Out for Delivery', icon: <TruckOutlined className="text-purple-500" /> },
      delivered: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Delivered', icon: <CheckCircleOutlined className="text-emerald-500" /> },
      cancelled: { bg: 'bg-rose-50 border-rose-200 text-rose-700', label: 'Cancelled', icon: <CloseCircleOutlined className="text-rose-500" /> },
      returned: { bg: 'bg-orange-50 border-orange-200 text-orange-700', label: 'Returned', icon: <CloseCircleOutlined className="text-orange-500" /> },
    };
    const config = configs[status] || { bg: 'bg-slate-50 border-slate-200 text-slate-600', label: status, icon: null };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; label: string }> = {
      paid: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Paid' },
      not_paid: { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Not Paid' },
      refunded: { bg: 'bg-rose-50 border-rose-200 text-rose-700', label: 'Refunded' },
    };
    const config = configs[status] || { bg: 'bg-slate-50 border-slate-200 text-slate-600', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getStatusTag = (status: string) => {
    return getStatusBadge(status);
  };

  const getPaymentStatusTag = (status: string) => {
    return getPaymentStatusBadge(status);
  };

  const showOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
    try {
      const freshOrder = await orderService.getById(order.id);
      setSelectedOrder(freshOrder);
    } catch (error) {
      message.error('Failed to load up-to-date order details');
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 220,
      fixed: isMobile ? undefined : 'left',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 220,
      render: (_, record: Order) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: 600 }}>{record.user?.name || 'Guest'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.user?.email || '-'}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{record.user?.phone || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Shipping To',
      key: 'shipping',
      width: 180,
      render: (_, record: Order) => (
        record.shippingAddress ? (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 500 }}>{record.shippingAddress.full_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.shippingAddress.city}, {record.shippingAddress.state}
            </div>
          </div>
        ) : '-'
      ),
    },
    {
      title: 'Items',
      dataIndex: 'orderItems',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items: any[]) => (
        <Tag color="blue">{items?.length || 0}</Tag>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'net_amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 600 }}>₹{Number(amount || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 150,
      render: (_, record: Order) => (
        <Space direction="vertical" size={0}>
          {getPaymentStatusTag(record.payment_status)}
          <span style={{ fontSize: '11px', color: '#666' }}>
            {record.payment_type?.toUpperCase()}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status: string, record: Order) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: '100%' }}
          size="small"
        >
          <Select.Option value="placed">Placed</Select.Option>
          <Select.Option value="confirmed">Confirmed</Select.Option>
          <Select.Option value="processing">Processing</Select.Option>
          <Select.Option value="shipped">Shipped</Select.Option>
          <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
          <Select.Option value="delivered">Delivered</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
          <Select.Option value="returned">Returned</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      width: 150,
      render: (_, record: Order) => {
        const date = record.createdAt || record.created_at;
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div>{date ? format(new Date(date), 'MMM dd, yyyy') : '-'}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {date ? format(new Date(date), 'hh:mm a') : ''}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      fixed: isMobile ? undefined : 'right',
      align: 'center',
      render: (_, record: Order) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showOrderDetails(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteOrder(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'placed', label: 'Placed' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'out_for_delivery', label: 'Out for Delivery' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'returned', label: 'Returned' },
            ]}
          />
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDeleteOrders}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          )}
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200, y: 'calc(100vh - 350px)' }}
          className="ant-table-striped"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalRows,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
          onChange={handleTableChange}
        />
      </div>      {/* Order Details Modal */}
      <Modal
        title={null}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          selectedOrder && 
          (!selectedOrder.tracking_number || selectedOrder.tracking_number.startsWith('SR-PEND')) && 
          (selectedOrder.payment_status === 'paid' || selectedOrder.payment_type === 'cod') && (
            <Button
              key="ship"
              type="primary"
              className="bg-indigo-600 hover:bg-indigo-500 border-none rounded-lg px-6 h-9 font-medium text-sm transition-colors shadow-sm cursor-pointer mr-2"
              loading={bookingLoading}
              onClick={handleSendToShiprocket}
            >
              Send to Shiprocket
            </Button>
          ),
          <Button 
            key="close" 
            type="primary" 
            className="bg-slate-950 hover:bg-slate-800 text-white border-none rounded-lg px-6 h-9 font-medium text-sm transition-colors shadow-sm cursor-pointer"
            onClick={() => setDetailsVisible(false)}
          >
            Close
          </Button>,
        ]}
        width={1000}
        centered
        className="premium-order-modal"
        closeIcon={<span className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-bold">×</span>}
      >
        {selectedOrder && (
          <div className="pt-2">
            
            {/* Redesigned Header: Clean & Overlap-Free */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 mb-6 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/40">
                  <ShoppingOutlined className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Order Details</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">{selectedOrder.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusTag(selectedOrder.status)}
                {getPaymentStatusTag(selectedOrder.payment_status)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Items, Financials, Customer Info & Shipping Address */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Order Items Card */}
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingOutlined className="text-slate-400" />
                      <span>Items Ordered</span>
                    </h3>
                    <span className="text-xs bg-slate-50 text-slate-600 font-medium px-2.5 py-1 rounded-md border border-slate-200/60">
                      {selectedOrder.orderItems?.length || 0} {selectedOrder.orderItems?.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  
                  <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                    {selectedOrder.orderItems?.map((item) => (
                      <div key={item.id} className="py-4 flex gap-4 items-center first:pt-0 last:pb-0">
                        {/* Product Thumbnail */}
                        <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200/40 overflow-hidden shadow-2xs">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product_name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingOutlined className="text-slate-300 text-lg" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                            {item.product_name}
                          </h4>
                          
                          {/* Variant details (Color / Size) */}
                          {(item.color || item.size) && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.size && (
                                <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200/60">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200/60">
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-[11px] font-medium text-slate-400 mt-1.5">
                            Qty: {item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-slate-900">
                            ₹{Number(item.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary Card */}
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <DollarOutlined className="text-slate-400" />
                    <span>Payment Summary</span>
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-slate-900 font-semibold">₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    {Number(selectedOrder.discount_amount || 0) > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-medium">
                        <span>Discount</span>
                        <span className="font-bold">- ₹{Number(selectedOrder.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Shipping Fee</span>
                      <span className="text-slate-900 font-semibold">₹{Number(selectedOrder.shipping_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="border-t border-slate-100 my-2 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">Total Net Amount</span>
                        <span className="text-lg font-black text-slate-900">₹{Number(selectedOrder.net_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details & Shipping Address Card */}
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                      <UserOutlined className="text-slate-400" />
                      <span>Customer Details</span>
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                        {((selectedOrder.user?.name || 'G')[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {selectedOrder.user?.name || 'Guest Customer'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Registered Profile</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Email</span>
                        <span className="text-slate-900 font-semibold truncate max-w-[180px]" title={selectedOrder.user?.email || '-'}>
                          {selectedOrder.user?.email || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Phone</span>
                        <span className="text-slate-900 font-semibold">
                          {selectedOrder.user?.phone || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <EnvironmentOutlined />
                        <span>Shipping Address</span>
                      </div>
                      {selectedOrder.shippingAddress && (!selectedOrder.tracking_number || selectedOrder.tracking_number.startsWith('SR-PEND')) && !isEditingAddress && (
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={handleStartEditingAddress} 
                          className="text-indigo-600 p-0 hover:text-indigo-500 font-bold text-xs"
                        >
                          Edit
                        </Button>
                      )}
                    </h3>
                    
                    {isEditingAddress ? (
                      <div className="space-y-3 mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Full Name</span>
                          <Input value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} size="small" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Address Line 1</span>
                          <Input value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} size="small" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Address Line 2</span>
                          <Input value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} size="small" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">City</span>
                            <Input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} size="small" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">State</span>
                            <Input value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} size="small" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pincode</span>
                            <Input value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} size="small" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Phone</span>
                            <Input value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} size="small" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button size="small" onClick={() => setIsEditingAddress(false)}>Cancel</Button>
                          <Button size="small" type="primary" className="bg-indigo-600 hover:bg-indigo-500 border-none" onClick={handleSaveAddress}>Save</Button>
                        </div>
                      </div>
                    ) : selectedOrder.shippingAddress ? (
                      <div className="space-y-3 text-sm text-slate-600 font-medium">
                        <div className="font-bold text-slate-900 text-sm">
                          {selectedOrder.shippingAddress.full_name}
                        </div>
                        <div className="space-y-0.5 leading-relaxed">
                          <div>{selectedOrder.shippingAddress.address_line1}</div>
                          {selectedOrder.shippingAddress.address_line2 && (
                            <div>{selectedOrder.shippingAddress.address_line2}</div>
                          )}
                          <div>
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - <span className="font-mono font-bold text-slate-900">{selectedOrder.shippingAddress.postal_code}</span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                            {selectedOrder.shippingAddress.country || 'India'}
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm mt-3">
                          <span className="text-slate-500 font-medium">Delivery Contact</span>
                          <span className="text-slate-900 font-bold font-mono">{selectedOrder.shippingAddress.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic font-medium">No shipping address recorded.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Side: Order Overview & Dispatch Configuration */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Order Overview Card */}
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span>Order Overview</span>
                  </h3>
                  
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 font-medium">Order Date</span>
                      <span className="text-slate-900 font-bold">
                        {selectedOrder.createdAt || selectedOrder.created_at
                          ? format(new Date(selectedOrder.createdAt || selectedOrder.created_at || ''), 'PPP pp')
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500 font-medium">Payment Method</span>
                      <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {selectedOrder.payment_type || '-'}
                      </span>
                    </div>
                    
                    {selectedOrder.coupon_code && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 font-medium">Coupon Applied</span>
                        <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                          {selectedOrder.coupon_code}
                        </span>
                      </div>
                    )}
                    
                    {/* Delivery & Tracking Info */}
                    {(selectedOrder.delivery_partner || selectedOrder.tracking_number) && (
                      <div className="pt-3 mt-3 border-t border-slate-100 space-y-3.5">
                        {selectedOrder.delivery_partner && (
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 font-medium">Courier Partner</span>
                            <span className="text-slate-900 font-bold">{selectedOrder.delivery_partner}</span>
                          </div>
                        )}
                        {selectedOrder.tracking_number && (
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 font-medium">AWB / Tracking</span>
                            <span className="text-slate-900 font-mono font-bold text-xs bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                              {selectedOrder.tracking_number}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Package & Dispatch Configuration Card */}
                {selectedOrder && (!selectedOrder.tracking_number || selectedOrder.tracking_number.startsWith('SR-PEND')) && (
                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-200/60 flex items-center gap-2">
                      <TruckOutlined className="text-indigo-600 text-base" />
                      <span>Package & Dispatch Configuration</span>
                    </h3>
                    
                    {/* Template selector */}
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                        Package Size Preset
                      </span>
                      <Select 
                        value={packageDetails.template} 
                        onChange={(val) => {
                          const t = PACKAGE_TEMPLATES.find(x => x.value === val);
                          if (t) {
                            setPackageDetails({
                              ...packageDetails,
                              template: val,
                              weight: t.weight,
                              length: t.length,
                              breadth: t.breadth,
                              height: t.height
                            });
                          }
                        }}
                        options={PACKAGE_TEMPLATES}
                        className="w-full"
                        size="middle"
                        popupClassName="rounded-lg shadow-lg border border-slate-100"
                      />
                    </div>

                    {/* Pickup Location selector */}
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                        Pickup Location
                      </span>
                      <Select 
                        value={packageDetails.pickupLocation} 
                        onChange={(val) => setPackageDetails({ ...packageDetails, pickupLocation: val })}
                        options={pickupLocations.length > 0 ? pickupLocations : DEFAULT_PICKUP_LOCATIONS}
                        className="w-full"
                        size="middle"
                      />

                      {/* Active Pickup Location Address Details */}
                      {(() => {
                        const activeLoc = rawPickupLocations.find(loc => loc.pickupLocation === packageDetails.pickupLocation);
                        if (!activeLoc) return null;
                        return (
                          <div className="mt-2.5 p-3 bg-white border border-slate-200/60 rounded-lg text-xs space-y-1.5 shadow-2xs">
                            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                              <span>Registered Pickup Address</span>
                              <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.2 rounded font-black lowercase">
                                verified
                              </span>
                            </div>
                            <div className="text-slate-700 font-medium leading-relaxed">
                              {activeLoc.address}, {activeLoc.city}, {activeLoc.state} - <span className="font-bold text-slate-900">{activeLoc.pincode}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Dynamic Package Dimensions Preview Diagram */}
                    <div className="bg-indigo-50/20 border border-indigo-100/60 rounded-xl p-4 flex flex-col items-center justify-center transition-all shadow-2xs">
                      <div className="text-[10px] text-indigo-700/80 font-bold uppercase tracking-wider mb-3 block self-start">
                        Package Dimension Blueprint
                      </div>

                      {/* SVG Canvas for Isometric Pencil Sketch */}
                      <svg viewBox="0 0 200 130" className="w-full max-w-[210px] h-auto text-slate-600 font-mono select-none overflow-visible">
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                            <path d="M 0 2 L 10 5 L 0 8 z" fill="#6366f1" />
                          </marker>
                          {/* Grid blueprint pattern background */}
                          <pattern id="blueprint-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                          </pattern>
                        </defs>

                        {/* Background pattern */}
                        <rect width="200" height="130" fill="url(#blueprint-grid)" rx="6" />

                        {/* 3D Isometric Projection Box Wireframe */}
                        {packageDetails.template === 'single_apparel' ? (
                          // Envelope Wireframe
                          <>
                            <path d="M 35 75 L 145 75 L 145 35 L 35 35 Z" fill="#fcfdfd" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 35 35 L 90 60 L 145 35" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="2,2" />
                            <path d="M 35 75 L 75 55" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="2,2" />
                            <path d="M 145 75 L 105 55" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="2,2" />
                            <path d="M 35 88 L 145 88" stroke="#6366f1" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                            <rect x="75" y="81" width="30" height="14" fill="#ffffff" rx="3" stroke="#cbd5e1" strokeWidth="0.5" />
                            <text x="90" y="91" textAnchor="middle" fontSize="9" className="fill-indigo-900 font-bold">{packageDetails.length}cm</text>
                            <path d="M 155 35 L 155 75" stroke="#6366f1" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                            <rect x="150" y="48" width="30" height="14" fill="#ffffff" rx="3" stroke="#cbd5e1" strokeWidth="0.5" />
                            <text x="165" y="58" textAnchor="middle" fontSize="9" className="fill-indigo-900 font-bold">{packageDetails.breadth}cm</text>
                            <path d="M 22 35 L 22 75" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2,2" />
                            <text x="15" y="58" textAnchor="end" fontSize="8" className="fill-slate-400 font-medium">H: {packageDetails.height}cm</text>
                          </>
                        ) : (
                          // Box Wireframe
                          <>
                            <path d="M 80 95 L 35 73 L 35 38 L 80 60 Z" fill="#fcfdfd" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 80 95 L 125 73 L 125 38 L 80 60 Z" fill="#fcfdfd" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 80 60 L 35 38 L 80 16 L 125 38 Z" fill="#f8fafc" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 80 60 L 80 95" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="3,3" />
                            <path d="M 57.5 49 L 102.5 49" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="3,3" />
                            <path d="M 30 81 L 75 103" stroke="#6366f1" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                            <rect x="37" y="83" width="30" height="14" fill="#ffffff" rx="3" stroke="#cbd5e1" strokeWidth="0.5" />
                            <text x="52" y="93" textAnchor="middle" fontSize="9" className="fill-indigo-900 font-bold" transform="rotate(25, 52, 93)">L: {packageDetails.length}cm</text>
                            <path d="M 85 103 L 130 81" stroke="#6366f1" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                            <rect x="93" y="83" width="30" height="14" fill="#ffffff" rx="3" stroke="#cbd5e1" strokeWidth="0.5" />
                            <text x="108" y="93" textAnchor="middle" fontSize="9" className="fill-indigo-900 font-bold" transform="rotate(-25, 108, 93)">W: {packageDetails.breadth}cm</text>
                            <path d="M 136 73 L 136 38" stroke="#6366f1" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                            <rect x="139" y="48" width="30" height="14" fill="#ffffff" rx="3" stroke="#cbd5e1" strokeWidth="0.5" />
                            <text x="154" y="58" textAnchor="middle" fontSize="9" className="fill-indigo-900 font-bold">H: {packageDetails.height}cm</text>
                          </>
                        )}
                      </svg>
                    </div>

                    {/* Weight and Dimensions grid */}
                    <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-4 shadow-sm">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Actual Weight (kg)
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={packageDetails.weight}
                          onChange={(e) => setPackageDetails({ ...packageDetails, weight: e.target.value })}
                          size="small"
                          className="rounded-md font-mono font-bold"
                          suffix="kg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Length
                          </span>
                          <Input
                            type="number"
                            value={packageDetails.length}
                            onChange={(e) => setPackageDetails({ ...packageDetails, length: e.target.value })}
                            size="small"
                            className="rounded-md font-mono font-bold"
                            suffix="cm"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Breadth
                          </span>
                          <Input
                            type="number"
                            value={packageDetails.breadth}
                            onChange={(e) => setPackageDetails({ ...packageDetails, breadth: e.target.value })}
                            size="small"
                            className="rounded-md font-mono font-bold"
                            suffix="cm"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Height
                          </span>
                          <Input
                            type="number"
                            value={packageDetails.height}
                            onChange={(e) => setPackageDetails({ ...packageDetails, height: e.target.value })}
                            size="small"
                            className="rounded-md font-mono font-bold"
                            suffix="cm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rates Query Button */}
                    <div className="pt-1">
                      <Button 
                        type="dashed" 
                        block 
                        icon={<SyncOutlined />} 
                        onClick={handleFetchRates} 
                        loading={ratesLoading} 
                        className="border-indigo-500 text-indigo-600 hover:text-indigo-500 hover:border-indigo-400 rounded-lg h-9 font-medium text-xs flex items-center justify-center gap-1.5"
                      >
                        Fetch Live Courier Rates
                      </Button>
                    </div>

                    {/* Live rates dropdown display */}
                    {liveRates.length > 0 && (
                      <div className="bg-white p-3 border border-slate-200/60 rounded-lg space-y-2.5 shadow-sm">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          Available Couriers & Rates
                        </span>
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                          {liveRates.map(r => (
                            <div 
                              key={r.courierId} 
                              className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-lg text-xs hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-slate-900 block truncate" title={r.courierName}>
                                  {r.courierName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                                  Delivery: {r.estimatedDays}
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-900 font-mono text-sm bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                                ₹{Number(r.rate).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
              
            </div>
            
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
