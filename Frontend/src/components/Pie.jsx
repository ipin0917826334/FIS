import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const PieChart = () => {
  const [statusData, setStatusData] = useState({ incomplete: 0, pending: 0, complete: 0 });
  const [pieOptions, setPieOptions] = useState({});

  useEffect(() => {
    fetchStatusData();

    setPieOptions({
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
      },
    });
  }, []);

  const fetchStatusData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/order-status-counts', {
        headers: {
          'Authorization': token,
        },
      });
      const data = await response.json();
      setStatusData({
        incomplete: data.incomplete || 0,
        pending: data.pending || 0,
        complete: data.complete || 0
      });
    } catch (error) {
      console.error('Error fetching order status counts:', error);
    }
  };

  const data = {
    labels: ['Incomplete', 'Pending', 'Complete'],
    datasets: [
      {
        label: 'Purchase Order',
        data: [statusData.incomplete, statusData.pending, statusData.complete],
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
