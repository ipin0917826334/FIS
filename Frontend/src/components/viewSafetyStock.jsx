import React, { useState, useEffect } from 'react';
import { Table, message, Form, Button, Input, Modal } from 'antd';
import moment from 'moment-timezone';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SearchOutlined } from '@ant-design/icons';
const ViewSafetyStock = () => {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editKey, setEditKey] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [status, setStatus] = useState();
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const fetchDeliveryHistory = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/order-items-history/${itemId}`, {
        headers: {
          'Authorization': token,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliveryHistory(data);
      } else {
        message.error('Failed to fetch delivery history');
      }
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      message.error('An error occurred while fetching delivery history');
    }
  };
  
  const handleShowDeliveryHistory = (itemId) => {
    setCurrentRecordId(itemId);
    fetchDeliveryHistory(itemId);
    setIsModalVisible(true);
  };

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



  const updateOrderItem = async (itemId, qtyReceived) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/update-order-item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ qty_received: qtyReceived }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setStatus(data.status);
      return { qtyReceived: qtyReceived, status: data.status };
    } catch (error) {
      console.error('Error updating order item:', error);
      message.error('Failed to update order item');
      throw error;
    }
  };

  const handleEdit = (record) => {
    setEditKey(record.id);
    setEditedValues({ ...editedValues, [record.id]: record.quantity_received });
  };



  const handleCancel = () => {
    setEditKey(null);
    setEditedValues({});
  };

  const handleSave = async (record) => {
    const currentQtyReceived = record.quantity_received;
    const updatedQtyReceived = editedValues[record.id];

    const currentQtyNum = parseInt(currentQtyReceived, 10);
    const updatedQtyNum = parseInt(updatedQtyReceived, 10);

    if (updatedQtyNum === currentQtyNum) {
      message.info('No changes detected. No update needed.');
      return;
    }

    if (updatedQtyNum < currentQtyNum) {
      message.error('Quantity received cannot decrease. Please enter a value greater than current quantity.');
      return;
    }

    try {
      const { qtyReceived, status } = await updateOrderItem(record.id, updatedQtyNum);

      const newBatches = { ...batches };
      for (const [batchNumber, orders] of Object.entries(newBatches)) {
        orders.forEach(order => {
          if (order.id === record.id) {
            order.quantity_received = qtyReceived;
            order.status = status;
          }
        });
      }

      setBatches(newBatches);

      setEditKey(null);
      setEditedValues({});
      message.success('Order item updated successfully');
    } catch (error) {
      console.error('Error updating order item:', error);
      message.error('Failed to update order item');
    }
  };



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
  const handleUpdate = (record) => {
    const qtyReceived = parseInt(record.quantity_received);
    const qtyOrders = parseInt(record.quantity);

    if (qtyReceived >= qtyOrders) {
      record.status = 'complete';
    } else {
      record.status = record.status;
    }
    updateOrderItem(record.id, qtyReceived, record.status);
  };
  const statusStyles = {
    complete: {
      backgroundColor: '#88AB8D',
      color: 'white',
      padding: '6px',
      borderRadius: '6px',
      textAlign: 'center',
    },
    incomplete: {
      backgroundColor: '#ff4d4f',
      color: 'white',
      padding: '6px',
      borderRadius: '6px',
      textAlign: 'center',
    },
    pending: {
      backgroundColor: 'gray',
      color: 'white',
      padding: '6px',
      borderRadius: '6px',
      textAlign: 'center',
    },
  };
  
  const getStatusStyle = (status) => {
    return statusStyles[status] || {};
  };
  const deliveryHistoryColumns = [
    { title: 'Previous Quantity Received', dataIndex: 'previous_quantity_received', key: 'previous_quantity_received' },
    { title: 'New Quantity Received', dataIndex: 'new_quantity_received', key: 'new_quantity_received' },
    { title: 'Quantity Delivered', dataIndex: 'quantity_delivered', key: 'quantity_delivered' },
    { title: 'Received Date', dataIndex: 'received_date', key: 'received_date', render: (text) => formatDateToLocal(text) },
  ];
  const columns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Qty_Orders', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Qty_Received',
      dataIndex: 'quantity_received',
      key: 'quantity_received',
      render: (text, record) => {
        const isEditing = record.id === editKey;
        return isEditing ? (
          <Input
            value={editedValues[record.id]}
            onChange={(e) => {
              const newEditedValues = { ...editedValues };
              newEditedValues[record.id] = e.target.value;
              setEditedValues(newEditedValues);
            }}
          />
        ) : (
          <div onDoubleClick={() => handleEdit(record)}>{text}</div>
        );
      },
    },
    { title: 'Leadtime (Day)', dataIndex: 'lead_time', key: 'lead_time' },
    {
      title: 'Safetystock',
      dataIndex: 'safety_stock',
      key: 'safety_stock',
    },
    {
      title: 'Reorderpoint',
      dataIndex: 'reorder_point',
      key: 'reorder_point',
    },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div style={getStatusStyle(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      ),
    },
    { title: 'Ordered By', dataIndex: 'ordered_by', key: 'ordered_by' },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDateToLocal(text),
    },
    {
      title: 'Delivery History',
      dataIndex: 'id', // Assuming `id` is the unique identifier for each order item
      key: 'deliveryHistory',
      render: (text, record) => (
        <Button
          ghost
          onClick={() => handleShowDeliveryHistory(record.id)}
          style={{color:"gray", borderColor:"gray"}}
        >
         Deliveries
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const isEditing = editKey === record.id;
        return isEditing ? (
          <span className='flex flex-nowrap'>
            <Button onClick={() => handleSave(record)} style={{ marginRight: 8 }}>
              Save
            </Button>
            <Button onClick={() => handleCancel()}>
              Cancel
            </Button>
          </span>
        ) : (
          <Button onClick={() => handleEdit(record)}>
            Edit
          </Button>
        );
      },
    },
  ];
  const exportCSV = () => {
    const allOrders = Object.values(batches).flat();
    const csvData = allOrders.map(order => ({
      product_name: order.product_name,
      qty_ordered: order.quantity,
      qty_quantity: order.quantity_received,
      lead_time: order.lead_time,
      safetystock: order.safety_stock,
      reorderpoint: order.reorder_point,
      supplier: order.supplier,
      status: order.status,
      ordered_by: order.ordered_by,
      created_at: formatDateToLocal(order.created_at)
    }));

    const csv = Papa.unparse(csvData, { header: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders_safety.csv';
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

    doc.save("orders_safety.pdf");
  };


  return (
    <>
      <h1 className="text-2xl font-bold mb-10 pt-10">Inventory policies ({filteredBatches.length})</h1>
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
      <Modal
      title="Delivery History"
      visible={isModalVisible}
      onOk={() => setIsModalVisible(false)}
      onCancel={() => setIsModalVisible(false)}
      footer={[
       <></>
      ]}
    >
      <Table
        dataSource={deliveryHistory}
        columns={deliveryHistoryColumns}
        pagination={false}
        className="min-w-full overflow-x-auto"
      />
    </Modal>
    </>
  );

};

export default ViewSafetyStock;
