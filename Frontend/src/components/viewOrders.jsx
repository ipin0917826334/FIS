import React, { useState, useEffect } from 'react';
import { Table, message, Form, Button, Input } from 'antd';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchOutlined } from '@ant-design/icons';
const ViewOrders = () => {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders-by-batch', {
          headers: {
            Authorization: token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        } else {
          message.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        message.error('An error occurred while fetching orders');
      }
    };

    fetchOrders();
  }, []);
  const filteredBatches = searchTerm
    ? Object.entries(batches).filter(([batchNumber]) =>
      batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : Object.entries(batches);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };
  const formatDateToLocal = (dateString) => {
    return moment(dateString).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  };
  const formatDateToLocalDateOnly = (dateString) => {
    return moment(dateString).tz('Asia/Bangkok').format('YYYY-MM-DD');
  };
  const columns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Demand', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Leadtime (Day)', dataIndex: 'lead_time', key: 'lead_time' },
    {
      title: 'Received Date',
      dataIndex: 'received_date',
      key: 'received_date',
      render: (text) => formatDateToLocalDateOnly(text),
    },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Ordered By', dataIndex: 'ordered_by', key: 'ordered_by' },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDateToLocal(text),
    },
  ];
  const exportCSV = () => {
    const allOrders = Object.values(batches).flat();
    const csvData = allOrders.map(order => ({
      product_name: order.product_name,
      quantity: order.quantity,
      lead_time: order.lead_time,
      received_date: formatDateToLocalDateOnly(order.received_date),
      supplier: order.supplier,
      ordered_by: order.ordered_by,
      created_at: formatDateToLocal(order.created_at)
    }));

    const csv = Papa.unparse(csvData, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.csv';
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Product", "Demand", "Leadtime (Day)", "Received Date", "Supplier", "Ordered By", "Created Date"];

    let startY = 20;

    Object.entries(batches).forEach(([batchNumber, orders], index) => {
      doc.text(`Batch #: ${batchNumber}`, 14, startY);

      startY += 10;

      const tableRows = orders.map(order => [
        order.product_name,
        order.quantity,
        order.lead_time,
        formatDateToLocalDateOnly(order.received_date),
        order.supplier,
        order.ordered_by,
        formatDateToLocal(order.created_at)
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'grid',
        didDrawPage: (data) => {
          startY = data.cursor.y;
        }
      });

      startY += 10;
    });

    doc.save("orders.pdf");
  };


  return (
    <>
      <h1 className="text-2xl font-bold mb-10 pt-10">Delivery List ({filteredBatches.length})</h1>
      <Form
        name="batchSearch"
        layout="inline"
        style={{ marginBottom: '16px' }}
      >
        <Form.Item name="search">
          <Input
            placeholder="Search by batch"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
          />
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
      <div className="container mx-auto px-4">
        {filteredBatches.map(([batchNumber, ordersInBatch]) => (
          <div key={batchNumber} className="mb-8 p-4 rounded-lg shadow-lg bg-white">
            <h2 className="text-lg font-semibold border-b-2 border-gray-200 pb-2 mb-4">
              Batch #: {batchNumber}
            </h2>
            <Table
              dataSource={ordersInBatch.map((order, index) => ({
                ...order,
                key: index,
              }))}
              columns={columns}
              pagination={false}
              className="min-w-full overflow-x-auto"
            />
          </div>
        ))}
      </div>
    </>
  );
  
};

export default ViewOrders;
