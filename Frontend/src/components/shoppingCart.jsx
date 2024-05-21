import React from 'react';
import { Table, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const ShoppingCart = ({ cart, onRemoveFromCart, onCheckout }) => {
  const columns = [
    { 
      title: 'Image', 
      dataIndex: 'product_image', 
      key: 'product_image', 
      render: (text, record) => (
        <img src={`http://localhost:5002/uploads/${text}`} alt={record.product_name} className='rounded-md' style={{ minWidth: '75px', minHeight: '75px', width: '75px', height: '75px' }} />
      ) 
    },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => (parseFloat(record.price) * record.quantity).toFixed(2),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="danger" icon={<DeleteOutlined />} onClick={() => onRemoveFromCart(record)}>
          Remove
        </Button>
      ),
    },
  ];

  const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">Cart ({cart.length})</h1>
      <Table dataSource={cart} columns={columns} pagination={false} style={{ overflowX: 'auto' }} />
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <span>Total Price: {totalPrice.toFixed(2)} Baht</span>
        <Button type="primary" style={{ marginLeft: '8px' }} onClick={onCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default ShoppingCart;
