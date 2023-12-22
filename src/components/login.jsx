import React from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate = useNavigate();
  const onFinish = values => {
    console.log('Received values of form: ', values);
    navigate(`/dashboard`);
  };
  return (
    <>
   <div
      className="flex h-screen w-screen bg-white justify-center items-center flex-col"
      style={{
        backgroundImage: "url('https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/BgrICs-NZj4hksnn3/videoblocks-organic-and-natural-mix-of-fruits-on-yellow-background-zoom-out-dolly-4k-footage_suiamf2sx_thumbnail-1080_01.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className='text-9xl'>FIS</h1>
      <h1 className='text-5xl mb-10'>Fruit Inventory System</h1>
      <div className='login-form rounded-md bg-white bg-opacity-60'>
<Form
      name="normal_login"
      className=""
      initialValues={{ 
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label="Username"
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: 'Please input your Username!',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" ghost className="login-form-button bg-blue">
          Log in
        </Button>
      </Form.Item>
    </Form>
    </div>
    </div>
    </>
  );
};

export default Login;