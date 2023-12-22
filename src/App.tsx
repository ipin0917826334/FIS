import React, { useState } from "react";
import { Layout, Menu, Button, theme, Space } from "antd";
import {
  FileOutlined,
  TagOutlined,
  ShopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UserAddOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import NavBar from "./components/NavBar";
import SideBar from "./components/sidebar";
import DashBoard from "./components/dashboard";
import Report from "./components/report";
import AddProduct from "./components/addProduct";
import AddSupplier from "./components/addSupplier";
import AddUser from "./components/addUser";
import CreateOrder from "./components/createOrder";
import ViewOrders from "./components/viewOrders";
import ViewProduct from "./components/viewProduct";
import ViewSafetyStock from "./components/viewSafetyStock";
import ViewSupplier from "./components/viewSupplier";
import ViewUser from "./components/viewUser";
import type { MenuProps } from 'antd';
const { Header, Sider, Content } = Layout;
type MenuItem = Required<MenuProps>['items'][number];
function App() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  function getItem(label, key, icon, to, component, children?: MenuItem[],
  ): MenuItem {
    return {
      key,
      icon,
      label,
      to,
      component,
      children,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem("DASHBOARD", "1", <PieChartOutlined />, "/dashboard", DashBoard),
    getItem("REPORTS", "2", <FileOutlined />, "/report", Report),
    getItem("PRODUCT", "sub1", <TagOutlined />, null,
      null, [
      getItem("View Product", "4", null, "/view-product", ViewProduct),
      getItem("Add Product", "5", null, "/add-product", AddProduct)
    ]),
    getItem("SUPPLIER", "sub2", <ShopOutlined />, null,
      null, [
      getItem("View Supplier", "6", null, "/view-supplier", ViewSupplier),
      getItem("Add Supplier", "7", null, "/add-supplier", AddSupplier)
    ]),
    getItem("PURCHASE ORDER", "sub3", <ShoppingCartOutlined />, null,
      null, [
      getItem("Create Order", "8", null, "/create-order", CreateOrder),
      getItem("View Safety Stock", "9", null, "/view-safety-stock", ViewSafetyStock),
      getItem("View Orders", "10", null, "/view-orders", ViewOrders)
    ]),
    getItem("USER", "sub4", <UserAddOutlined />, null,
      null, [
      getItem("View User", "11", null, "/view-user", ViewUser),
      getItem("Add User", "12", null, "/add-user", AddUser)
    ])
  ];

  return (
    <Router>
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <div style={{ padding: '16px', textAlign: 'center', background: '#001529' }}>
            <span className="text-3xl" style={{ color: 'white', fontWeight: 'bold' }}>FIS</span>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} >
              <Menu.Item key="1" icon={<PieChartOutlined />}>
                <Link to="/dashboard">DASHBOARD</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<FileOutlined />}>
                <Link to="/report">REPORTS</Link>
              </Menu.Item>
              <Menu.SubMenu key="sub1" icon={<TagOutlined />} title="PRODUCT">
                <Menu.Item key="4">
                  <Link to="/view-product">View Product</Link>
                </Menu.Item>
                <Menu.Item key="5">
                  <Link to="/add-product">Add Product</Link>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="sub2" icon={<ShopOutlined />} title="SUPPLIER">
                <Menu.Item key="6">
                  <Link to="/view-supplier">View Supplier</Link>
                </Menu.Item>
                <Menu.Item key="7">
                  <Link to="/add-supplier">Add Supplier</Link>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="sub3" icon={<ShoppingCartOutlined />} title="PURCHASE ORDER">
                <Menu.Item key="8">
                  <Link to="/create-order">Create Order</Link>
                </Menu.Item>
                <Menu.Item key="9">
                  <Link to="/view-safety-stock">View Safety Stock</Link>
                </Menu.Item>
                <Menu.Item key="10">
                  <Link to="/view-orders">View Orders</Link>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="sub4" icon={<UserAddOutlined />} title="USER">
                <Menu.Item key="11">
                  <Link to="/view-user">View User</Link>
                </Menu.Item>
                <Menu.Item key="12">
                  <Link to="/add-user">Add User</Link>
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
        </Sider>
        <Layout>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              background: colorBgContainer,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Space>
              {/* Add your user name or user-related content here */}
              <span className="text-xl mr-10" style={{ color: "black" }}>User Name</span>
            </Space>
          </Header>
          <Content
            className="h-screen"
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
           <Routes>
              {items.map((item) => (
                <Route
                  key={item.key}
                  path={item.to}
                  element={item.component ? <item.component /> : null}
                />
              ))}
              {items.map((item) =>
                item.children?.map((subItem) => (
                  <Route
                    key={subItem.key}
                    path={subItem.to}
                    element={subItem.component ? <subItem.component /> : null}
                  />
                ))
              )}
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
