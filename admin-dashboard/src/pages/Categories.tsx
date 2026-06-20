import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Switch,
  Upload,
  Tag,
  Select,
  Row,
  Col,
  Table,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined as ImageIcon,
  SearchOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import type { Category } from '../types';

const PAGE_SIZES = [5, 10, 20, 50];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allParentCategories, setAllParentCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Server-side state
  const [searchInput, setSearchInput] = useState(''); // immediate input display
  const [search, setSearch] = useState('');           // debounced BE query value
  const [sortBy, setSortBy] = useState('category_name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Debounce: only update `search` (BE query) 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
        sortBy,
        sortOrder,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setCategories(data.categories || []);
      setTotalRows(data.pagination.total);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, statusFilter]);

  const fetchAllParentCategories = async () => {
    try {
      const data = await categoryService.getAll({ limit: 500 });
      setAllParentCategories(data.categories.filter((c: Category) => !c.parent_cat_id));
    } catch (error) {
      console.error('Failed to fetch parent categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll({ page: 1, limit: 500, status: 'all' });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchAllParentCategories(); fetchProducts(); }, []);

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'DESC' : 'ASC');
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      const associatedProductIds = products.filter((p) => p.category_id === category.id).map((p) => p.id);
      form.setFieldsValue({
        category_name: category.category_name,
        description: category.description,
        status: category.status,
        parent_cat_id: category.parent_cat_id || undefined,
        product_ids: associatedProductIds,
      });
      if (category.image_url) {
        setFileList([{ url: category.image_url, name: 'category-image' }]);
      } else {
        setFileList([]);
      }
    } else {
      setEditingCategory(null);
      form.resetFields();
      form.setFieldsValue({ status: 'active', product_ids: [] });
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure? This will affect products linked to this category.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await categoryService.delete(id);
          message.success('Category deleted successfully');
          fetchCategories();
          fetchAllParentCategories();
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Failed to delete category');
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('category_name', values.category_name);
      formData.append('description', values.description || '');
      formData.append('status', values.status);
      formData.append('parent_cat_id', values.parent_cat_id || '');
      if (values.product_ids) {
        formData.append('product_ids', JSON.stringify(values.product_ids));
      }
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        message.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        message.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 70,
      render: (url: string) => (
        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
          {url ? (
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-gray-300 text-lg" />
          )}
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150,
      sorter: true,
      render: (text: string) => <div className="font-medium text-gray-900">{text}</div>,
    },
    {
      title: 'Parent',
      dataIndex: 'parent',
      key: 'parent',
      width: 120,
      render: (parent: any) => parent ? (
        <span className="text-gray-600 flex items-center gap-1 text-sm">
          <FolderOutlined className="text-gray-400" />
          {parent.category_name}
        </span>
      ) : (
        <span className="text-gray-400 italic text-sm">None</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (desc: string) => (
        <div className="text-gray-500 truncate max-w-[180px] text-sm" title={desc}>
          {desc || '-'}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      sorter: true,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'blue' : 'default'} className="rounded-md capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Category) => (
        <div className="flex items-center gap-2">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenDialog(record)} className="text-gray-500 hover:text-blue-600" />
          <Button type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} className="text-gray-500 hover:text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and organize your storefront hierarchy</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          <Select
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            Add Category
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 740, y: 'calc(100vh - 350px)' }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalRows,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZES.map(String),
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="ant-table-striped"
        />
      </div>

      {/* Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText={editingCategory ? 'Save Changes' : 'Create Category'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active' }} className="mt-4">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="category_name" label="Category Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                <Input placeholder="e.g. Electronics" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="parent_cat_id" label="Parent Category">
                <Select placeholder="None (Top-Level)" allowClear>
                  {allParentCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>{cat.category_name}</Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Brief description..." />
          </Form.Item>
          <Form.Item name="product_ids" label="Products">
            <Select mode="multiple" placeholder="Select products" allowClear optionFilterProp="label">
              {products.map((prod) => (
                <Select.Option key={prod.id} value={prod.id} label={prod.product_name}>{prod.product_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item name="status" label="Status" valuePropName="checked" getValueFromEvent={(val) => (val ? 'active' : 'inactive')} getValueProps={(val) => ({ checked: val === 'active' })}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Image">
                <Upload listType="picture-card" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false} maxCount={1}>
                  {fileList.length >= 1 ? null : (
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
