import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Card } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";


const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // 🔍 Check if student exists in "users" collection
      const userQuery = query(collection(db, "users"), where("email", "==", values.email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // 🔍 Check if student exists in "students" collection
        const studentQuery = query(collection(db, "students"), where("matricNumber", "==", values.matricNumber));
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          // ✅ Student found! Now log in via Firebase Auth
          await signInWithEmailAndPassword(auth, values.email, values.password);
          
          navigate("/student/dashboard"); // Redirect to Student Dashboard
        } else {
          setErrorMessage("Matric Number not found! Contact Admin.");
        }
      } else {
        setErrorMessage("Email not found! Ensure you are enrolled.");
      }
    } catch (error) {
      setErrorMessage("Login failed! Please check credentials.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card title="Student Login" bordered={false} className="login-card">
        {errorMessage && <Alert message={errorMessage} type="error" showIcon closable style={{ marginBottom: 16 }} />}
        
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}> 
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item label="Matric Number" name="matricNumber" rules={[{ required: true, message: "Please enter your matric number" }]}> 
            <Input placeholder="Enter matric number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StudentLogin;
