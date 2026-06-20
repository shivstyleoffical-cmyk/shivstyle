import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, DatePicker, message, Row, Col, Space, Grid } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PercentageOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { offerService } from '../services/offerService';
import type { Coupon } from '../types';
import { format } from 'date-fns';
import dayjs from 'dayjs';

const { useBreakpoint } = Grid;

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // BE-driven state
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await offerService.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setCoupons(data.offers || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleTableChange = (pagination: any, _filters: any, _sorter: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      const data = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };

      if (editingCoupon) {
        await offerService.update(editingCoupon.id, data);
        message.success('Coupon updated successfully');
      } else {
        await offerService.create(data);
        message.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Coupon',
      content: 'Are you sure you want to delete this coupon?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await offerService.delete(id);
          message.success('Coupon deleted successfully');
          fetchCoupons();
        } catch (error) {
          message.error('Failed to delete coupon');
        }
      }
    });
  };

  const openModal = (coupon?: Coupon | any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      form.setFieldsValue({
        ...coupon,
        start_date: dayjs(coupon.start_date),
        end_date: dayjs(coupon.end_date),
      });
    } else {
      setEditingCoupon(null);
      form.resetFields();
      form.setFieldsValue({ status: 'active', discount_type: 'percentage', min_order_amount: 0 });
    }
    setIsModalOpen(true);
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      fixed: (isMobile ? undefined : 'left') as any,
      render: (text: string) => (
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-mono text-sm font-semibold tracking-wider border border-gray-200">
          {text.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 130,
      render: (_, record: any) => (
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center text-red-600">
            {record.discount_type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}
          </div>
          <span className="font-semibold text-gray-800">
            {record.discount_value}{record.discount_type === 'percentage' ? '%' : '₹'}
          </span>
        </div>
      ),
    },
    {
      title: 'Min Order',
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      width: 110,
      render: (val) => <span className="text-gray-600">₹{val}</span>
    },
    {
      title: 'Validity',
      key: 'validity',
      width: 240,
      render: (_, record: any) => (
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-gray-500">{record.start_date ? format(new Date(record.start_date), 'MMM dd, yyyy') : '-'}</span>
          <ArrowRightOutlined style={{ fontSize: 10, color: '#d9d9d9' }} />
          <span className="text-gray-500">{record.end_date ? format(new Date(record.end_date), 'MMM dd, yyyy') : '-'}</span>
        </div>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 120,
      sorter: true,
      render: (_, record: any) => (
        <span className="text-sm text-gray-700">
          <span className="font-semibold">{record.used_count}</span>
          <span className="text-gray-400"> / {record.usage_limit || '∞'}</span>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: (isMobile ? undefined : 'right') as any,
      render: (_, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} type="text" size="small" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="text" danger size="small" />
        </Space>
      ),
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount codes and promotions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Input
            placeholder="Search coupons..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="w-full sm:w-auto">
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          loading={loading}
          className="ant-table-striped"
          scroll={{ x: 1000, y: 'calc(100vh - 350px)' }}
          pagination={{
            current: page,
            pageSize,
            total: totalRows,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} coupons`,
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingCoupon ? 'Save Changes' : 'Create Coupon'}
        width={isMobile ? '95%' : 600}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate} className="mt-4">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="code" label="Coupon Code" rules={[{ required: true }]}>
                <Input placeholder="e.g. SAVE20" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Optional description..." rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="discount_type" label="Discount Type" rules={[{ required: true }]}>
                <Select options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount (₹)' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discount_value" label="Discount Value" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_order_amount" label="Min Order Amount (₹)" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_discount_amount" label="Max Discount (₹) (Optional)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="End Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="usage_limit" label="Usage Limit (Optional)">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupons;
