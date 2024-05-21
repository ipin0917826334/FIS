import React, { useState } from 'react';
import { Card, InputNumber, Space, message, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    message.success('Product added to cart');
  };

  return (
    <Card
      hoverable
      style={{
        width: 300,
        marginBottom: 16,
        borderRadius: 10,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
        backgroundColor: 'white',
      }}
    >
      <img
        alt={product.product_name}
        src={`http://localhost:5002/uploads/${product.product_image}`}
        style={{ width: '100%', height: 200 }}
      />
      <div className='mt-5'>
        <Meta
          title={<h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{product.product_name}</h2>}
          description={<h2 style={{ fontSize: '1.0rem', marginBottom: '0.5rem' }}>Desc: {product.description}</h2>}
        />
        <Text strong style={{ fontSize: '1.0rem' }}>
          Price: {product.price} Baht
        </Text>
        <div>
          <Text strong style={{ fontSize: '1.0rem' }}>
            In stock: {product.product_stock} qty.
          </Text>
        </div>
      </div>
      {product.product_stock === 0 ? (
        <div>
          <p style={{ color: 'red' }}>Out of Stock</p>
        </div>
      ) : (
        <div style={{ padding: 16, color: 'rgba(0, 0, 0, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Space align="center">
              <InputNumber min={1} value={quantity} onChange={(value) => setQuantity(value)} />
              <Button classNametype="primary" onClick={handleAddToCart}>
                <div className='flex mb-0'>
                  <PlusOutlined />
                </div>
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
