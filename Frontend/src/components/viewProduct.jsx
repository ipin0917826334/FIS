import React, { useState, useEffect } from 'react';
import { Table, Pagination, Form, Input, Button, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const ViewProduct = () => {
  // const [dataSource, setDataSource] = useState([
  //   { key: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-02' },
  //   { key: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', createdAt: '2023-01-03', updatedAt: '2023-01-04' },
  // ]);
  const formatDateToLocal = (dateString) => {
    return moment(dateString).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  };
  const [editKey, setEditKey] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [resetDataSource, setResetDataSource] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const columns = [
    { title: '#', dataIndex: 'id', key: 'id' },
    { title: 'Image', dataIndex: 'product_image', key: 'product_image', render: (text, record) => <img src={`http://localhost:5002/uploads/${text}`} alt={record.product_name} className='rounded-md' style={{ width: '100px', height: 'auto' }} /> },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name', render: (text, record) => renderEditableCell(text, record, 'product_name') },
    { title: 'Stock', dataIndex: 'product_stock', key: 'product_stock', render: (text, record) => renderEditableCell(text, record, 'product_stock') },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (text, record) => renderEditableCell(text, record, 'description') },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (text, record) => renderEditableCell(text, record, 'price') },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Created By', dataIndex: 'created_by', key: 'description' },

    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', render: (text) => formatDateToLocal(text) },
    { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at', render: (text) => formatDateToLocal(text) },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          {editKey === record.id ? (
            <>
              <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleSave(record.id)}>
                Save
              </Button>
              <Button onClick={() => handleCancelEdit()}>Cancel</Button>
            </>
          ) : (
            <Button type="button" icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
              Edit
            </Button>
          )}
          <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button danger type="danger" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(token)
        const response = await fetch('http://localhost:5002/api/all-products', {
          method: 'GET',
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Add 'key' property to each item
          const dataWithKeys = data.map((item) => ({ ...item, key: String(item.id) }));

          setDataSource(dataWithKeys);
          setResetDataSource(dataWithKeys);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const [form] = Form.useForm();
  const renderEditableCell = (text, record, dataIndex) => {
    const isEditing = editKey === record.id;

    const handleChange = (value) => {
      setEditedValues((prevValues) => ({
        ...prevValues,
        [record.id]: {
          ...prevValues[record.id],
          [dataIndex]: value,
        },
      }));
    };

    return (
      <div>
        {isEditing ? (
          <Input
            value={editedValues[record.id]?.[dataIndex] || text}
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : (
          <div onClick={() => handleEdit(record.id)}>
            {editedValues[record.id]?.[dataIndex] !== undefined
              ? editedValues[record.id]?.[dataIndex]
              : text}
          </div>
        )}
      </div>
    );
  };


  const [searchTerm, setSearchTerm] = useState('');
  const onFinish = values => {
    const { search } = values;
    setSearchTerm(search);

    const filteredData = resetDataSource.filter(
      item =>
        item.product_name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase()) ||
        item.created_by.toLowerCase().includes(search.toLowerCase())
    );

    setDataSource(filteredData);
  };

  const handleReset = () => {
    setDataSource(resetDataSource);
    setSearchTerm('');
  };

  const handleEdit = (id) => {
    setEditKey(id);
    setEditedValues((prevValues) => ({
      ...prevValues,
      [id]: { ...dataSource.find((user) => user.id === id) },
    }));
  };

  const handleSave = async (id) => {
    try {
      const updatedData = editedValues[id];
      if (!updatedData) {
        setEditKey(null);
        setEditedValues({}); 
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/update-product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        message.success('Product updated successfully');
        const updatedDataSource = dataSource.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        );
        setDataSource(updatedDataSource);
        setEditedValues({});
      } else {
        console.error('Failed to update product:', response.statusText);
        message.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('Error updating product');
    } finally {
      setEditKey(null);
    }
  };



  const handleCancelEdit = () => {
    setEditKey(null);
    setEditedValues({});
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/delete-product/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        setDataSource((prevDataSource) => prevDataSource.filter((user) => user.id !== id));
        message.success('Product deleted successfully');
      } else {
        console.error('Failed to delete product:', response.statusText);
        message.error('Failed to delete product because it use this product in orders');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Error deleting product');
    }
  };
  const exportCSV = () => {
    const csvData = dataSource.map(row => ({
      id: row.id,
      product_name: row.product_name,
      product_stock: row.product_stock,
      description: row.description,
      price: row.price,
      supplier: row.supplier,
      created_by: row.created_by,
      created_at: formatDateToLocal(row.created_at),
      updated_at: formatDateToLocal(row.updated_at)
    }));

    const csv = Papa.unparse(csvData, { header: true });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Product Name", "Stock", "Description", "Price", "Supplier", "Created By", "Created At", "Updated At"];
    const tableRows = dataSource.map(item => [
      item.id,
      item.product_name,
      item.product_stock,
      item.description,
      item.price,
      item.supplier,
      item.created_by,
      formatDateToLocal(item.created_at),
      formatDateToLocal(item.updated_at)
    ]);

    doc.text("Products", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });
    doc.save("products.pdf");
  };




  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">List of Products ({dataSource.length})</h1>

      <Form
        name="userFilter"
        onFinish={onFinish}
        layout="inline"
        style={{ marginBottom: '16px' }}
      >
        <Form.Item name="search">
          <Input placeholder="Search" prefix={<SearchOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" ghost htmlType="submit">
            Search
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="default" onClick={handleReset}>
            Reset
          </Button>
        </Form.Item>
        <Form.Item>
          <Button danger onClick={exportCSV} type="primary">
            Export CSV
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={exportPDF} type="primary">
            Export PDF
          </Button>
        </Form.Item>

      </Form>

      <Table dataSource={dataSource} columns={columns} pagination={false} className='overflow-x-auto' />

      {/* <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <span>{dataSource.length} PRODUCTS</span>
      </div> */}

      <Pagination
        style={{ marginTop: '16px', textAlign: 'center' }}
        total={dataSource.length}
        pageSize={10}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
      />
    </div>
  );
};

export default ViewProduct;
