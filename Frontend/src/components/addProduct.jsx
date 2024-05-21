import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';


const AddProduct = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5002/api/all-suppliers', {
          method: 'GET',
          headers: {
            Authorization: token,
          },
        });
        if (response.ok) {
          const suppliers = await response.json();
          setSupplierOptions(suppliers.map((supplier) => ({ value: supplier.id, label: supplier.supplier_name })));
        } else {
          console.error('Failed to fetch suppliers');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('product_name', values.product_name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('supplier_id', values.supplier_id);
      formData.append('product_stock', values.product_stock);
      formData.append('product_image', values.product_image[0].originFileObj);
      
      const response = await fetch('http://localhost:5002/api/add-product', {
        method: 'POST',
        headers: {
          Authorization: token,
        },
        body: formData,
      });
  
      if (response.ok) {
        console.log('Add Product successfully');
        setIsModalVisible(true);
      } else {
        console.log(values.supplier)
        console.error('Add Product failed');
      }
    } catch (error) {
      console.error('Error during add product:', error);
    }
  };
  

  const handleFileUpload = (file) => {
    console.log('Uploaded file:', file);
    message.success(`${file.name} file uploaded successfully`);
  };
 const validateProductImage = (_, fileList) => {
    if (fileList.length === 0) {
      return Promise.reject('Please upload a product image');
    } else {
      return Promise.resolve();
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">Create Product</h1>
      <Form
        name="register"
        onFinish={onFinish}
        encType="multipart/form-data"
        scrollToFirstError
        className="mt-10"
        labelCol={{ span: 24 }}
      >
        <Form.Item
          label="Product Name"
          name="product_name"
          rules={[{ required: true, message: 'Please enter Product name!' }]}
        >
          <Input placeholder="Product Name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter description!' }]}
        >
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please enter price!' }]}
        >
          <Input placeholder="Price" />
        </Form.Item>

        <Form.Item
          label="Supplier"
          name="supplier_id"
          rules={[{ required: true, message: 'Please select a supplier!' }]}
        >
          <Select placeholder="Select Supplier" options={supplierOptions} />
        </Form.Item>
        <Form.Item
          label="Product Stock"
          name="product_stock"
          rules={[{ required: true, message: 'Please enter Product Stock!' }]}
        >
          <Input type="number" placeholder="Product Stock" />
        </Form.Item>

        <Form.Item
          label="Product Image"
          name="product_image"
          valuePropName="fileList"
          getValueFromEvent={(e) => e && e.fileList}
          rules={[
            {
              validator: validateProductImage,
            },
          ]}
        >
          <Upload
            name="product_image"
            action="http://localhost:5002/api/add-product"
            listType="picture"
            beforeUpload={() => false}
            onChange={(info) => handleFileUpload(info.file)}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <div className="flex justify-center items-center">
            <Button type="primary" ghost htmlType="submit">
              Create Product
            </Button>
          </div>
        </Form.Item>
      </Form>
      <Modal
        title="Product Added Successfully"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>The product has been added successfully!</p>
      </Modal>
    </div>
  );
};

export default AddProduct;
