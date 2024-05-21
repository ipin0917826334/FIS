import React, { useState } from 'react';
import { Input } from 'antd';
import ProductCard from './productCard';

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

export default ProductList;
