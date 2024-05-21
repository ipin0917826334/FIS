import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Card, Row, Col, Modal } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
const { Option } = Select;

const CreateOrder = () => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([{ key: `item_${new Date().getTime()}`, productId: '', quantity: 1 }]);
  const token = localStorage.getItem('token');
  const [isModalVisible, setIsModalVisible] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('http://localhost:5002/api/all-products', {
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, [token]);

  const handleProductChange = (productId, key) => {
    const newOrderItems = orderItems.map(item =>
      item.key === key ? { ...item, productId: productId } : item
    );
    setOrderItems(newOrderItems);
  };

  const handleQuantityChange = (quantity, key) => {
    const newOrderItems = orderItems.map(item =>
      item.key === key ? { ...item, quantity: quantity } : item
    );
    setOrderItems(newOrderItems);
  };

  const handleRemoveItem = (key) => {
    const newOrderItems = orderItems.filter(item => item.key !== key);
    setOrderItems(newOrderItems);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { key: `item_${new Date().getTime()}`, productId: '', quantity: 1 }]);
  };

  const submitOrder = async () => {
    try {
      const filteredOrderItems = orderItems.filter(item => item.productId && item.quantity > 0);

      if (filteredOrderItems.length === 0) {
        alert("Please add at least one product to the order.");
        return;
      }

      const response = await fetch('http://localhost:5002/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ orderItems: filteredOrderItems.map(item => ({ productId: item.productId, quantity: item.quantity })) }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsModalVisible(true);
      }
      else {
        console.error('Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert("There was an error submitting the order.");
    }
  };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">Create Order</h1>
      <Card bordered={false}>
        <Form onFinish={submitOrder} layout="vertical">
          {orderItems.map((item) => (
            <Row key={item.key} gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={10} lg={10} xl={10}>
                <Form.Item
                  label="Product Name"
                  name={`productName_${item.key}`}
                >
                  <Select
                    value={item.productId}
                    onChange={(value) => handleProductChange(value, item.key)}
                    placeholder="Select a product"
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>{product.product_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={8} sm={6} md={5} lg={3} xl={2}>
                <Form.Item
                  label="Quantity"
                  name={`quantity_${item.key}`}
                >
                  <InputNumber
                    // min={1}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(value, item.key)}
                  />
                </Form.Item>
              </Col>
              <Col xs={8} sm={6} md={2} lg={6} xl={1} className="remove-button">
                <Button danger ghost style={{ border: 'none', boxShadow: 'none' }} onClick={() => handleRemoveItem(item.key)} icon={<MinusCircleOutlined />} />

              </Col>
            </Row>
          ))}
          <Form.Item>
            <Button onClick={addOrderItem} type="dashed" block icon={<PlusOutlined />}>
              Add Another Product
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block
              disabled={orderItems.length === 0 || orderItems.some(item => !item.productId)}>
              Submit Order
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Modal
        title="Order Added Successfully"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>The order has been added successfully!</p>
      </Modal>
    </div>
  );
};

export default CreateOrder;