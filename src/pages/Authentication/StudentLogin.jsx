import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Card, Modal } from "antd";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const handlePasswordChange = async (values) => {
    try {
      const user = auth.currentUser;
      await updatePassword(user, values.newPassword);
      
      await updateDoc(doc(db, "users", user.uid), {
        hasChangedPassword: true
      });

      setIsPasswordModalVisible(false);
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Password change error:", error);
      setErrorMessage("Failed to change password. Please try again.");
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (!userDoc.exists()) {
        await auth.signOut();
        setErrorMessage("User account not found!");
        return;
      }

      const userData = userDoc.data();
      if (userData.role !== "student" || userData.matricNumber !== values.matricNumber) {
        await auth.signOut();
        setErrorMessage("⚠ Invalid email or matric number combination!");
        return;
      }

      if (!userData.hasChangedPassword && values.password === "student123") {
        setIsPasswordModalVisible(true);
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("❌ Login failed! Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
  };

  const cardStyle = {
    margin: "auto",
    width: "130%",
    maxWidth: "420px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    overflow: "hidden"
  };

  const headerStyle = {
    background: "#2c3e50",
    color: "white",
    fontSize: "24px",
    padding: "20px",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: "1px",
    marginBottom: "0"
  };

  const formStyle = {
    padding: "30px 25px"
  };

  const inputStyle = {
    height: "45px",
    borderRadius: "6px",
    fontSize: "16px"
  };

  const buttonStyle = {
    height: "45px",
    background: "#4CAF50",
    borderColor: "#4CAF50",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "15px"
  };

  const labelStyle = {
    fontSize: "16px",
    fontWeight: "500"
  };

  const forgotPasswordStyle = {
    textAlign: "right",
    marginTop: "-5px",
    marginBottom: "15px"
  };

  const forgotPasswordLinkStyle = {
    color: "#4CAF50",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div style={headerStyle}>Student Login Portal</div>
          </motion.div>
          <div style={formStyle}>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  message={errorMessage}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: 20, borderRadius: "6px" }}
                />
              </motion.div>
            )}
            <Form form={form} layout="vertical" onFinish={handleLogin} size="large">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Form.Item
                  label={<span style={labelStyle}>Email Address</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Invalid email format!" },
                  ]}
                >
                  <Input 
                    disabled={loading} 
                    style={inputStyle} 
                    placeholder="Enter your school email"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Form.Item
                  label={<span style={labelStyle}>Matric Number</span>}
                  name="matricNumber"
                  rules={[{ required: true, message: "Please input your matric number!" }]}
                >
                  <Input 
                    disabled={loading} 
                    style={inputStyle} 
                    placeholder="Enter your matric number"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Form.Item
                  label={<span style={labelStyle}>Password</span>}
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password
                    disabled={loading}
                    style={inputStyle}
                    placeholder="Enter your password"
                    iconRender={visible =>
                      visible ? <EyeInvisibleOutlined /> : <EyeOutlined />
                    }
                  />
                </Form.Item>
              </motion.div>

              <div style={forgotPasswordStyle}>
                <a style={forgotPasswordLinkStyle}>Forgot Password?</a>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={buttonStyle}
                  >
                    Login
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{ textAlign: "center", marginTop: "15px", color: "#666" }}
            >
              Need help? Contact IT Support
            </motion.div>
          </div>
        </Card>
      </motion.div>

      <Modal
        title="Change Your Password"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
        closable={false}
        maskClosable={false}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Alert
            message="For security reasons, please change your default password."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please input your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" }
            ]}
          >
            <Input.Password 
              style={inputStyle}
              placeholder="Enter your new password" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Please confirm your password!" },
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
            <Input.Password 
              style={inputStyle}
              placeholder="Confirm your new password" 
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={buttonStyle}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentLogin;