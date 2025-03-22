import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Breadcrumb, Button, Typography } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { auth, db } from '../../../firebase/firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../../context/AuthContext';
import DashboardContent from '../DashboardContent/DashboardContent';
import yaba from '../../../assets/Img/white 1.png';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StudentDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchStudentAndCourses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/student/login');
          return;
        }

        // Fetch student data using email
        const studentsRef = collection(db, 'students');
        const studentSnapshot = await getDocs(studentsRef);
        const studentDoc = studentSnapshot.docs.find(doc => doc.data().email === user.email);

        if (studentDoc) {
          const student = studentDoc.data();
          setStudentData({
            name: student.name,
            matricNumber: student.matricNumber,
            department: student.department,
            email: student.email
          });

          // Fetch courses data
          const coursesData = await Promise.all(
            (student.courses || []).map(async (courseId) => {
              const courseDoc = await getDoc(doc(db, 'courses', courseId));
              if (courseDoc.exists()) {
                return {
                  key: courseId,
                  ...courseDoc.data()
                };
              }
              return null;
            })
          );

          // Filter out any null values and set courses
          setCourses(coursesData.filter(course => course !== null));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndCourses();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/student/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text) => <a href="#">{text}</a>,
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
    },
    {
      title: 'Credit Hours',
      dataIndex: 'creditHours',
      key: 'creditHours',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    }
  ];

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
          defaultSelectedKeys={['1']}
          style={{ borderRight: 0 }}
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="6" icon={<UserOutlined />}>
            Profile
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
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
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
          <DashboardContent 
            studentData={studentData}
            courses={courses}
            viewMode={viewMode}
            setViewMode={setViewMode}
            columns={columns}
            loading={loading}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentDashboard;