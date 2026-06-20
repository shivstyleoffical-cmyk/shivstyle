import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Switch, message, Modal, Form, Input, InputNumber, Space, Popconfirm, Tag, Grid, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { locationService } from '../services/locationService';
import type { Location } from '../services/locationService';
import type { ColumnsType } from 'antd/es/table';

const { useBreakpoint } = Grid;

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
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

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form] = Form.useForm();

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter,
      });
      setLocations(data.locations || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      message.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleAddEdit = async (values: any) => {
    try {
      if (editingLocation) {
        await locationService.update(editingLocation.id, values);
        message.success('Location updated successfully');
      } else {
        await locationService.create(values);
        message.success('Location created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchLocations();
    } catch (error) {
      message.error('Failed to save location');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await locationService.delete(id);
      message.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      message.error('Failed to delete location');
    }
  };

  const toggleStatus = async (location: Location) => {
    try {
      await locationService.update(location.id, { is_active: !location.is_active });
      message.success(`Location ${!location.is_active ? 'activated' : 'deactivated'}`);
      fetchLocations();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns: ColumnsType<Location> = [
    {
      title: 'City',
      dataIndex: 'city_name',
      key: 'city_name',
      width: 150,
      fixed: (isMobile ? undefined : 'left') as any,
      sorter: true,
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 150,
      sorter: true,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      width: 110,
      render: (text: string) => <span className="font-mono text-gray-600">{text}</span>,
    },
    {
      title: 'Delivery Charge',
      dataIndex: 'delivery_charge',
      key: 'delivery_charge',
      width: 140,
      sorter: true,
      render: (val: number) => <span className="text-gray-700">₹{Number(val).toFixed(2)}</span>,
    },
    {
      title: 'Min Order',
      dataIndex: 'min_order_amount',
      key: 'min_order_amount',
      width: 110,
      render: (val: number) => <span className="text-gray-700">₹{Number(val).toFixed(2)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 110,
      render: (active: boolean, record: Location) => (
        <Switch
          checked={active}
          onChange={() => toggleStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Off"
          size={isMobile ? 'small' : 'default'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      fixed: (isMobile ? undefined : 'right') as any,
      render: (_: any, record: Location) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingLocation(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this location?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Locations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage service areas and delivery configuration</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            style={{ width: 130 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
          <Input
            placeholder="Search locations..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingLocation(null);
              form.resetFields();
              setModalVisible(true);
            }}
            className="w-full sm:w-auto"
          >
            Add Location
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          columns={columns}
          dataSource={locations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800, y: 'calc(100vh - 350px)' }}
          className="ant-table-striped"
          pagination={{
            current: page,
            pageSize,
            total: totalRows,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} locations`,
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingLocation ? 'Save Changes' : 'Create Location'}
        width={isMobile ? '95%' : 480}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
          className="mt-4"
          initialValues={{ state: 'West Bengal', is_active: true, delivery_charge: 50, min_order_amount: 0 }}
        >
          <Form.Item name="city_name" label="City Name" rules={[{ required: true, message: 'Please enter city name' }]}>
            <Input placeholder="e.g. Kalimpong" />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state' }]}>
            <Input placeholder="e.g. West Bengal" />
          </Form.Item>
          <Form.Item name="pincode" label="Pincode" rules={[{ required: true, message: 'Please enter pincode' }]}>
            <Input placeholder="e.g. 734301" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="delivery_charge" label="Delivery Charge (₹)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="min_order_amount" label="Min Order (₹)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Locations;
