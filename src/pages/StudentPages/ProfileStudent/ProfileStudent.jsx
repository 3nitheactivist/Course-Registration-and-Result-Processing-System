import React, { useState, useEffect, useRef } from "react";
import {
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
  Alert,
  Select,
  Skeleton,
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
  LoadingOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../StudentLayout/StudentLayout";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ProfileStudent = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);
  const navigate = useNavigate();
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

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
          
          // Set image preview if student has a profile image
          if (student.profileImage && student.profileImage.data) {
            setImagePreview(student.profileImage.data);
          }
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

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      setUploadLoading(true);
      const values = await form.validateFields();
      const studentRef = doc(db, "students", studentData.id);
      
      // Validate required fields
      if (!values.gender || !values.phoneNumber || !values.dateOfBirth) {
        message.error('Please fill in all required fields');
        setUploadLoading(false);
        return;
      }

      // Update fields
      const updateData = {
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth
      };
      
      // Add profile image if available
      if (imageFile && imagePreview) {
        updateData.profileImage = {
          data: imagePreview,
          uploaded: new Date().toISOString()
        };
      }

      // Update the document
      await updateDoc(studentRef, updateData);

      // Fetch the updated student data to refresh state
      const studentsRef = collection(db, "students");
      const studentSnapshot = await getDocs(studentsRef);
      const updatedStudentDoc = studentSnapshot.docs.find(
        (doc) => doc.id === studentData.id
      );

      if (updatedStudentDoc) {
        const updatedStudent = {
          id: updatedStudentDoc.id,
          ...updatedStudentDoc.data(),
          yearOfAdmission: studentData.yearOfAdmission
        };
        setStudentData(updatedStudent);
      }

      setEditMode(false);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please check all required fields.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(studentData);
    setEditMode(false);
    
    // Reset image preview to original if cancelling
    if (studentData && studentData.profileImage && studentData.profileImage.data) {
      setImagePreview(studentData.profileImage.data);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
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
            await auth.signOut();
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

  // The main profile content
  const profileContent = (
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
                      position: "relative"
                    }}
                  >
                    <div style={{ marginBottom: "24px", position: "relative" }}>
                      <Avatar
                        size={120}
                        icon={<UserOutlined />}
                        src={imagePreview}
                        style={{ backgroundColor: "#4CAF50" }}
                      />
                      {editMode && (
                        <Button
                          shape="circle"
                          icon={<CameraOutlined />}
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            position: "absolute",
                            bottom: 0,
                            right: "50%",
                            transform: "translateX(60px)",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            border: "none",
                          }}
                        />
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          
                          if (!file) return;
                          
                          // Check file size
                          if (file.size > 2 * 1024 * 1024) {
                            message.error('Image must be smaller than 2MB!');
                            return;
                          }
                          
                          // Save file to state
                          setImageFile(file);
                          
                          // Create preview
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImagePreview(event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
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
                            loading={uploadLoading}
                            style={{
                              marginRight: "8px",
                              backgroundColor: "#4CAF50",
                              borderColor: "#4CAF50",
                            }}
                          >
                            Save
                          </Button>
                          <Button onClick={handleCancel} disabled={uploadLoading}>Cancel</Button>
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

                      {editMode && (
                        <Row>
                          <Col xs={24}>
                            <Form.Item label="Photo Upload">
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ marginBottom: '10px' }}>
                                  <Text type="secondary">Click on the camera icon next to your profile picture to change your photo</Text>
                                </div>
                                {imageFile && (
                                  <div>
                                    <Text strong>{imageFile.name}</Text>
                                    <Text type="secondary"> - {(imageFile.size / 1024).toFixed(1)} KB</Text>
                                  </div>
                                )}
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </Form>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </TabPane>
      </Tabs>
    </motion.div>
  );

  return (
    <>
      <StudentLayout
        studentData={studentData}
        selectedKey="profile"
        breadcrumbItems={['Profile']}
      >
        {loading ? (
          // Skeleton Loading State
          <div>
            <Skeleton active paragraph={{ rows: 1 }} />
            <div style={{ marginTop: '24px' }}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Personal Information" key="1">
                  <Row gutter={[24, 24]}>
                    {/* Profile Picture Column Skeleton */}
                    <Col xs={24} md={8}>
                      <Card
                        bordered={false}
                        style={{
                          textAlign: "center",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Skeleton.Avatar active size={120} style={{ marginBottom: '24px' }} />
                          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '60%' }} />
                          <Divider />
                          <Skeleton.Button active style={{ width: '180px', height: '32px' }} />
                        </div>
                      </Card>
                    </Col>
                    
                    {/* Profile Form Column Skeleton */}
                    <Col xs={24} md={16}>
                      <Card
                        bordered={false}
                        style={{
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                        title={<Skeleton.Input style={{ width: 200 }} active />}
                        extra={<Skeleton.Button active />}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                          <Col xs={24} md={12}>
                            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </div>
          </div>
        ) : (
          profileContent
        )}
      </StudentLayout>

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
    </>
  );
};

export default ProfileStudent;
