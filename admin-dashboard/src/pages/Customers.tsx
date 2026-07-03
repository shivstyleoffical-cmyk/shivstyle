import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Avatar, message, Input, Select, Grid, Button, Modal } from 'antd';
import { 
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  VerifiedOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../services/userService';
import type { User } from '../types';
import { format } from 'date-fns';

const { useBreakpoint } = Grid;

const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [searchInput, setSearchInput] = useState(''); // immediate input display
  const [search, setSearch] = useState('');           // debounced BE query value
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this customer?',
      content: 'This will permanently remove the customer profile, their delivery addresses, wishlist items, and associated order history. This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await userService.delete(userId);
          message.success('Customer deleted successfully');
          fetchUsers();
        } catch (error) {
          message.error('Failed to delete customer');
        }
      }
    });
  };

  const handleBulkDeleteUsers = () => {
    Modal.confirm({
      title: 'Bulk Delete Customers',
      content: `Are you sure you want to permanently delete the ${selectedRowKeys.length} selected customers and all their history? This action cannot be undone.`,
      okText: 'Yes, Delete All',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          const ids = selectedRowKeys.map(key => String(key));
          await userService.bulkDelete(ids);
          message.success(`${ids.length} customers deleted successfully`);
          setSelectedRowKeys([]);
          fetchUsers();
        } catch (error) {
          message.error('Failed to delete selected customers');
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

  // Debounce: only update `search` (BE query) 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAll({
        page,
        limit: pageSize,
        role: 'customer',
        search: search || undefined,
        is_verified: verifiedFilter === 'all' ? undefined : verifiedFilter === 'true',
      });
      setUsers(data.users || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, verifiedFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Customer',
      key: 'user',
      width: 280,
      fixed: isMobile ? undefined : 'left',
      render: (_, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.image} size={42}>
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold text-gray-900 leading-tight truncate">{record.name}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <MailOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
              <span className="text-xs text-gray-400 truncate">{record.email || 'Private Account'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (text: string) => (
        <div className="flex items-center space-x-2">
          <PhoneOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
          <span className="text-sm text-gray-700">{text || 'No Phone'}</span>
        </div>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'is_verified',
      key: 'status',
      width: 130,
      render: (verified: boolean) => (
        <Tag
          color={verified ? 'success' : 'warning'}
          icon={verified ? <VerifiedOutlined /> : null}
        >
          {verified ? 'Verified' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      key: 'joined',
      width: 150,
      render: (_, record: User) => {
        const date = record.createdAt || record.created_at;
        return (
          <div className="flex items-center space-x-2">
            <CalendarOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
            <span className="text-sm text-gray-600">
              {date ? format(new Date(date), 'MMM dd, yyyy') : 'No Date'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: isMobile ? undefined : 'right',
      render: (_, record: User) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleDeleteUser(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your registered user base</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={verifiedFilter}
            onChange={(val) => { setVerifiedFilter(val); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'true', label: 'Verified' },
              { value: 'false', label: 'Pending' },
            ]}
          />
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDeleteUsers}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          )}
          <Input
            placeholder="Search customers..."
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
          dataSource={users}
          rowKey="id"
          loading={loading}
          className="ant-table-striped"
          expandable={{
            expandedRowRender: (record) => (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mx-2 my-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Delivery Addresses</h4>
                {record.addresses && record.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {record.addresses.map((addr) => (
                      <div key={addr.id} className={`p-3 rounded-lg border ${addr.is_default ? 'bg-white border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold text-gray-800">{addr.full_name}</span>
                          {addr.is_default && <Tag color="blue" className="m-0 text-[10px]">Default</Tag>}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`},{' '}
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                        <div className="mt-2 flex items-center space-x-1 text-xs text-gray-400">
                          <PhoneOutlined style={{ fontSize: 10 }} />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No addresses saved for this customer.</p>
                )}
              </div>
            ),
            rowExpandable: (record) => !!record.addresses?.length,
          }}
          scroll={{ x: 800, y: 'calc(100vh - 350px)' }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalRows,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default Customers;
