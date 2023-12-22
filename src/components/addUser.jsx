import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const AddUser = () => {
  const onFinish = values => {
    console.log('Received values of form: ', values);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">Create User</h1>
      <Form
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        className="mt-10"
        labelCol={{ span: 24 }}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'Please enter your first name!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'Please enter your last name!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: 'The input is not a valid email!' },
            { required: true, message: 'Please enter your email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item >
            <div className='flex justify-center items-center'>
          <Button type="primary" ghost htmlType="submit">
            Add User
          </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddUser;
