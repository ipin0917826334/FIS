import React, { useState } from 'react';
import { Table, Pagination, Form, Input, Button, Space, Popconfirm, message } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ViewSupplier = () => {
  const [dataSource, setDataSource] = useState([
    { key: '1', supplier_name: 'John', location: 'Doe', email: 'john.doe@example.com', products: ["ProductA", "ProductB"], createdAt: '2023-01-01', updatedAt: '2023-01-02' },
    { key: '2', supplier_name: 'Jane', location: 'Doe', email: 'jane.doe@example.com', products: ["ProductC", "ProductD"], createdAt: '2023-01-03', updatedAt: '2023-01-04' },
    // Add more rows as needed
  ]);

  const [editKey, setEditKey] = useState(null);

  const columns = [
    { title: '#', dataIndex: 'key', key: 'key' },
    { title: 'Supplier Name', dataIndex: 'supplier_name', key: 'supplier_name', render: (text, record) => renderEditableCell(text, record, 'supplier_name') },
    { title: 'Supplier Location', dataIndex: 'location', key: 'location', render: (text, record) => renderEditableCell(text, record, 'location') },
    { title: 'Contract Details', dataIndex: 'email', key: 'email', render: (text, record) => renderEditableCell(text, record, 'email') },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      render: (text, record) => renderProductsCell(text, record, 'products'),
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          {editKey === record.key ? (
            <>
              <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleSave(record.key)}>
                Save
              </Button>
              <Button onClick={() => handleCancelEdit()}>Cancel</Button>
            </>
          ) : (
            <Button type="button" icon={<EditOutlined />} onClick={() => handleEdit(record.key)}>
              Edit
            </Button>
          )}
          <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.key)}>
            <Button danger type="danger" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const [form] = Form.useForm();
  const renderEditableCell = (text, record, dataIndex) => {
    const isEditing = editKey === record.key;
    return (
      <Form form={form} component={false} initialValues={{ [dataIndex]: text }}>
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `${dataIndex} is required.` }]}
        >
          {isEditing ? <Input /> : <div onClick={() => handleEdit(record.key)}>{text}</div>}
        </Form.Item>
      </Form>
    );
  };

  const renderProductsCell = (text, record, dataIndex) => {
    const isEditing = editKey === record.key;
    return (
      <Form form={form} component={false} initialValues={{ [dataIndex]: text.join(', ') }}>
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `${dataIndex} is required.` }]}
        >
          {isEditing ? <Input /> : <div onClick={() => handleEdit(record.key)}>{text.join(', ')}</div>}
        </Form.Item>
      </Form>
    );
  };

  const onFinish = values => {
    const searchTerm = values.search;
    if (!searchTerm) {
      // If the search term is empty, reset to the original data
      handleReset();
      return;
    }

    // Filter the data based on the search term
    const filteredData = dataSource.filter(
      item =>
        item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Update the state with the filtered data
    setDataSource(filteredData);
  };

  const handleReset = () => {
    // Reset the data to the original data source
    setDataSource([
        { key: '1', supplier_name: 'John', location: 'Doe', email: 'john.doe@example.com', products: ["ProductA", "ProductB"], createdAt: '2023-01-01', updatedAt: '2023-01-02' },
        { key: '2', supplier_name: 'Jane', location: 'Doe', email: 'jane.doe@example.com', products: ["ProductC", "ProductD"], createdAt: '2023-01-03', updatedAt: '2023-01-04' },
      // Add more rows as needed
    ]);
  };

  const handleEdit = key => {
    // Set the key of the row in edit mode
    setEditKey(key);
  };

  const handleSave = key => {
    // Implement the save functionality
    message.info(`Save user with key: ${key}`);
    // Reset edit key after saving
    setEditKey(null);
  };

  const handleCancelEdit = () => {
    // Reset edit key without saving
    setEditKey(null);
  };

  const handleDelete = key => {
    // Implement the delete functionality
    const updatedData = dataSource.filter(item => item.key !== key);
    setDataSource(updatedData);
    message.success('User deleted successfully!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">List of Suppliers</h1>

      <Form
        name="userFilter"
        onFinish={onFinish}
        layout="inline"
        style={{ marginBottom: '16px' }}
      >
        <Form.Item name="search">
          <Input placeholder="Search" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" ghost htmlType="submit">
            Search
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>

      <Table dataSource={dataSource} columns={columns} pagination={false} />

      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <span>{dataSource.length} SUPPLIERS</span>
      </div>

      <Pagination
        style={{ marginTop: '16px', textAlign: 'center' }}
        total={dataSource.length}
        pageSize={10}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      />
    </div>
  );
};

export default ViewSupplier;
