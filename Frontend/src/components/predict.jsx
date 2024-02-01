import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';

const { Option } = Select;

const Predict = () => {
    const [fruits, setFruits] = useState([]);
    const [forecastResult, setForecastResult] = useState(null);

    useEffect(() => {
        const fetchFruits = async () => {
            const response = await fetch('http://localhost:5001/get-fruits');
            const data = await response.json();
            setFruits(data);
        };

        fetchFruits();
        console.log(fruits)

    }, []);

    const onFinish = async (values) => {
        try {
            const response = await fetch('http://localhost:5001/forecast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (response.ok) {
                setForecastResult(result);
                message.success(`Forecast result: ${result.forecasted_sales_volume || result.actual_sales_volume}`);
            } else {
                message.error('Failed to get forecast.');
            }
        } catch (error) {
            console.error('Error during forecast:', error);
            message.error('An error occurred during forecast.');
        }
    };


    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 pt-10">Sales Volume Forecast</h1>
            <Form name="forecast" onFinish={onFinish} scrollToFirstError className="mt-10">
                <Form.Item
                    label="Select Fruit"
                    name="fruit_name"
                    rules={[{ required: true, message: 'Please select a fruit!' }]}
                >
                    <Select placeholder="Select a fruit">
                        {fruits.map(fruit => (
                            <Option key={fruit} value={fruit}>{fruit}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Year"
                    name="forecast_year"
                    rules={[{ required: true, message: 'Please input the year!' }]}
                >
                    <Input placeholder="e.g. 2024" type="number" />
                </Form.Item>

                <Form.Item
                    label="Month"
                    name="forecast_month"
                    rules={[{ required: true, message: 'Please input the month!' }]}
                >
                    <Input placeholder="Input 1-12" type="number" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">Forecast</Button>
                </Form.Item>
            </Form>
            {forecastResult && (
                <div className="forecast-result bg-white shadow-lg rounded-lg p-6 mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Forecast Result</h2>
                    {forecastResult.forecasted_sales_volume !== undefined && (
                        <div className="mb-3 p-3 bg-blue-100 rounded-md">
                            <p className="text-lg">
                                <strong className="font-medium text-blue-600">Forecasted Sales Volume:</strong>
                                <span className="text-gray-600 ml-2">{forecastResult.forecasted_sales_volume}</span>
                            </p>
                        </div>
                    )}
                    {forecastResult.actual_sales_volume !== undefined && (
                        <div className="mb-3 p-3 bg-green-100 rounded-md">
                            <p className="text-lg">
                                <strong className="font-medium text-green-600">Actual Sales Volume:</strong>
                                <span className="text-gray-600 ml-2">{forecastResult.actual_sales_volume}</span>
                            </p>
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

export default Predict;
