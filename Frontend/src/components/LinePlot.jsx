import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment-timezone';
const LinePlot = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});
  const formatDateToLocal = (dateString) => {
    return moment(dateString).tz('Asia/Bangkok').format('YYYY-MM-DD');
  };
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/order-quantities-by-date', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
      .then(response => response.json())
      .then(data => {
        const labels = data.map(item => formatDateToLocal(item.date));
        const quantities = data.map(item => item.quantity);

        setChartData({
          labels: labels,
          datasets: [{
            label: 'Product Delivered',
            data: quantities,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          }],
        });

        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          plugins: {
            title: {
              display: true,
              text: 'Delivery History Per Day',
              font: {
                size: 26
              },
            },
            legend: {
              display: true,
              position: 'top',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
                font: {
                  size: 24
                }
              },
            },
            y: {
              title: {
                display: true,
                text: 'Product Delivered',
                font: {
                  size: 24
                }
              },
            },
          },
        });
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='flex justify-center w-full py-10'>
      <div style={{ width: '80%', minHeight: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default LinePlot;
