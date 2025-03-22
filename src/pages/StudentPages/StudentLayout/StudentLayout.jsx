import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Breadcrumb, Button, Typography } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import yaba from '../../../assets/Img/white 1.png';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StudentLayout = ({ children, studentData, selectedKey, breadcrumbItems }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/student/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          zIndex: 2 
        }}
      >
        <div style={{ height: '64px', background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={yaba} alt="Logo" style={{ width: '50px', height: '50px', color: '#fff'}} />
          {!collapsed && <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>Student Portal</span>}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/student/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            <Link to="/student/profile">Profile</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        {/* Top Header */}
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: '18px', marginRight: '16px' }
            })}
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              {breadcrumbItems && breadcrumbItems.map((item, index) => (
                <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={36} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#4CAF50' }} 
              />
              <div style={{ marginLeft: '12px' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{studentData?.matricNumber}</Text>
                </div>
              </div>
            </div>
            <Button 
              type="primary" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </div>
        </Header>
        
        {/* Main Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout; 