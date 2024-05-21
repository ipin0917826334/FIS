import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const SupplierProductLineChart = ({ supplierId }) => {
  const token = localStorage.getItem('token');
  const chartRef = useRef();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({
    responsive: true, 
    maintainAspectRatio: false, 
    aspectRatio: null, 
    layout: {
      padding: 0, 
    },
    plugins: {
      title: {
        display: true,
        font: { size: 26 },
        text: 'Product Quantities by Supplier',
      },
      legend: {
        display: false,
      },
    },
    scales: { 
      x: {
        title: {
          display: true,
          text: 'Products',
          font: { size: 24 }
        },
        ticks: {
          font: { size: 14 }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Quantity',
          font: { size: 24 }
        },
        ticks: {
          font: { size: 14 }
        }
      }
    }
  });

  useEffect(() => {
    if (supplierId) {
      fetchChartData(supplierId);
    }
  }, [supplierId]);

  const fetchChartData = async (supplierId) => {
    try {
      const response = await fetch(`http://localhost:5002/api/products-by-supplier-chart/${supplierId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();

      if (Array.isArray(products)) {
        const labels = products.map(product => product.product_name);
        const data = products.map(product => product.quantity);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Quantity',
              data: data,
              backgroundColor: 'rgba(127, 221, 145, 0.5)',
              maxBarThickness: 40,
            },
          ],
        });


        if (chartRef.current) {
          chartRef.current.resize(chartRef.current.width, 500);
        }
      } else {
        console.error('Received data is not an array:', products);
      }
    } catch (error) {
      console.error("Error fetching chart data: ", error);
    }
  };

  useEffect(() => {
    if (chartRef.current) {
        chartRef.current.update();
    }
}, [chartData, chartOptions]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar ref={chartRef} options={chartOptions} data={chartData} />
    </div>
  );
};

export default SupplierProductLineChart;
