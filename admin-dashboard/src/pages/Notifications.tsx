import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SendOutlined, 
  DeleteOutlined, 
  BellOutlined,
  GlobalOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { notificationService, type Notification } from '../services/notificationService';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // BE-driven state
  const [searchInput, setSearchInput] = useState(''); // immediate input display
  const [search, setSearch] = useState('');           // debounced BE query value
  const [typeFilter, setTypeFilter] = useState('all');
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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
      });
      setNotifications(data.notifications || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, typeFilter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleCreate = async (values: any) => {
    try {
      await notificationService.create(values);
      message.success('Notification sent successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchNotifications();
    } catch (error) {
      message.error('Failed to send notification');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Notification',
      content: 'This will remove the notification from the history.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await notificationService.delete(id);
          message.success('Notification deleted');
          fetchNotifications();
        } catch (error) {
          message.error('Failed to delete notification');
        }
      }
    });
  };

  const columns: ColumnsType<Notification> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      width: '40%',
      render: (text: string) => <p className="text-sm text-gray-500 line-clamp-2">{text}</p>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: string) => (
        <Tag
          color={type === 'all' ? 'blue' : 'orange'}
          icon={type === 'all' ? <GlobalOutlined /> : <UserOutlined />}
        >
          {type === 'all' ? 'Broadcast' : 'Direct'}
        </Tag>
      ),
    },
    {
      title: 'Date',
      key: 'date',
      width: 160,
      render: (_, record: Notification) => {
        const date = record.created_at;
        return (
          <span className="text-sm text-gray-500">
            {date ? format(new Date(date), 'MMM dd, HH:mm') : '-'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record: Notification) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
          type="text"
          danger
          size="small"
        />
      ),
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Send and manage system notifications</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'all_broadcast', label: 'Broadcast' },
              { value: 'specific', label: 'Direct' },
            ]}
          />
          <Input
            placeholder="Search notifications..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Send Notification
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="id"
          loading={loading}
          className="ant-table-striped"
          scroll={{ x: 800, y: 'calc(100vh - 350px)' }}
          pagination={{
            current: page,
            pageSize,
            total: totalRows,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} notifications`,
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={
          <span>
            <BellOutlined className="mr-2" />
            Send Notification
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Send"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. System Maintenance Alert" />
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Type your message here..." />
          </Form.Item>
          <Form.Item name="type" label="Target Audience" initialValue="all">
            <Select
              options={[
                { value: 'all', label: 'All Users' },
                { value: 'specific', label: 'Targeted Segment (Coming Soon)', disabled: true },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;
