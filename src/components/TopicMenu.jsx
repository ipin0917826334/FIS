import React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom"; // Import Link from React Router
import {
  AppstoreOutlined,
  DesktopOutlined,
  MailOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

const TopicMenu = ({ selectedKey, changeSelectedKey }) => {
  function getItem(label, key, icon, to, children, type) {
    return {
      key,
      icon,
      children,
      label,
      to, // Add the "to" property for routing
      type,
    };
  }

  const items = [
    getItem('DASHBOARD', '1', <PieChartOutlined />, '/dashboard'),
    getItem('REPORTS', '2', <DesktopOutlined />, '/reports'),
    getItem('PRODUCT', 'sub1', <MailOutlined />, null, [
      getItem('View Product', '4', null, '/view-product'),
      getItem('Add Product', '5', null, '/add-product'),
    ]),
    getItem('SUPPLIER', 'sub2', <MailOutlined />, null, [
      getItem('View Supplier', '6', null, '/view-supplier'),
      getItem('Add Supplier', '7', null, '/add-supplier'),
    ]),
    getItem('PURCHASE ORDER', 'sub3', <MailOutlined />, null, [
      getItem('Create Order', '8', null, '/create-order'),
      getItem('View Safety Stock', '9', null, '/view-safety-stock'),
      getItem('View Orders', '10', null, '/view-orders'),
    ]),
    getItem('USER', 'sub4', <AppstoreOutlined />, null, [
      getItem('View User', '11', null, '/view-user'),
      getItem('Add User', '12', null, '/add-user'),
    ]),
  ];

  return (
    <Menu
      mode="inline"
      items={items}
      defaultSelectedKeys={['1']}
      theme="dark"
      defaultOpenKeys={['sub1']}
      onSelect={(item) => changeSelectedKey(item.key)}
    >
      {items.map((item) => (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default TopicMenu;
