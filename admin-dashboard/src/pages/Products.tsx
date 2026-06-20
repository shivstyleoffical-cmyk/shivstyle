import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, message, Tag, Table, Input, Select } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductForm from '../components/products/ProductForm';

// Map column ids to backend field names
const SORT_FIELD_MAP: Record<string, string> = {
  product_name: 'product_name',
  price: 'price',
  stock_quantity: 'stock_quantity',
  status: 'status',
  category: 'category_id',
};

const PAGE_SIZES = [5, 10, 20, 50];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Server-side state
  const [searchInput, setSearchInput] = useState(''); // immediate input display
  const [search, setSearch] = useState('');           // debounced BE query value
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Debounce: only update `search` (BE query) 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAll({
        page,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setProducts(data.products || []);
      setTotalRows(data.pagination.total);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter.field) {
      setSortBy(SORT_FIELD_MAP[sorter.field] || sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'DESC' : 'ASC');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await productService.delete(id);
          message.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          message.error('Failed to delete product');
        }
      },
    });
  };

  const openModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };


  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 70,
      render: (images: any[], record: Product) => (
        <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
          {images && images.length > 0 ? (
            <img src={images[0].image_url} alt="" className="w-full h-full object-cover" />
          ) : record.image_url ? (
            <img src={record.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ShoppingOutlined className="text-gray-300 text-lg" />
          )}
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 180,
      sorter: true,
      render: (text: string, p: Product) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          <div className="text-xs text-gray-400 font-medium">{p.brand || 'Premium Collection'}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'category_name'],
      key: 'category',
      width: 120,
      render: (_text: string, p: Product) => (
        <Tag color="volcano" className="rounded-md uppercase text-[10px] font-bold">
          {p.category?.category_name || 'GENERAL'}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      sorter: true,
      render: (price: number) => <span className="font-semibold text-gray-800">₹{Number(price).toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 100,
      sorter: true,
      render: (qty: number) => <span className={`font-semibold ${qty < 10 ? 'text-red-500 font-bold' : 'text-gray-700'}`}>{qty}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      sorter: true,
      render: (_status: string, p: Product) => (
        <div className="flex flex-wrap gap-1">
          {p.category?.status === 'inactive' && p.status === 'active' ? (
            <Tag color="error" className="rounded-md text-[10px] font-bold m-0">Cat. Hidden</Tag>
          ) : (
            <Tag color={p.status === 'active' ? 'green' : 'default'} className="rounded-md capitalize text-[10px] font-bold m-0">{p.status}</Tag>
          )}
          {p.is_featured && <Tag color="orange" className="rounded-md text-[10px] font-bold m-0">Featured</Tag>}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Product) => (
        <div className="flex items-center gap-2">
          <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} className="text-gray-500 hover:text-blue-600" />
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
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your marketplace inventory</p>
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
            placeholder="Search products..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="w-full sm:w-auto">
            Add Product
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-1">
        <Table
          columns={tableColumns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 800, y: 'calc(100vh - 350px)' }}
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

      <ProductForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); fetchProducts(); }}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products;
