import React, { useState, useEffect } from 'react';
import { Table, Pagination, Form, Input, Button, Space, Popconfirm, message } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const ViewUser = () => {
  // const [dataSource, setDataSource] = useState([
  //   { key: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-02' },
  //   { key: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', createdAt: '2023-01-03', updatedAt: '2023-01-04' },
  // ]);
  const formatDateToLocal = (dateString) => {
    return moment(dateString).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'); // Adjust the timezone as needed
  };
  const [editKey, setEditKey] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [resetDataSource, setResetDataSource] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const columns = [
    { title: 'First Name', dataIndex: 'first_name', key: 'first_name', render: (text, record) => renderEditableCell(text, record, 'first_name') },
    { title: 'Last Name', dataIndex: 'last_name', key: 'last_name', render: (text, record) => renderEditableCell(text, record, 'last_name') },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text, record) => renderEditableCell(text, record, 'email') },
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
        const response = await fetch('http://localhost:5000/api/all-users', {
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
          console.error('Failed to fetch users');
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
        item.first_name.toLowerCase().includes(search.toLowerCase()) ||
        item.last_name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
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
      const response = await fetch(`http://localhost:5000/api/update-user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        message.success('User updated successfully');
        const updatedDataSource = dataSource.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item
        );
        setDataSource(updatedDataSource);
        setEditedValues({});
      } else {
        console.error('Failed to update user:', response.statusText);
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Error updating user');
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
      const response = await fetch(`http://localhost:5000/api/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        setDataSource((prevDataSource) => prevDataSource.filter((user) => user.id !== id));
        message.success('User deleted successfully');
      } else {
        console.error('Failed to delete user:', response.statusText);
        message.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Error deleting user');
    }
  };
  const exportCSV = () => {
    const csvData = dataSource.map(row => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      created_at: formatDateToLocal(row.created_at),
      updated_at: formatDateToLocal(row.updated_at)
    }));

    const csv = Papa.unparse(csvData, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "First Name", "Last Name", "Email", "Created At", "Updated At"];
    const tableRows = dataSource.map(item => [
      item.id,
      item.first_name,
      item.last_name,
      item.email,
      formatDateToLocal(item.created_at),
      formatDateToLocal(item.updated_at)
    ]);

    doc.text("Users", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });
    doc.save("users.pdf");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 pt-10">List of Users ({dataSource.length})</h1>

      <Form
        name="userFilter"
        onFinish={onFinish}
        layout="inline"
        style={{ marginBottom: '16px' }}
      >
        <Form.Item name="search">
          <Input placeholder="Search" prefix={<UserOutlined />} />
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
        <span>{dataSource.length} USERS</span>
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

export default ViewUser;
