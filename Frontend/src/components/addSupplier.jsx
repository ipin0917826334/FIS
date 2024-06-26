import React ,{useState} from 'react';
import { Form, Input, Button,  Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const AddSupplier = ({ userDetails }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onFinish = async (values) => {
    try {
      console.log(userDetails.id)
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/add-supplier', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...values }),
      });

      if (response.ok) {
        console.log('Add Supplier successfully');
        setIsModalVisible(true);
      } else {
        console.error('Add Supplier failed');
      }
    } catch (error) {
      console.error('Error during add supplier:', error);
    }
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
          <Input placeholder="Supplier Name" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter Supplier location!' }]}
        >
          <Input placeholder="Supplier Location" />
        </Form.Item>

        <Form.Item
          label="Contract"
          name="email"
          // rules={[
          //   { type: 'email', message: 'The input is not a valid email!' },
          //   { required: true, message: 'Please enter Supplier email!' },
          // ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Supplier Contract" />
        </Form.Item>

        <Form.Item >
            <div className='flex justify-center items-center'>
          <Button type="primary" ghost htmlType="submit">
            Create Supplier
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
        <p>The Supplier has been added successfully!</p>
      </Modal>
    </div>
  );
};

export default AddSupplier;
