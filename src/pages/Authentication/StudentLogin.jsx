// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Form, Input, Button, Alert, Card } from "antd";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { db, auth } from "../../firebase/firebaseConfig";
// import { collection, query, where, getDocs } from "firebase/firestore";


// const StudentLogin = () => {
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();

//   // const handleLogin = async (values) => {
//   //   setLoading(true);
//   //   setErrorMessage(null);
    
//   //   try {
//   //     // 🔍 Check if student exists in "users" collection
//   //     const userQuery = query(collection(db, "users"), where("email", "==", values.email));
//   //     const userSnapshot = await getDocs(userQuery);

//   //     if (!userSnapshot.empty) {
//   //       // 🔍 Check if student exists in "students" collection
//   //       const studentQuery = query(collection(db, "students"), where("matricNumber", "==", values.matricNumber));
//   //       const studentSnapshot = await getDocs(studentQuery);

//   //       if (!studentSnapshot.empty) {
//   //         // ✅ Student found! Now log in via Firebase Auth
//   //         await signInWithEmailAndPassword(auth, values.email, values.password);
          
//   //         navigate("/student/dashboard"); // Redirect to Student Dashboard
//   //       } else {
//   //         setErrorMessage("Matric Number not found! Contact Admin.");
//   //       }
//   //     } else {
//   //       setErrorMessage("Email not found! Ensure you are enrolled.");
//   //     }
//   //   } catch (error) {
//   //     setErrorMessage("Login failed! Please check credentials.");
//   //     console.error("Login Error:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleLogin = async (values) => {
//     setLoading(true);
//     setErrorMessage(null);
  
//     try {
//       // 🔍 Check if student exists in `users` collection
//       const userQuery = query(collection(db, "users"), where("email", "==", values.email));
//       const userSnapshot = await getDocs(userQuery);
  
//       if (userSnapshot.empty) {
//         setErrorMessage("⚠ Email not found! Ensure you are enrolled.");
//         setLoading(false);
//         return;
//       }
  
//       // 🔍 Check if student exists in `students` collection by matric number
//       const studentQuery = query(
//         collection(db, "students"),
//         where("matricNumber", "==", values.matricNumber)
//       );
//       const studentSnapshot = await getDocs(studentQuery);
  
//       if (studentSnapshot.empty) {
//         setErrorMessage("⚠ Matric Number not found! Contact Admin.");
//         setLoading(false);
//         return;
//       }
  
//       // ✅ Both email and matric number exist; Log in using Firebase Auth
//       await signInWithEmailAndPassword(auth, values.email, values.password);
//       navigate("/student/dashboard"); // Redirect to Student Dashboard
//     } catch (error) {
//       setErrorMessage("❌ Login failed! Please check credentials.");
//       console.error("Login Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
  


//     <div className="login-container">
//     <div className="login-form">
//       <div className="form-header">
//         <h2 className="form-title">Student Login</h2>
//       </div>

//       {errorMessage && <Alert message={errorMessage} type="error" showIcon closable style={{ marginBottom: 16 }} />}

//       <div className="form-group">
//         <input
//           className="form-input"
//           type="email"
//           placeholder="Email"
//          name="email"
//           // onChange={(e) => setEmail(e.target.value)}
//           disabled={loading}
//         />
//       </div>
//       <div className="form-group password-input-wrapper">
//         <input
//           className="form-input"
//           type="text"
//           placeholder="Enter matric number"
//           // value={password}
//           // onChange={(e) => setPassword(e.target.value)}
//           disabled={loading}
//         />
//         <button
//           type="button"
//           onClick={() => setShowPassword(!showPassword)}
//           className="password-toggle-btn"
//           disabled={loading}
//         >
//           {showPassword ? <EyeOffIcon /> : <EyeIcon />}
//         </button>
//       </div>

//       <div className="form-options">
//         <label className="remember-me">
//           <input
//             type="checkbox"
//             checked={rememberMe}
//             onChange={(e) => setRememberMe(e.target.checked)}
//             disabled={loading}
//           />
//           <span>Remember me</span>
//         </label>
//       </div>

//       <div className="form-actions">
//         <button
//           className="login-button"
//           type="button"
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           {loading ? <SyncLoader size={10} color="White" /> : "Login"}
//         </button>
//       </div>
//     </div>
//   </div>
// };

// export default StudentLogin;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Form, Input, Button, Alert, Card } from "antd";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { db, auth } from "../../firebase/firebaseConfig"
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

// const StudentLogin = () => {
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();

//   const handleLogin = async (values) => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       // Check if the email exists in the "users" collection
//       const userQuery = query(
//         collection(db, "users"),
//         where("email", "==", values.email)
//       );
//       const userSnapshot = await getDocs(userQuery);

//       if (userSnapshot.empty) {
//         setErrorMessage("⚠ Email not found! Ensure you are enrolled.");
//         setLoading(false);
//         return;
//       }

//       // Check if the matric number exists in the "students" collection
//       const studentQuery = query(
//         collection(db, "students"),
//         where("matricNumber", "==", values.matricNumber)
//       );
//       const studentSnapshot = await getDocs(studentQuery);

//       if (studentSnapshot.empty) {
//         setErrorMessage("⚠ Matric Number not found! Contact Admin.");
//         setLoading(false);
//         return;
//       }

