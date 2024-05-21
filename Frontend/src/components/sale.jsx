import React, { useState, useEffect } from 'react';
import { Button, message, Modal, Badge, } from 'antd';
import { ShoppingCartOutlined, } from '@ant-design/icons';
import ProductList from './productList';
import ShoppingCart from './shoppingCart';

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