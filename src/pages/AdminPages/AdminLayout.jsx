import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Input, Button, Typography, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import logoYct from "../../assets/Img/yctlogo[1] 1.png";
import homei from "../../assets/Img/home-icon.png";
import coursei from "../../assets/Img/course-icon.png";
import useri from "../../assets/Img/user-icon.png";
import resulti from "../../assets/Img/result-icon.png";
import "./AdminDashboard/AdminDashboard.css";

const { Header, Content, Sider } = Layout;
const { Search } = Input;
const { Text } = Typography;

const AdminLayout = ({ children }) => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  const siderWidth = collapsed ? 80 : 200;
  const headerHeight = 64;

  // Update localStorage when collapsed state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Animation variants remain the same
  const siderVariants = {
    expanded: {
      width: 200,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: 80,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      display: "inline-block",
      transition: { delay: 0.1, duration: 0.2 }
    },
    collapsed: {
      opacity: 0,
      display: "none",
      transition: { duration: 0.2 }
    }
  };

  const profileVariants = {
    expanded: {
      scale: 1,
      width: "100%",
      transition: { duration: 0.3 }
    },
    collapsed: {
      scale: 0.8,
      width: "100%",
      transition: { duration: 0.3 }
    }
  };

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: homei,
      label: "Dashboard"
    },
    {
      key: "/admin/students",
      icon: useri,
      label: "Users/Students"
    },
    {
      key: "/admin/courses",
      icon: coursei,
      label: "Courses"
    },
    {
      key: "/admin/results",
      icon: resulti,
      label: "Results"
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <motion.div
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={siderVariants}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: "white",
          borderRight: "1px solid #f0f0f0",
          zIndex: 999,
        }}
      >
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={siderWidth}
          style={{
            height: "100%",
            backgroundColor: "white",
          }}
        >
          <div style={{ padding: "16px", textAlign: "left", marginLeft: "5px" }}>
            <img
              src={logoYct}
              alt="YabaTech"
              style={{ width: "40px", height: "41px" }}
            />
            <motion.span
              variants={textVariants}
              style={{
                marginLeft: "10px",
                color: "#5C5E64",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              YabaTech
            </motion.span>
          </div>

          {/* <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ borderRight: 0 }}
            theme="light"
            className="custom-menu"
          >
            {menuItems.map(item => (
              <Tooltip
                key={item.key}
                title={collapsed ? item.label : ""}
                placement="right"
                mouseEnterDelay={0.3}
              >
                <Menu.Item
                  key={item.key}
                  icon={
                    <img
                      src={item.icon}
                      alt="icon"
                      style={{ width: "16px", height: "16px" }}
                    />
                  }
                  onClick={() => navigate(item.key)}
                >
                  <motion.span variants={textVariants}>
                    {item.label}
                  </motion.span>
                </Menu.Item>
              </Tooltip>
            ))}
          </Menu> */}
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ borderRight: 0 }}
            theme="light"
            className="custom-menu"
          >
            {[
              {
                key: "/admin/dashboard",
                icon: homei,
                label: "Dashboard"
              },
              {
                key: "/admin/students",
                icon: useri,
                label: "Users/Students"
              },
              {
                key: "/admin/courses",
                icon: coursei,
                label: "Courses"
              }
              // {
              //   key: "/admin/results",
              //   icon: resulti,
              //   label: "Results"
              // }
            ].map(item => (
              <Menu.Item
                key={item.key}
                icon={
                  <img
                    src={item.icon}
                    alt="icon"
                    style={{ width: "16px", height: "16px" }}
                  />
                }
                onClick={() => navigate(item.key)}
              >
                <motion.span variants={textVariants}>
                  {item.label}
                </motion.span>
              </Menu.Item>
            ))}
          </Menu>

          <motion.div
            variants={profileVariants}
            style={{
              position: "absolute",
              bottom: "20px",
              width: "100%",
              padding: "0 16px",
            }}
          >
            <motion.div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <Avatar icon={<UserOutlined />} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginLeft: "12px" }}
                  >
                    <Text strong>{currentUser?.displayName || "User"}</Text>
                    <br />
                    <Text type="secondary">Admin</Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <Tooltip title={collapsed ? "Log out" : ""} placement="right">
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                style={{ width: "100%", marginTop: "10px" }}
                onClick={handleLogout}
              >
                <motion.span variants={textVariants}>
                  Log out
                </motion.span>
              </Button>
            </Tooltip>
          </motion.div>
        </Sider>
      </motion.div>

      <Layout style={{ marginLeft: siderWidth, transition: "margin-left 0.3s ease-in-out" }}>
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: siderWidth,
            right: 0,
            height: headerHeight,
            padding: "0 16px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
            transition: "left 0.3s ease-in-out",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSider}
          />
          {/* <Search placeholder="Search" style={{ width: 300, margin: "0 24px" }} /> */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Text strong>{currentUser?.displayName}</Text>
            </div>
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: "20px" }} />
          </div>
        </Header>

        <Content
          style={{
            margin: `${headerHeight + 24}px 16px 24px 16px`,
            padding: 24,
            background: "white",
            overflow: "auto",
            minHeight: `calc(100vh - ${headerHeight + 48}px)`,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;