import React, { useState, useEffect } from 'react';
import { Table, Pagination, Form, Input, Button, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const ViewSupplier = () => {
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
  const [filteredData, setFilteredData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id' },
    { title: 'Supplier Name', dataIndex: 'supplier_name', key: 'supplier_name', render: (text, record) => renderEditableCell(text, record, 'supplier_name') },
    { title: 'Supplier Location', dataIndex: 'location', key: 'location', render: (text, record) => renderEditableCell(text, record, 'location') },
    { title: 'Contract Details', dataIndex: 'email', key: 'email', render: (text, record) => renderEditableCell(text, record, 'email') },
    {
      title: 'Product Names',
      dataIndex: 'product_names',
      key: 'product_names'
    },
    { title: 'Created By', dataIndex: 'created_by', key: 'created_by' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', render: (text) => formatDateToLocal(text) },
    { title: 'Updated At', dataIndex: 'updated_at', key: 'updated_at', render: (text) => formatDateToLocal(text) },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
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
  const fetchProductNames = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/products-by-supplier/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data.join(', ');
      } else {
        console.error('Failed to fetch product names');
        return '';
      }
    } catch (error) {
      console.error('Error:', error);
      return '';
    }
  };
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token)
      const response = await fetch('http://localhost:5002/api/all-suppliers', {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        // Fetch product names for each supplier
        const dataWithKeys = await Promise.all(data.map(async (item) => {
          const productNames = await fetchProductNames(item.id);
          return { ...item, key: String(item.id), product_names: productNames };
        }));

        setDataSource(dataWithKeys);
        setResetDataSource(dataWithKeys);
        setFilteredData(dataWithKeys);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
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
      (item) =>
        item.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.created_by.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(filteredData);
    setPagination({ ...pagination, current: 1 });
  };

  const handleReset = () => {
    setDataSource(resetDataSource);
    setFilteredData(resetDataSource);
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
      const response = await fetch(`http://localhost:5002/api/update-supplier/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        fetchData();
        message.success('Supplier updated successfully');
        const updatedDataSource = dataSource.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        );
        setDataSource(updatedDataSource);
        setEditedValues({});
      } else {
        console.error('Failed to update supplier:', response.statusText);
        message.error('Failed to update supplier');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      message.error('Error updating supplier');
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
      const response = await fetch(`http://localhost:5002/api/delete-supplier/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        setDataSource((prevDataSource) => prevDataSource.filter((user) => user.id !== id));
        fetchData();
        message.success('Supplier deleted successfully');
      } else {
        console.error('Failed to delete supplier:', response.statusText);
        message.error('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error('Error deleting supplier');
    }
  };
  const exportCSV = () => {
    try {
      const csvData = dataSource.map(row => ({
        id: row.id,
        supplier_name: row.supplier_name,
        location: row.location,
        email: row.email,
        product_names: row.product_names,
        created_by: row.created_by,
        created_at: formatDateToLocal(row.created_at),
        updated_at: formatDateToLocal(row.updated_at)
      }));

      const csv = Papa.unparse(csvData, { header: true });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'suppliers.csv';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };



  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Supplier Name", "Location", "Email", "Product Names", "Created By", "Created At", "Updated At"];
    const tableRows = dataSource.map(item => [
      item.id,
      item.supplier_name,
      item.location,
      item.email,
      item.product_names,
      item.created_by,
      formatDateToLocal(item.created_at),
      formatDateToLocal(item.updated_at)
    ]);

    doc.text("Suppliers", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });
    doc.save("suppliers.pdf");
  };




  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">List of Suppliers ({dataSource.length})</h1>

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

      <Table dataSource={filteredData} columns={columns} pagination={pagination} onChange={(pagination) => setPagination(pagination)} className='overflow-x-auto' />
    </div>
  );
};

export default ViewSupplier;
