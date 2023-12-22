import React from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
// import SideBar from './sidebar';

const CreateOrder = () => {
  const onFinish = values => {
    console.log('Received values of form: ', values);
  };

  return (
    <>
      <div className="flex items-center justify-center bg-emerald-500 w-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">CO</h1>
          <p className="text-gray-600">Your paragraph goes here. Add any content you want.</p>
        </div>
      </div>
    </>
  );
};

export default CreateOrder;
