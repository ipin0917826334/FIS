import React, { useState } from "react";
import { Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const NavBar = ({ menu }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
    <Button
    className="menu absolute" 
    type="primary"
    icon={<MenuOutlined />}
    onClick={() => setVisible(true)}
  />
    <nav className="navbar menu1">
      <div className='flex items-center justify-center flex-col'>
        <h1 className='text-7xl mb-20 mr-10 text-white '>FIS</h1>
        <h1 className='text-3xl mb-10 mr-10 text-white'>Test Test</h1>
      </div>
      <Drawer
        title="Topics"
        placement="left"
        theme="dark"
        onClick={() => setVisible(false)}
        onClose={() => setVisible(false)}
        visible={visible}
      >
        {menu}
      </Drawer>
    </nav>
    </>
  );
};

export default NavBar;