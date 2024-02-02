import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const ColumnChart = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5002/api/products-count-by-supplier', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
    .then(response => response.json())
    .then(data => {
      const labels = data.map(item => item.supplier_name);
      const counts = data.map(item => item.product_count);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Product Count',
            data: counts,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            maxBarThickness: 40,
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            font: {
              size: 26
            },
            text: 'Product Count Assigned To Supplier',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Suppliers',
              font: {
                size: 24 
              }
            },
            ticks: {
              font: {
                size: 14
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Product Count',
              font: {
                size: 24
              }
            },
            ticks: {
              font: {
                size: 14
              }
            }
          }
        }
      });
    })
    .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='flex justify-center w-full py-10'>
    <div style={{ width: '100%', minHeight: '500px' }}>
      <Bar options={chartOptions} data={chartData} />
    </div>
  </div>
  
  );
};

export default ColumnChart;
