import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd';
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <ConfigProvider
    theme={{
      "token": {
        "colorBgBase": "#f2f1ec",
        "colorPrimary": "#88aa8f",
        "colorInfo": "#88aa8f"
      }
    }}
  >
    <App />
    </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
