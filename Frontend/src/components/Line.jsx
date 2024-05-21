import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const ColumnChart = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartOptions, setChartOptions] = useState({});
  const chartRef = useRef();

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
              backgroundColor: 'rgba(127, 221, 145, 0.5)',
              maxBarThickness: 40,
            },
          ],
        });

        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: null,
          layout: {
            padding: 0,
          },
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
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
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
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resize(chartRef.current.width, 500);
      chartRef.current.update();
    }
  }, [chartData, chartOptions]);
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar ref={chartRef} options={chartOptions} data={chartData} />
    </div>
  );
};

export default ColumnChart;
