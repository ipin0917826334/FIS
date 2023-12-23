import React ,{useState} from 'react';
import { Form, Input, Button,  Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const AddUser = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        console.log('User registered successfully');
        setIsModalVisible(true);
        // Optionally, you can redirect the user to another page or show a success message.
      } else {
        console.error('User registration failed');
        // Handle registration failure (show an error message, etc.).
      }
    } catch (error) {
      console.error('Error during user registration:', error);
    }
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
      <Modal
        title="User Added Successfully"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} 
      >
        <p>The user has been added successfully!</p>
      </Modal>
    </div>
  );
};

export default AddUser;
