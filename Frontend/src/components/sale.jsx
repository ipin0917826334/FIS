import React, { useState, useEffect } from 'react';
import { Card, Button, InputNumber, Space, message, Modal, Table, Typography, Badge, Input } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons';
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
              )
            }
        </Card>
    );
};

const ProductList = ({ products, onAddToCart }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const filteredProducts = products.filter(
        (product) =>
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.created_by.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 pt-10">List of Products ({products.length})</h1>

            <Input
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: '16px', maxWidth: '250px', width: '100%' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: "center" }}>
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
            </div>
        </div>
    );
};

const ShoppingCart = ({ cart, onRemoveFromCart, onCheckout }) => {
    const columns = [
        { title: 'Image', dataIndex: 'product_image', key: 'product_image', render: (text, record) => <img src={`http://localhost:5002/uploads/${text}`} alt={record.product_name} className='rounded-md' style={{ minWidth: '75px', minHeight: '75px', width: '75px', height: '75px' }} /> },
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
const Sale = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Updated cart:', cart);
    }, [cart]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5002/api/all-products', {
                    method: 'GET',
                    headers: {
                        Authorization: token,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    console.error('Failed to fetch products');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, []);

    const handleAddToCart = (product) => {
        console.log('Adding to cart:', product);
        const existingProduct = cart.find((item) => item.id === product.id);

        if (existingProduct) {
            setCart(
                cart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
                )
            );
        } else {
            setCart([...cart, { ...product }]);
        }
    };

    const handleRemoveFromCart = (product) => {
        console.log('Removing from cart:', product);
        setCart(cart.filter((item) => item.id !== product.id));
    };

    const handleCheckout = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5002/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify(cart),
            });

            if (response.ok) {
                const updatedProducts = products.map((product) => {
                    const cartProduct = cart.find((cartItem) => cartItem.id === product.id);
                    if (cartProduct) {
                        return {
                            ...product,
                            product_stock: Math.max(product.product_stock - cartProduct.quantity, 0),
                        };
                    }
                    return product;
                });

                setProducts(updatedProducts);

                setCart([]);
                setVisible(false);
                message.success('Checkout successful');
            } else {
                console.error('Failed to checkout');
                message.error('Checkout failed');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            message.error('Error during checkout');
        }
    };


    return (
        <div className='flex'>
            <ProductList products={products} onAddToCart={handleAddToCart} />
            <Badge count={cart.length} className="mr-5" size="default">
                <Button type="primary" icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} onClick={() => setVisible(true)} style={{ fontSize: '16px', width: "35px", height: "35px", marginBottom: "4rem" }}>
                </Button>
            </Badge>
            <Modal
                title="Cart"
                visible={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                width={800}
            >
                <ShoppingCart cart={cart} onRemoveFromCart={handleRemoveFromCart} onCheckout={handleCheckout} />
            </Modal>
        </div>

    );
};

export default Sale;