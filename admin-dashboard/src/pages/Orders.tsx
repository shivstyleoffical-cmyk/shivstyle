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

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

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
        title={
          selectedOrder && (
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 pr-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingOutlined className="text-[#C62828] text-base" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">Order Details</h2>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedOrder.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusTag(selectedOrder.status)}
                {getPaymentStatusTag(selectedOrder.payment_status)}
              </div>
            </div>
          )
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button 
            key="close" 
            type="primary" 
            className="bg-slate-950 hover:bg-slate-800 text-white border-none rounded-lg px-6 h-9 font-medium text-sm transition-colors shadow-sm cursor-pointer"
            onClick={() => setDetailsVisible(false)}
          >
            Close
          </Button>,
        ]}
        width={950}
        centered
        className="premium-order-modal"
      >
        {selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            
            {/* Left Side: Items & Financials */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Order Items Section */}
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
                
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-center first:pt-0 last:pb-0">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200/40 overflow-hidden shadow-xs">
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
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {item.size && (
                              <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/60">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/60">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs font-medium text-slate-400 mt-2">
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
              
              {/* Financials / Price Summary Section */}
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
                      <span className="text-xl font-black text-slate-900">₹{Number(selectedOrder.net_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Right Side: Order Status, Customer Info & Shipping Address */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Status details */}
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
              
              {/* Customer & Shipping combined info card */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-5">
                {/* Customer info sub-section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <UserOutlined className="text-slate-400" />
                    <span>Customer Details</span>
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      {((selectedOrder.user?.name || 'G')[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {selectedOrder.user?.name || 'Guest Customer'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">Registered Profile</div>
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

                {/* Shipping address sub-section */}
                <div className="pt-5 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <EnvironmentOutlined />
                    <span>Shipping Address</span>
                  </h3>
                  
                  {selectedOrder.shippingAddress ? (
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
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
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
            
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
