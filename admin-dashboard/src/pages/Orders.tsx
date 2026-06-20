import React, { useEffect, useState, useCallback } from 'react';
import { Table, message, Button, Tag, Select, Space, Modal, Descriptions, Divider, Grid, Input } from 'antd';
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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      placed: { color: 'default', icon: <ClockCircleOutlined /> },
      confirmed: { color: 'blue', icon: <CheckCircleOutlined /> },
      processing: { color: 'processing', icon: <SyncOutlined spin /> },
      shipped: { color: 'cyan', icon: <TruckOutlined /> },
      out_for_delivery: { color: 'purple', icon: <TruckOutlined /> },
      delivered: { color: 'success', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'error', icon: <CloseCircleOutlined /> },
      returned: { color: 'warning', icon: <CloseCircleOutlined /> },
    };
    return configs[status] || { color: 'default', icon: null };
  };

  const getStatusTag = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Tag icon={config.icon} color={config.color}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Tag>
    );
  };

  const getPaymentStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'success',
      not_paid: 'warning',
      refunded: 'error',
    };
    return (
      <Tag color={colors[status] || 'default'}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Tag>
    );
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
      fixed: isMobile ? undefined : 'left',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record: Order) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.user?.name || 'Guest'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.user?.email}</div>
        </div>
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
      dataIndex: 'created_at',
      key: 'date',
      width: 150,
      render: (date: string) => (
        <div>
          <div>{date ? format(new Date(date), 'MMM dd, yyyy') : '-'}</div>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {date ? format(new Date(date), 'hh:mm a') : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      fixed: isMobile ? undefined : 'right',
      align: 'center',
      render: (_, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showOrderDetails(record)}
        >
          View
        </Button>
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
      </div>

      {/* Order Details Modal */}
      <Modal
        title={
          <div>
            <ShoppingOutlined className="mr-2" />
            Order Details
          </div>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? '95%' : 800}
        centered
      >
        {selectedOrder && (
          <div>
            {/* Order Info */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Order Number" span={2}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedOrder.order_number}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {selectedOrder.created_at
                  ? format(new Date(selectedOrder.created_at), 'PPpp')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                {getPaymentStatusTag(selectedOrder.payment_status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.payment_type?.toUpperCase() || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Customer Info */}
            <h3 style={{ marginBottom: '16px' }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Customer Information
            </h3>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Name">
                {selectedOrder.user?.name || 'Guest'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.user?.phone || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Shipping Address */}
            <h3 style={{ marginBottom: '16px' }}>
              <EnvironmentOutlined style={{ marginRight: '8px' }} />
              Shipping Address
            </h3>
            <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 8 }}>
              <div>
                <strong>{selectedOrder.shippingAddress?.full_name}</strong>
              </div>
              <div>{selectedOrder.shippingAddress?.address_line1}</div>
              {selectedOrder.shippingAddress?.address_line2 && (
                <div>{selectedOrder.shippingAddress.address_line2}</div>
              )}
              <div>
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{' '}
                {selectedOrder.shippingAddress?.postal_code}
              </div>
              <div>{selectedOrder.shippingAddress?.country || 'India'}</div>
              <div style={{ marginTop: '8px' }}>
                <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
              </div>
            </div>

            <Divider />

            {/* Order Items */}
            <h3 style={{ marginBottom: '16px' }}>
              <ShoppingOutlined style={{ marginRight: '8px' }} />
              Order Items
            </h3>
            <Table
              dataSource={selectedOrder.orderItems}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product',
                  render: (name: string, record: any) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      {(record.color || record.size) && (
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          {record.color && `Color: ${record.color}`}
                          {record.color && record.size && ' | '}
                          {record.size && `Size: ${record.size}`}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  width: 100,
                  render: (price: number) => `₹${Number(price || 0).toFixed(2)}`,
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 60,
                  align: 'center',
                },
                {
                  title: 'Total',
                  dataIndex: 'total_amount',
                  key: 'total',
                  width: 120,
                  render: (total: number) => (
                    <strong>₹{Number(total || 0).toFixed(2)}</strong>
                  ),
                },
              ]}
            />

            <Divider />

            {/* Price Summary */}
            <h3 style={{ marginBottom: '16px' }}>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Price Summary
            </h3>
            <div style={{ maxWidth: '400px', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discount_amount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                  <span>Discount:</span>
                  <span>- ₹{Number(selectedOrder.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Shipping:</span>
                <span>₹{Number(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                <span>Total:</span>
                <span>₹{Number(selectedOrder.net_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
