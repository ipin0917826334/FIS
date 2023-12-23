// import React, { useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import { Button, Menu } from 'antd';
// import {
//   AppstoreOutlined,
//   ContainerOutlined,
//   DesktopOutlined,
//   MailOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   PieChartOutlined
// } from '@ant-design/icons';

// const SideBar = () => {
//   function getItem(label, key, icon, children, type) {
//     return {
//       key,
//       icon,
//       children,
//       label,
//       type,
//     };
//   }
//   const items = [
//     getItem('DASHBOARD', '1', <PieChartOutlined />),
//     getItem('REPORTS', '2', <DesktopOutlined />),
//     getItem('PRODUCT', 'sub1', <MailOutlined />, [
//       getItem('View Product', '4'),
//       getItem('Add Product', '5'),
//     ]),
//     getItem('SUPPLIER', 'sub2', <MailOutlined />, [
//       getItem('View Supplier', '6'),
//       getItem('Add Supplier', '7'),
//     ]),
//     getItem('PURCHASE ORDER', 'sub3', <MailOutlined />, [
//       getItem('Create Order', '8'),
//       getItem('View Safety Stock', '9'),
//       getItem('View Orders', '10'),
//     ]),
//     getItem('USER', 'sub4', <AppstoreOutlined />, [
//       getItem('View User', '11'),
//       getItem('Add User', '12'),
//       //   getItem('Submenu', 'sub3', null, [getItem('Option 11', '11'), getItem('Option 12', '12')]),
//     ]),
//   ];
//   const [collapsed, setCollapsed] = useState(false);
//   const toggleCollapsed = () => {
//     setCollapsed(!collapsed);
//   };
//   const navigate = useNavigate();
//   const onFinish = values => {
//     console.log('Received values of form: ', values);
//     navigate(`/dashboard`);
//   };
//   return (
//     <div className='absolute h-screen bg-[#001529]'  >
//       <div
//         className='mt-10'
//       >
//         <div className='flex items-center justify-center flex-col'>
//           <h1 className='text-7xl mb-20 text-white '>FIS</h1>
//           <h1 className='text-3xl mb-10 text-white'>Test Test</h1>
//         </div>
//         <Button
//           type="primary"
//           onClick={toggleCollapsed}
//           style={{
//             marginBottom: 16,
//             marginRight: '180px'
//           }}
//         >
//           {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//         </Button>
//         <Menu
//           defaultSelectedKeys={['1']}
//           defaultOpenKeys={['sub1']}
//           mode="inline"
//           theme="dark"
//           inlineCollapsed={collapsed}
//           items={items}
//         />
//       </div>
//     </div>
//   );
// };

// export default SideBar;
import React from "react";
import { Layout } from "antd";
const SideBar = ({ menu }) => {
  return (
    <Layout.Sider
      className="sidebar absolute"
      breakpoint={"lg"}
      theme="dark"
      collapsedWidth={0}
      trigger={null}
    >
        {menu}
    </Layout.Sider>
  );
};

export default SideBar;