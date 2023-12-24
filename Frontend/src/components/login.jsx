import React, { useEffect , useState} from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox,message   } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = ({setUserDetails}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log(data.token)
        // Fetch user details after successful login
        const userDetailsResponse = await fetch('http://localhost:5000/api/user-details', {
          method: 'GET',
          headers: {
            Authorization: `${data.token}`,
          },
        });

        if (userDetailsResponse.ok) {
          const userDetails = await userDetailsResponse.json();
          setUserDetails(userDetails);
          navigate('/dashboard');
        } else {
          message.error('Failed to fetch user details');
        }
      } else {
      message.error('Incorrect Email or Passowrd');
      }
    } catch (error) {
      message.error('Login failed');
    }

    setLoading(false);
  };
  // useEffect(() => {
  //  setIsHide(true);
  // }, []);
  const onFinishFailed = (errorInfo) => {
    console.error('Failed:', errorInfo);
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
      <div className='p-10 rounded-md bg-white bg-opacity-60'>
<Form
      name="normal_login"
      className=""
      initialValues={{ 
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        name="email"
        label="Email"
        labelCol={{ span: 24 }}
        rules={[
          {
            required: true,
            message: 'Please input your email!',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
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

      <Form.Item className='flex justify-center items-center'>
        <Button type="primary" htmlType="submit" ghost className="login-form-button bg-blue ">
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