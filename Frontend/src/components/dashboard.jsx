import React, { useState, useEffect } from 'react';
import { Row, Col, Select } from 'antd';
import LineChart from './Line';
import PieChart from './Pie';
import LinePlot from './LinePlot';
import SupplierProductLineChart from './LineProduct';

const { Option } = Select;

const DashBoard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const response = await fetch('http://localhost:5002/api/all-suppliers', {
      method: 'GET',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setSuppliers(data);
  };

  const handleChange = (value) => {
    setSelectedSupplier(value);
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <PieChart />
        </Col>
        <Col span={12}>
          {selectedSupplier ? (
            <SupplierProductLineChart supplierId={selectedSupplier} />
          ) : (
            <LineChart />
          )}
          <div className='ml-[30%]' style={{ display: 'flex' }}>
            <h2 className='mt-1'>Select Supplier: </h2>
        <Select
            style={{ width: 200, display: 'flex', justifyContent: 'space-between' }}
            className='ml-[2%]'
            placeholder="Select a supplier"
            value={selectedSupplier}
            onChange={handleChange}
            allowClear
          >
            <Option key="default" value="">All Suppliers (Default)</Option>
            {suppliers.map(supplier => (
              <Option key={supplier.id} value={supplier.id}>{supplier.supplier_name}</Option>
            ))}
          </Select>
          </div>
        </Col>
        <Col span={24}>
          <LinePlot supplierId={selectedSupplier} />
        </Col>
      </Row>
    </div>
  );
};

export default DashBoard;
