import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const Predict = () => {
    const [fruits, setFruits] = useState([]);
    const [forecastResult, setForecastResult] = useState(null);
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const fetchFruits = async () => {
            const response = await fetch('http://localhost:5001/get-fruits');
            const data = await response.json();
            setFruits(data);
        };

        fetchFruits();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
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
                const salesVolume = result.forecasted_sales_volume !== undefined ? result.forecasted_sales_volume : result.actual_sales_volume;
                message.success(`Forecast result: ${salesVolume >= 0 ? salesVolume : 0}`);
            } else {
                message.error('Failed to get forecast.');
            }
        } catch (error) {
            console.error('Error during forecast:', error);
            message.error('An error occurred during forecast.');
        } finally {
            setLoading(false);
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
            <Modal
                title="Forecast Result"
                visible={loading}
                footer={null}
                closable={false}
                centered
            >
                <div style={{ textAlign: 'center' }}> {/* Center align text and spinner */}
                    <Spin indicator={antIcon} />
                    <p style={{ marginTop: 8 }}>Loading...</p>
                </div>
            </Modal>
            {forecastResult && (
                <div className="forecast-result bg-white shadow-lg rounded-lg p-6 mt-6">
                    <h2 className="text-2xl font-semibold mb-4">Forecast Result</h2>
                    {(forecastResult.forecasted_sales_volume !== undefined || forecastResult.actual_sales_volume !== undefined) && (
                        <div className="mb-3 p-3 rounded-md" style={{ backgroundColor: forecastResult.forecasted_sales_volume !== undefined ? '#D6EAF8' : '#D5F5E3' }}>
                            <p className="text-lg">
                                <strong className="font-medium" style={{ color: forecastResult.forecasted_sales_volume !== undefined ? '#3498DB' : '#58D68D' }}>{forecastResult.forecasted_sales_volume !== undefined ? 'Forecasted Sales Volume:' : 'Actual Sales Volume:'}</strong>
                                <span className="text-gray-600 ml-2">{(forecastResult.forecasted_sales_volume !== undefined ? forecastResult.forecasted_sales_volume : forecastResult.actual_sales_volume) >= 0 ? (forecastResult.forecasted_sales_volume !== undefined ? forecastResult.forecasted_sales_volume : forecastResult.actual_sales_volume) : 0}</span>
                            </p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default Predict;