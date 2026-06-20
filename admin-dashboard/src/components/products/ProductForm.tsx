import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Select, Switch, InputNumber, Upload, message, Divider, Row, Col, Tag, Grid } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import type { Product, Category } from '../../types';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

const { useBreakpoint } = Grid;

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, product, onSuccess }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [categories, setCategories] = useState<Category[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (product) {
      // Extract sizes and colors from existing variants
      const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];
      const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])];
      
      setAvailableSizes(sizes as string[]);
      setAvailableColors(colors as string[]);
      
      // Populate existing images
      const initialFiles: any[] = [];
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          initialFiles.push({
            uid: img.id,
            name: 'image.png',
            status: 'done',
            url: img.image_url,
            id: img.id // Store reference to original ID
          });
        });
      }
      if (product.image_url && !initialFiles.some(file => file.url === product.image_url)) {
        initialFiles.unshift({
          uid: 'primary-fallback',
          name: 'image.png',
          status: 'done',
          url: product.image_url,
          id: 'primary-fallback'
        });
      }
      setFileList(initialFiles);

      form.setFieldsValue({
        ...product,
        available_sizes: sizes,
        available_colors: colors,
        stock_quantity: product.stock_quantity || 0,
        status: product.status || 'active',
        is_on_sale: product.is_on_sale || false
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        stock_quantity: 0,
        status: 'active',
        is_on_sale: false
      });
      setFileList([]);
      setAvailableSizes([]);
      setAvailableColors([]);
    }
  }, [product, form]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll({ limit: 500 });
      setCategories(data.categories);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Build variants array from sizes and colors
      const variants: any[] = [];
      
      // Create variants for each combination of size and color
      if (availableSizes && availableSizes.length > 0) {
        if (availableColors && availableColors.length > 0) {
          // Create combinations of sizes and colors
          availableSizes.forEach(size => {
            availableColors.forEach(color => {
              variants.push({
                size,
                color,
                price: values.price || 0,
                stock_quantity: values.stock_quantity || 0,
                is_active: values.status === 'active'
              });
            });
          });
        } else {
          // Only sizes, no colors
          availableSizes.forEach(size => {
            variants.push({
              size,
              price: values.price || 0,
              stock_quantity: values.stock_quantity || 0,
              is_active: values.status === 'active'
            });
          });
        }
      } else if (availableColors && availableColors.length > 0) {
        // Only colors, no sizes
        availableColors.forEach(color => {
          variants.push({
            color,
            price: values.price || 0,
            stock_quantity: values.stock_quantity || 0,
            is_active: values.status === 'active'
          });
        });
      }
      
      // Append all form fields
      Object.keys(values).forEach(key => {
        if (key !== 'available_sizes' && key !== 'available_colors') {
          formData.append(key, values[key]);
        }
      });
      
      // Append variants if any
      if (variants.length > 0) {
        formData.append('variants', JSON.stringify(variants));
      }

      // Append images
      // Append new images and track existing ones
      const existingImages: any[] = [];
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        } else {
          existingImages.push({
            id: file.uid,
            image_url: file.url
          });
        }
      });

      if (product) {
        formData.append('existing_images', JSON.stringify(existingImages));
      }

      if (product) {
        await productService.update(product.id, formData);
        message.success('Product updated successfully');
      } else {
        await productService.create(formData);
        message.success('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to save product';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={product ? 'Edit Product' : 'Add New Product'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={isMobile ? '95%' : 1000}
      confirmLoading={loading}
      centered
      style={{ top: isMobile ? 10 : 20 }}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        className="mt-4"
        initialValues={{
          stock_quantity: 0,
          status: 'active',
          is_on_sale: false
        }}
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.price !== undefined || changedValues.original_price !== undefined) {
            const price = allValues.price ? Number(allValues.price) : 0;
            const originalPrice = allValues.original_price ? Number(allValues.original_price) : 0;
            
            if (originalPrice > price && originalPrice > 0) {
              const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
              form.setFieldsValue({
                discount_percentage: discount,
                is_on_sale: true
              });
            } else {
              form.setFieldsValue({
                discount_percentage: 0,
                is_on_sale: false
              });
            }
          }
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. iPhone 15 Pro" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category">
                {categories
                  .filter(c => !c.parent_cat_id)
                  .map(parent => {
                    const subcats = categories.filter(c => c.parent_cat_id === parent.id);
                    if (subcats.length > 0) {
                      return (
                        <Select.OptGroup key={parent.id} label={parent.category_name.toUpperCase()}>
                          {subcats.map(sub => (
                            <Select.Option key={sub.id} value={sub.id}>{sub.category_name}</Select.Option>
                          ))}
                        </Select.OptGroup>
                      );
                    }
                    return (
                      <Select.Option key={parent.id} value={parent.id}>{parent.category_name}</Select.Option>
                    );
                  })
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Describe the product..." />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="price" label="Base Selling Price" rules={[{ required: true }]}>
              <InputNumber className="w-full" prefix="₹" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="original_price" label="Original (MRP) Price" rules={[{ required: true, message: 'Please enter original price' }]}>
              <InputNumber className="w-full" prefix="₹" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="discount_percentage" label="Discount %">
              <InputNumber className="w-full" min={0} max={100} formatter={value => `${value}%`} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true, message: 'Stock quantity is required' }]}>
              <InputNumber className="w-full" min={0} placeholder="Enter stock quantity" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="brand" label="Brand">
              <Input placeholder="e.g. KALIMGO" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="tags" label="Tags (Comma separated)">
              <Input placeholder="e.g. cotton, summer, premium" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Product Specifications</Divider>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="material" label="Material" rules={[{ required: true, message: 'Please enter material details' }]}>
              <Input placeholder="e.g. 100% Pure Organic Cotton" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="care_instructions" label="Care Instructions" rules={[{ required: true, message: 'Please enter care instructions' }]}>
              <Input placeholder="e.g. Machine Wash Cold / Dry Low" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="fit" label="Fit / Cut" rules={[{ required: true, message: 'Please enter fit details' }]}>
              <Input placeholder="e.g. Tailored Fit for Indian Standard Silhouette" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="country_of_origin" label="Country of Origin" rules={[{ required: true, message: 'Please enter country of origin' }]}>
              <Input placeholder="e.g. Crafted with Pride in India" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Available Sizes & Colors</Divider>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Available Sizes">
              <Select
                mode="tags"
                placeholder="Add sizes (M, L, XL, 2XL, etc.)"
                value={availableSizes}
                onChange={setAvailableSizes}
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              >
                <Select.Option value="XS">XS</Select.Option>
                <Select.Option value="S">S</Select.Option>
                <Select.Option value="M">M</Select.Option>
                <Select.Option value="L">L</Select.Option>
                <Select.Option value="XL">XL</Select.Option>
                <Select.Option value="2XL">2XL</Select.Option>
                <Select.Option value="3XL">3XL</Select.Option>
              </Select>
              <div className="mt-2">
                {availableSizes.map(size => (
                  <Tag 
                    key={size} 
                    closable 
                    onClose={() => setAvailableSizes(availableSizes.filter(s => s !== size))}
                    className="mb-1"
                  >
                    {size}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Available Colors">
              <Select
                mode="tags"
                placeholder="Add colors (Red, Blue, Black, etc.)"
                value={availableColors}
                onChange={setAvailableColors}
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              >
                <Select.Option value="Black">Black</Select.Option>
                <Select.Option value="White">White</Select.Option>
                <Select.Option value="Red">Red</Select.Option>
                <Select.Option value="Blue">Blue</Select.Option>
                <Select.Option value="Green">Green</Select.Option>
                <Select.Option value="Yellow">Yellow</Select.Option>
                <Select.Option value="Gray">Gray</Select.Option>
              </Select>
              <div className="mt-2">
                {availableColors.map(color => (
                  <Tag 
                    key={color} 
                    closable 
                    onClose={() => setAvailableColors(availableColors.filter(c => c !== color))}
                    className="mb-1"
                  >
                    {color}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} align="middle" className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
          <Col xs={12} sm={4}>
            <Form.Item name="is_featured" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Featured Item</span>} valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Item name="is_trending" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trending</span>} valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Item name="is_new_arrival" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Arrival</span>} valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Item name="is_on_sale" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">On Sale</span>} valuePropName="checked">
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Item name="status" label={<span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Listing Status</span>} valuePropName="checked" getValueFromEvent={(val) => val ? 'active' : 'inactive'} getValueProps={(val) => ({ checked: val === 'active' })}>
              <Switch checkedChildren="LIVE" unCheckedChildren="HIDDEN" defaultChecked />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Product Images</Divider>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
        >
          {fileList.length >= 6 ? null : (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload (Min 2, Max 6)</div>
            </div>
          )}
        </Upload>
      </Form>
    </Modal>
  );
};

export default ProductForm;
