import React, { useState } from 'react';
import { Table, Pagination, Form, Input, Button, Space, Popconfirm, message } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ViewUser = () => {
  const [dataSource, setDataSource] = useState([
    { key: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-02' },
    { key: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', createdAt: '2023-01-03', updatedAt: '2023-01-04' },
    // Add more rows as needed
  ]);

  const [editKey, setEditKey] = useState(null);

  const columns = [
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName', render: (text, record) => renderEditableCell(text, record, 'firstName') },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', render: (text, record) => renderEditableCell(text, record, 'lastName') },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text, record) => renderEditableCell(text, record, 'email') },
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
      {/* Use component={false} to prevent automatic rendering of Form.Item */}
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

  const onFinish = values => {
    const searchTerm = values.search;
    // Filter the data based on the search term
    const filteredData = dataSource.filter(
      item =>
        item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Update the state with the filtered data
    setDataSource(filteredData);
  };

  const handleReset = () => {
    // Reset the data to the original data source
    setDataSource([
      { key: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-02' },
      { key: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', createdAt: '2023-01-03', updatedAt: '2023-01-04' },
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
      <h1 className="text-2xl font-bold mb-4 pt-10">List of Users</h1>

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

      <Table dataSource={dataSource} columns={columns} pagination={false} className='overflow-x-auto'/>

      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <span>{dataSource.length} USERS</span>
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

export default ViewUser;
