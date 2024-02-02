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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [deliveryQuantity, setDeliveryQuantity] = useState(0);
  const [isDeliveryHistoryModalVisible, setIsDeliveryHistoryModalVisible] = useState(false);
  const [isAddDeliveryModalVisible, setIsAddDeliveryModalVisible] = useState(false);

  const [editKey, setEditKey] = useState(null);
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/orders-by-batch', {
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
  const fetchDeliveryHistory = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/order-items-history/${itemId}`, {
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

  const handleShowDeliveryHistory = (itemId) => {
    setCurrentRecordId(itemId);
    fetchDeliveryHistory(itemId);
    setIsDeliveryHistoryModalVisible(true);
  };

  const handleShowAddDelivery = (itemId) => {
    setCurrentRecordId(itemId);
    setIsAddDeliveryModalVisible(true);
  };

  const handleDeliveryQuantityChange = (e) => {
    setDeliveryQuantity(e.target.value);
  };

  const handleAddDelivery = async () => {
    const orderItem = Object.entries(batches).flatMap(batch => batch[1]).find(item => item.id === currentRecordId);
    if (!orderItem) {
      message.error('Order item not found.');
      return;
    }

    const deliveryQtyNumber = Number(deliveryQuantity);
    if (Number.isNaN(deliveryQtyNumber) || deliveryQtyNumber <= 0) {
      message.error('Please enter a valid delivery quantity.');
      return;
    }

    if (deliveryQtyNumber > orderItem.quantity - orderItem.quantity_received) {
      message.error('Delivery quantity cannot exceed the quantity remaining to be delivered.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/add-delivery/${currentRecordId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ deliveryQuantity: deliveryQtyNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      message.success('Delivery added successfully');
      setIsAddDeliveryModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Error adding delivery:', error);
      message.error(`Failed to add delivery: ${error.message || error}`);
    }
  };

  useEffect(() => {
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
      dataIndex: 'id',
      key: 'deliveryHistory',
      render: (text, record) => (
        <Button
          ghost
          onClick={() => handleShowDeliveryHistory(record.id)}
          style={{ color: "gray", borderColor: "gray" }}
        >
          Deliveries
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleShowAddDelivery(record.id)}
        >
          Add Delivery
        </Button>
      ),
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
    const tableColumn = ["Product", "Demand", "Leadtime (Day)", "Safetystock", "Reorderpoint", "Supplier", "Status", "Ordered By", "Created Date"];

    let startY = 20;

    Object.entries(batches).forEach(([batchNumber, orders], index) => {
      doc.text(`Batch #: ${batchNumber}`, 14, startY);

      startY += 10;

      const tableRows = orders.map(order => [
        order.product_name,
        order.quantity,
        order.lead_time,
        order.safety_stock,
        order.reorder_point,
        order.supplier,
        order.status,
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
        visible={isDeliveryHistoryModalVisible}
        onCancel={() => setIsDeliveryHistoryModalVisible(false)}
        footer={[
          <></>,
        ]}
      >
        <Table
          dataSource={deliveryHistory}
          columns={deliveryHistoryColumns}
          pagination={false}
          className="min-w-full overflow-x-auto"
        />
      </Modal>

      <Modal
        title="Add Delivery"
        visible={isAddDeliveryModalVisible}
        onOk={handleAddDelivery}
        onCancel={() => setIsAddDeliveryModalVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={handleAddDelivery}>
            Add Delivery
          </Button>,
        ]}
      >
        <Form.Item label="Delivery Quantity">
          <Input
            type="number"
            value={deliveryQuantity}
            onChange={handleDeliveryQuantityChange}
          />
        </Form.Item>
      </Modal>
    </>
  );
};

export default ViewSafetyStock;

