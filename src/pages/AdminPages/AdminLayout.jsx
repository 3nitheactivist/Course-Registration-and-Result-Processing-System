import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Layout, Menu, Avatar, Input, Button, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation(); // Get current route
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          backgroundColor: "white",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Sider content */}
        <div style={{ padding: "16px", textAlign: "left", marginLeft: "5px" }}>
          <img
            src={logoYct}
            alt="YabaTech"
            style={{ width: collapsed ? "40px" : "40px", height: "41px" }}
          />
          <span
            style={{
              opacity: collapsed ? "0" : "",
              transition: collapsed ? " " : "ease-in .4s opacity",
              marginLeft: collapsed ? "" : "10px",
              color: "#5C5E64",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            YabaTech
          </span>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]} // Dynamically set selected menu item
          style={{ borderRight: 0 }}
          theme="light"
          className="custom-menu"
        >
          <Menu.Item
            key="/admin/dashboard"
            icon={
              <img
                src={homei}
                alt="icon"
                style={{ width: "16px", height: "16px" }}
              />
            }
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="/admin/users"
            icon={
              <img
                src={useri}
                alt="icon"
                style={{ width: "16px", height: "16px" }}
              />
            }
            onClick={() => navigate("/admin/users")}
          >
            Users/Students
          </Menu.Item>
          <Menu.Item
            key="/admin/courses"
            icon={
              <img
                src={coursei}
                alt="icon"
                style={{ width: "16px", height: "16px" }}
              />
            }
            onClick={() => navigate("/admin/courses")}
          >
            Courses
          </Menu.Item>
          <Menu.Item
            key="/admin/results"
            icon={
              <img
                src={resulti}
                alt="icon"
                style={{ width: "16px", height: "16px" }}
              />
            }
            onClick={() => navigate("/admin/results")}
          >
            Results
          </Menu.Item>
        </Menu>
        {/* User profile and logout button */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            width: "100%",
            padding: "0 16px",
          }}
        >
          {/* ... Your existing profile and logout button code ... */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                width: collapsed ? "35px" : "",
                height: collapsed ? "30px" : "",
              }}
            />
            {!collapsed && (
              <div style={{ marginLeft: "12px" }}>
                <Text strong>{currentUser?.displayName || "User"}</Text>
                <br />
                <Text type="secondary">Admin</Text>
              </div>
            )}
          </div>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            style={{ width: "100%", marginTop: "10px" }}
            onClick={handleLogout}
          >
            {!collapsed && "Log out"}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSider}
          />
          <Search
            placeholder="Search"
            style={{ width: 300, margin: "0 24px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Text strong>{currentUser?.displayName}</Text>
            </div>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: "20px" }}
            />
          </div>
        </Header>

        <Content
          style={{ margin: "24px 16px", padding: 24, background: "white" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
