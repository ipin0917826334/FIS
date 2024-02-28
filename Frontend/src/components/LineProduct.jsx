import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const SupplierProductLineChart = ({ supplierId }) => {
    const token = localStorage.getItem('token');

    const [chartData, setChartData] = useState({
        datasets: [],
    });
    const [chartOptions, setChartOptions] = useState({});

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
            console.log(products);
            if (Array.isArray(products)) {
                const labels = products.map(product => product.product_name);
                const data = products.map(product => product.quantity);


                setChartData({
                    labels: labels,
                    datasets: [
                      {
                        label: 'Quantity',
                        data: data,
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
                          text: 'Quantity',
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
            } else {
                console.error('Received data is not an array:', products);
            }
        } catch (error) {
            console.error("Error fetching chart data: ", error);
        }
    };

    return (
        <div className='flex justify-center w-full'>
        <div style={{ width: '100%', height: '500px' }}>
          <Bar key={supplierId} options={chartOptions} data={chartData} />
        </div>
      </div>
      
      );
};

export default SupplierProductLineChart;
