import React from 'react';
import { Table, Card, Row, Col, Typography, Button, Divider, Skeleton } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const DashboardContent = ({ 
  studentData, 
  courses, 
  viewMode, 
  setViewMode, 
  columns,
  loading
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            {loading ? (
              <Skeleton.Input style={{ width: 300 }} active />
            ) : (
              <>
                <Title level={2} style={{ margin: 0 }}>Welcome, {studentData?.name}!</Title>
                <Text type="secondary">Department: {studentData?.department}</Text>
              </>
            )}
          </div>
          <div>
            <Button.Group>
              <Button 
                type={viewMode === 'table' ? 'primary' : 'default'} 
                onClick={() => setViewMode('table')}
                style={{ 
                  backgroundColor: viewMode === 'table' ? '#4CAF50' : '#fff',
                  borderColor: viewMode === 'table' ? '#4CAF50' : undefined,
                }}
                disabled={loading}
              >
                Table View
              </Button>
              <Button 
                type={viewMode === 'card' ? 'primary' : 'default'} 
                onClick={() => setViewMode('card')}
                style={{ 
                  backgroundColor: viewMode === 'card' ? '#4CAF50' : '#fff',
                  borderColor: viewMode === 'card' ? '#4CAF50' : undefined,
                }}
                disabled={loading}
              >
                Card View
              </Button>
            </Button.Group>
          </div>
        </div>
      </motion.div>

      {/* Course Statistics */}
      <motion.div variants={itemVariants}>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {loading ? (
                <Skeleton active avatar={false} paragraph={{ rows: 1 }} />
              ) : (
                <Statistic title="Courses Enrolled" value={courses.length} prefix={<BookOutlined />} />
              )}
            </Card>
          </Col>
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Divider orientation="left">My Courses</Divider>
      </motion.div>

      {/* Table View */}
      {viewMode === 'table' && (
        <motion.div 
          variants={itemVariants}
          style={{ overflowX: 'auto' }}
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Table 
              columns={columns} 
              dataSource={courses} 
              pagination={false}
              style={{ borderRadius: '8px', overflow: 'hidden' }}
            />
          )}
        </motion.div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map(key => (
                <Col xs={24} sm={12} md={8} lg={6} key={key}>
                  <Card>
                    <Skeleton active avatar={false} paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              {courses.map(course => (
                <Col xs={24} sm={12} md={8} lg={6} key={course.key}>
                  <motion.div variants={itemVariants}>
                    <Card
                      hoverable
                      style={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        height: '100%'
                      }}
                      cover={
                        <div 
                          style={{ 
                            height: '80px', 
                            background: '#4CAF50', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#fff',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                          }}
                        >
                          {course.courseCode}
                        </div>
                      }
                    >
                      <div style={{ padding: '8px 0' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '16px' }}>{course.courseTitle}</Text>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary">Course Code: {course.courseCode}</Text>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary">Course Unit: {course.creditHours}</Text>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary">Level: {course.level}</Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Statistic component
const Statistic = ({ title, value, prefix }) => {
  return (
    <div>
      <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ marginRight: '8px' }}>{prefix}</span>}
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</span>
      </div>
    </div>
  );
};

export default DashboardContent;