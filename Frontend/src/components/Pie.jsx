import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const PieChart = () => {
  const [statusData, setStatusData] = useState({ incomplete: {}, pending: {}, complete: {} });

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5002/api/order-status-counts', {
        headers: {
          'Authorization': token,
        },
      });
      const data = await response.json();
      setStatusData({
        incomplete: data.incomplete || {},
        pending: data.pending || {},
        complete: data.complete || {}
      });
    } catch (error) {
      console.error('Error fetching order status counts:', error);
    }
  };

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      title: {
        display: true,
        font: {
          size: 26
        },
        text: 'Purchase Orders By Status',
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const status = context.label.toLowerCase();
            const supplierData = statusData[status];
            const supplierCounts = Object.entries(supplierData)
              .map(([supplier, count]) => `${supplier}: ${count}`)
              .join(', ');
            return `${context.label}: ${context.raw} (${supplierCounts})`;
          }
        }
      }
    },
  }), [statusData]);

  const data = {
    labels: ['Incomplete', 'Pending', 'Complete'],
    datasets: [
      {
        label: 'Purchase Order',
        data: [
          Object.values(statusData.incomplete).reduce((acc, val) => acc + val, 0),
          Object.values(statusData.pending).reduce((acc, val) => acc + val, 0),
          Object.values(statusData.complete).reduce((acc, val) => acc + val, 0)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='flex justify-center w-full py-10'>
      <div style={{ width: '60%', minHeight: '500px' }}>
        <Doughnut options={pieOptions} data={data} />
      </div>
    </div>
  );
};

export default PieChart;
