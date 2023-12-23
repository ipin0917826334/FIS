import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const AddSupplier = () => {
  const onFinish = values => {
    console.log('Received values of form: ', values);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">Create Supplier</h1>
      <Form
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        className="mt-10"
        labelCol={{ span: 24 }}
      >
        <Form.Item
          label="Supplier  Name"
          name="supplier_name"
          rules={[{ required: true, message: 'Please enter Supplier name!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Supplier Name" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter Supplier location!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Supplier Location" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: 'The input is not a valid email!' },
            { required: true, message: 'Please enter Supplier email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Supplier Email" />
        </Form.Item>

        <Form.Item >
            <div className='flex justify-center items-center'>
          <Button type="primary" ghost htmlType="submit">
            Create Supplier
          </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddSupplier;
