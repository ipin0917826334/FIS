import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, theme, Space, Dropdown, Modal, ConfigProvider, Table } from "antd";
import {
  FileOutlined,
  TagOutlined,
  ShopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UserAddOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  NotificationOutlined
} from "@ant-design/icons";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import Login from "./components/login";
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
import Sale from "./components/Sale";
import Predict from "./components/predict";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const showModal = () => {
    setIsModalVisible(true);
    fetchProducts();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5002/api/products-notification', {
      method: 'GET',
      headers: {
        Authorization: `${token}`,
      },
    });
    if (response.ok) {
      let data = await response.json();
      // Convert EOQ to an integer
      data = data.map(product => ({
        ...product,
        eoq: Math.round(product.eoq),
      }));
      setProducts(data);
    } else {
      console.error('Failed to fetch products');
    }
  };
  

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Product Stock',
      dataIndex: 'product_stock',
      key: 'product_stock',
    },
    {
      title: 'Economic Order Quantity',
      dataIndex: 'eoq',
      key: 'eoq',
    },
    {
      title: 'Notification',
      dataIndex: 'notification',
      key: 'notification',
      render: (text) => (text ? 'Low stock' : ''),
    },
  ];
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  function getItem(
    label,
    key,
    icon,
    to,
    component,
    children?: MenuItem[]
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
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetchUserDetails(token).then((userDetails) => {
        if (!userDetails) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUserDetails(userDetails);
        }
      });
    }
  }, [navigate]);
  const items: MenuItem[] = [
    getItem("DASHBOARD", "1", <PieChartOutlined />, "/dashboard", DashBoard),
    getItem("PREDICT", "2", <PieChartOutlined />, "/predict", Predict),
    // getItem("REPORTS", "2", <FileOutlined />, "/report", Report),
    getItem("PRODUCT", "sub1", <TagOutlined />, null, null, [
      getItem("View Product", "4", null, "/view-product", ViewProduct),
      getItem("Add Product", "5", null, "/add-product", AddProduct),
    ]),
    getItem("SUPPLIER", "sub2", <ShopOutlined />, null, null, [
      getItem("View Supplier", "6", null, "/view-supplier", ViewSupplier),
      getItem("Add Supplier", "7", null, "/add-supplier", AddSupplier),
    ]),
    getItem("PURCHASE ORDER", "sub3", <ShoppingCartOutlined />, null, null, [
      getItem("Create Order", "8", null, "/create-order", CreateOrder),
      getItem("View Safety Stock", "9", null, "/view-safety-stock", ViewSafetyStock),
      getItem("View Orders", "10", null, "/view-orders", ViewOrders),
    ]),
    getItem("USER", "sub4", <UserAddOutlined />, null, null, [
      getItem("View User", "11", null, "/view-user", ViewUser),
      getItem("Add User", "12", null, "/add-user", AddUser),
    ]),
    getItem("INVENTORY", "13", <ShoppingCartOutlined />, "/sale", Sale),
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserDetails(null);
    navigate("/login");
  };
  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch("http://localhost:5002/api/user-details", {
        method: "GET",
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.ok) {
        const userDetails = await response.json();
        return userDetails;
      } else {
        console.error("Failed to fetch user details");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setUserDetails={setUserDetails} />} />
      <Route
        path="/*"
        element={
          <Layout style={{ minHeight: '100vh' }}>
            {!isHide && (
              <ConfigProvider
                theme={{
                  token: {
                    // Seed Token
                    colorPrimary: '#88ab8d',

                    // Alias Token
                    colorBgContainer: '#afc7ad',
                  },
                }}
              >
                <Sider trigger={null} collapsible collapsed={collapsed}>
                  <div className="demo-logo-vertical" />
                  <div style={{ padding: '16px', textAlign: 'center', background: '#001529' }}>
                    <span className="text-3xl" style={{ color: 'white', fontWeight: 'bold' }}>FIS</span>
                  </div>

                  <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                    <Menu.Item key="1" icon={<PieChartOutlined />}>
                      <Link to="/dashboard">DASHBOARD</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FileOutlined />}>
                      <Link to="/predict">PREDICT</Link>
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
                    <Menu.Item key="13" icon={<ShoppingCartOutlined />}>
                      <Link to="/sale">INVENTORY</Link>
                    </Menu.Item>
                  </Menu>
                </Sider>
              </ConfigProvider>
            )}
            <Layout>
              <ConfigProvider
                theme={{
                  token: {
                    // Seed Token
                    colorPrimary: '#88AB8D',

                    // Alias Token
                    colorBgContainer: '#88AB8D',
                  },
                }}
              >
                <Header
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    background: '#88aa8f',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      type="text"
                      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                      onClick={() => setCollapsed(!collapsed)}
                    />
                    <Button
                      icon={<NotificationOutlined />}
                      onClick={showModal}
                      style={{
                        marginLeft: '16px',
                      }}
                    />
                  </div>
                  <Space>
                    {userDetails && (
                      <Dropdown
                        overlay={
                          <Menu>
                            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                              Logout
                            </Menu.Item>
                          </Menu>
                        }
                        placement="bottomRight"
                      >
                        <span className="text-xl mr-10 text-white" style={{ color: "white", cursor: "pointer" }}>
                          {`${userDetails.first_name} ${userDetails.last_name}`}
                        </span>
                      </Dropdown>
                    )}
                  </Space>
                </Header>
                <Modal
                  title="Product Notifications"
                  visible={isModalVisible}
                  onCancel={handleCancel}
                  footer={null}
                >
                  <ConfigProvider
                    theme={{
                      token: {
                        // Seed Token
                        colorPrimary: '#f2f1ec',

                        // Alias Token
                        colorBgContainer: '#f2f1ec',
                      },
                    }}
                  >
                    <Table dataSource={products} columns={columns} />
                  </ConfigProvider>
                </Modal>
              </ConfigProvider>
              <Content
                className="h-screen"
                style={{
                  margin: "24px 16px",
                  padding: 24,
                  minHeight: 280,
                  overflow: "auto",
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
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
                        element={subItem.component ? <subItem.component userDetails={userDetails} /> : null}
                      />
                    ))
                  )}
                </Routes>
              </Content>
            </Layout>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