//       // Both checks passed: Log in via Firebase Auth
//       await signInWithEmailAndPassword(auth, values.email, values.password);
//       navigate("/student/dashboard"); // Redirect to Student Dashboard
//     } catch (error) {
//       setErrorMessage("❌ Login failed! Please check credentials.");
//       console.error("Login Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container" style={{ padding: "50px 0", width: "100%" }}>
//       <Card
//         title="Student Login"
//         style={{ maxWidth: 400, margin: "auto" }}
//       >
//         {errorMessage && (
//           <Alert
//             message={errorMessage}
//             type="error"
//             showIcon
//             closable
//             style={{ marginBottom: 16 }}
//           />
//         )}
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleLogin}
//         >
//           <Form.Item
//             label="Email"
//             name="email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Invalid email!" },
//             ]}
//           >
//             <Input disabled={loading} />
//           </Form.Item>
//           <Form.Item
//             label="Matric Number"
//             name="matricNumber"
//             rules={[{ required: true, message: "Please input your matric number!" }]}
//           >
//             <Input disabled={loading} />
//           </Form.Item>
//           <Form.Item
//             label="Password"
//             name="password"
//             rules={[{ required: true, message: "Please input your password!" }]}
//           >
//             <Input.Password
//               disabled={loading}
//               iconRender={visible =>
//                 visible ? <EyeInvisibleOutlined /> : <EyeOutlined />
//               }
//             />
//           </Form.Item>
//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               block
//             >
//               Login
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default StudentLogin;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Form, Input, Button, Alert, Card } from "antd";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { db, auth } from "../../firebase/firebaseConfig";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

// const StudentLogin = () => {
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();

//   const handleLogin = async (values) => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       // Check if the email exists in the "users" collection
//       const userQuery = query(
//         collection(db, "users"),
//         where("email", "==", values.email)
//       );
//       const userSnapshot = await getDocs(userQuery);

//       if (userSnapshot.empty) {
//         setErrorMessage("⚠ Email not found! Ensure you are enrolled.");
//         setLoading(false);
//         return;
//       }

//       // Check if the matric number exists in the "students" collection
//       const studentQuery = query(
//         collection(db, "students"),
//         where("matricNumber", "==", values.matricNumber)
//       );
//       const studentSnapshot = await getDocs(studentQuery);

//       if (studentSnapshot.empty) {
//         setErrorMessage("⚠ Matric Number not found! Contact Admin.");
//         setLoading(false);
//         return;
//       }

//       // Both checks passed: Log in via Firebase Auth
//       await signInWithEmailAndPassword(auth, values.email, values.password);
//       navigate("/student/dashboard"); // Redirect to Student Dashboard
//     } catch (error) {
//       setErrorMessage("❌ Login failed! Please check credentials.");
//       console.error("Login Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ 
//       display: "flex", 
//       justifyContent: "center", 
//       alignItems: "center", 
//       padding: "50px 0", 
//       width: "100%",
//       minHeight: "100vh",
//       background: "linear-gradient(to right, #f5f7fa, #c3cfe2)"
//     }}>
//       <Card
//         title="Student Login"
//         style={{ 
//           maxWidth: 400, 
//           width: "90%",
//           boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//           borderRadius: "8px"
//         }}
//         headStyle={{ 
//           background: "#2c3e50", 
//           color: "white",
//           fontSize: "20px",
//           textAlign: "center",
//           padding: "16px"
//         }}
//       >
//         {errorMessage && (
//           <Alert
//             message={errorMessage}
//             type="error"
//             showIcon
//             closable
//             style={{ marginBottom: 16, borderRadius: "4px" }}
//           />
//         )}
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleLogin}
//         >
//           <Form.Item
//             label="Email"
//             name="email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Invalid email!" },
//             ]}
//           >
//             <Input 
//               disabled={loading} 
//               style={{ height: "38px", borderRadius: "4px" }}
//               placeholder="Enter your email address"
//             />
//           </Form.Item>
//           <Form.Item
//             label="Matric Number"
//             name="matricNumber"
//             rules={[{ required: true, message: "Please input your matric number!" }]}
//           >
//             <Input 
//               disabled={loading} 
//               style={{ height: "38px", borderRadius: "4px" }}
//               placeholder="Enter your matric number"
//             />
//           </Form.Item>
//           <Form.Item
//             label="Password"
//             name="password"
//             rules={[{ required: true, message: "Please input your password!" }]}
//           >
//             <Input.Password
//               disabled={loading}
//               style={{ height: "38px", borderRadius: "4px" }}
//               placeholder="Enter your password"
//               iconRender={visible =>
//                 visible ? <EyeInvisibleOutlined /> : <EyeOutlined />
//               }
//             />
//           </Form.Item>
//           <Form.Item style={{ marginBottom: "0" }}>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               block
//               style={{ 
//                 height: "40px", 
//                 borderRadius: "4px", 
//                 background: "#4CAF50", 
//                 borderColor: "#4CAF50",
//                 marginTop: "8px"
//               }}
//             >
//               Login
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default StudentLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Card } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Check if the email exists in the "users" collection
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", values.email)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setErrorMessage("⚠ Email not found! Ensure you are enrolled.");
        setLoading(false);
        return;
      }

      // Check if the matric number exists in the "students" collection
      const studentQuery = query(
        collection(db, "students"),
        where("matricNumber", "==", values.matricNumber)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setErrorMessage("⚠ Matric Number not found! Contact Admin.");
        setLoading(false);
        return;
      }

      // Both checks passed: Log in via Firebase Auth
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/student/dashboard"); // Redirect to Student Dashboard
    } catch (error) {
      setErrorMessage("❌ Login failed! Please check credentials.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
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
    </div>
  );
};

export default StudentLogin;