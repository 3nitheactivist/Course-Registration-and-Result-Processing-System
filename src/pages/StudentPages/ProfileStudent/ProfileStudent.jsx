import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  Card,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Tabs,
  Modal,
  Breadcrumb,
  Alert,
  Select,
} from "antd";
import { motion } from "framer-motion";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  BankOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ProfileStudent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const studentsRef = collection(db, "students");
        const studentSnapshot = await getDocs(studentsRef);
        const studentDoc = studentSnapshot.docs.find(
          (doc) => doc.data().email === user.email
        );

        if (studentDoc) {
          const student = {
            id: studentDoc.id,
            ...studentDoc.data(),
            yearOfAdmission: new Date().getFullYear(), // Current year
          };
          setStudentData(student);
          form.setFieldsValue(student);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        message.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [form]);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const studentRef = doc(db, "students", studentData.id);
      
      // Validate required fields
      if (!values.gender || !values.phoneNumber || !values.dateOfBirth) {
        message.error('Please fill in all required fields');
        return;
      }

      // Only update editable fields
      await updateDoc(studentRef, {
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth
      });

      setEditMode(false);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please check all required fields.');
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(studentData);
    setEditMode(false);
  };

  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };

  const handlePasswordChange = async (values) => {
    try {
      const user = auth.currentUser;
      
      // Reset status at the start
      setPasswordChangeStatus({ type: 'info', message: 'Verifying credentials...' });
      
      if (!user) {
        setPasswordChangeStatus({ type: 'error', message: 'No user logged in' });
        return;
      }

      const currentPassword = Modal.confirm.currentPassword;
      if (!currentPassword) {
        setPasswordChangeStatus({ type: 'error', message: 'Please enter your current password' });
        return;
      }

      try {
        // Create credential with current password
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

        // Reauthenticate
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, values.newPassword);
        
        // Success handling
        setPasswordChangeStatus({
          type: 'success',
          message: 'Password changed successfully! You will be logged out in 3 seconds.'
        });

        // Reset form and close modal
        passwordForm.resetFields();
        
        // Delayed logout
        setTimeout(async () => {
          try {
            await logout();
            navigate('/student/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        }, 3000);

      } catch (error) {
        console.error('Password change error:', error);
        if (error.code === 'auth/wrong-password') {
          setPasswordChangeStatus({
            type: 'error',
            message: 'Current password is incorrect'
          });
        } else {
          setPasswordChangeStatus({
            type: 'error',
            message: 'Failed to change password. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Error in password change:', error);
      setPasswordChangeStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  };

  // Avatar upload props
  const uploadProps = {
    name: "avatar",
    action: "/api/upload", // This would be your actual upload endpoint
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG files!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === "done") {
        message.success(`${info.file.name} uploaded successfully`);
        // Handle the uploaded image, typically by updating the avatar state or URL
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar Navigation */}

      <Layout>
        {/* Top Header */}

        {/* Main Content */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
            minHeight: 280,
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Title level={2}>Student Profile</Title>
              <Paragraph type="secondary">
                View and manage your profile information
              </Paragraph>
            </motion.div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Personal Information" key="1">
                <motion.div variants={containerVariants}>
                  <Row gutter={[24, 24]}>
                    {/* Profile Picture Column */}
                    <Col xs={24} md={8}>
                      <motion.div variants={itemVariants}>
                        <Card
                          bordered={false}
                          style={{
                            textAlign: "center",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          }}
                        >
                          <div style={{ marginBottom: "24px" }}>
                            <Avatar
                              size={120}
                              icon={<UserOutlined />}
                              style={{ backgroundColor: "#4CAF50" }}
                            />
                            <Upload {...uploadProps}>
                              <Button
                                shape="circle"
                                icon={<CameraOutlined />}
                                style={{
                                  position: "absolute",
                                  marginTop: "85px",
                                  marginLeft: "-30px",
                                  backgroundColor: "#fff",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  border: "none",
                                }}
                              />
                            </Upload>
                          </div>
                          <Title level={4}>{studentData?.name}</Title>
                          <Text type="secondary">
                            {studentData?.matricNumber}
                          </Text>
                          <div style={{ marginTop: "8px" }}>
                            <Text>{studentData?.department}</Text>
                          </div>
                          <div style={{ marginTop: "8px" }}>
                            <Text>{studentData?.level}</Text>
                          </div>
                          <Divider />
                          <Button
                            type="primary"
                            icon={<LockOutlined />}
                            onClick={showPasswordModal}
                            style={{
                              backgroundColor: "#4CAF50",
                              borderColor: "#4CAF50",
                            }}
                          >
                            Change Password
                          </Button>
                        </Card>
                      </motion.div>
                    </Col>

                    {/* Profile Form Column */}
                    <Col xs={24} md={16}>
                      <motion.div variants={itemVariants}>
                        <Card
                          bordered={false}
                          style={{
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          }}
                          extra={
                            editMode ? (
                              <span>
                                <Button
                                  type="primary"
                                  icon={<SaveOutlined />}
                                  onClick={handleSave}
                                  style={{
                                    marginRight: "8px",
                                    backgroundColor: "#4CAF50",
                                    borderColor: "#4CAF50",
                                  }}
                                >
                                  Save
                                </Button>
                                <Button onClick={handleCancel}>Cancel</Button>
                              </span>
                            ) : (
                              <Button
                                type="default"
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                              >
                                Edit Profile
                              </Button>
                            )
                          }
                          title={<Title level={4}>Personal Information</Title>}
                        >
                          <Form
                            form={form}
                            layout="vertical"
                            initialValues={studentData}
                          >
                            <Row gutter={16}>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Full Name"
                                  name="name"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please input your name!",
                                    },
                                  ]}
                                >
                                  <Input prefix={<UserOutlined />} disabled />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Matric Number"
                                  name="matricNumber"
                                >
                                  <Input
                                    prefix={<IdcardOutlined />}
                                    disabled // Always disabled as matriculation number typically shouldn't be changed
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Email"
                                  name="email"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please input your email!",
                                    },
                                    {
                                      type: "email",
                                      message: "Please enter a valid email!",
                                    },
                                  ]}
                                >
                                  <Input prefix={<MailOutlined />} disabled />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item label="Department" name="department">
                                  <Input
                                    prefix={<BankOutlined />}
                                    disabled // Typically department changes would be handled by administration
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Year of Admission"
                                  name="yearOfAdmission"
                                >
                                  <Input disabled />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Date of Birth"
                                  name="dateOfBirth"
                                  rules={[
                                    {
                                      required: true,
                                      message:
                                        "Please enter your date of birth",
                                    },
                                  ]}
                                >
                                  <Input disabled={!editMode} />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Gender"
                                  name="gender"
                                  rules={[{ required: true, message: 'Please select your gender' }]}
                                >
                                  <Select disabled={!editMode}>
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={12}>
                                <Form.Item
                                  label="Phone Number"
                                  name="phoneNumber"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter your phone number",
                                    },
                                  ]}
                                >
                                  <Input disabled={!editMode} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form>
                        </Card>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </TabPane>
            </Tabs>
          </motion.div>
        </Content>
      </Layout>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          setPasswordChangeStatus(null);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Input.Password
            placeholder="Enter your current password"
            onChange={(e) => {
              Modal.confirm.currentPassword = e.target.value;
            }}
          />
        </div>

        {passwordChangeStatus && (
          <Alert
            message={passwordChangeStatus.message}
            type={passwordChangeStatus.type}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters long!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              block
              style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProfileStudent;
