// import React, { useState } from "react";
// import { Layout, Menu, Avatar, Input, Button, Card, Typography } from "antd";
// import {
//   UserOutlined,
//   LogoutOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   BellOutlined,
// } from "@ant-design/icons";
// import logoYct from "../../../assets/Img/yctlogo[1] 1.png";
// import homei from "../../../assets/Img/home-icon.png";
// import coursei from "../../../assets/Img/course-icon.png";
// import useri from "../../../assets/Img/user-icon.png";
// import resulti from "../../../assets/Img/result-icon.png";
// import "./AdminDashboard.css";
// import { useAuth } from "../../../context/AuthContext";
// import { auth } from "../../../firebase/firebaseConfig";
// import { useNavigate } from "react-router-dom";



// // Add these lines
// const { Header, Content, Sider } = Layout;
// const { Search } = Input;
// const { Title, Text } = Typography;

// function AdminDashboard() {
//   // ... rest of your code
//   const { logout } = useAuth();
// const navigate = useNavigate();

//   const { user: currentUser } = useAuth(); // Instead of const { currentUser } = useAuth();

//   const [collapsed, setCollapsed] = useState(false);

//   const toggleSider = () => {
//     setCollapsed(!collapsed);
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate("/login");
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   console.log("Current User:", auth.currentUser);

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       <Sider
//         trigger={null}
//         collapsible
//         collapsed={collapsed}
//         style={{
//           backgroundColor: "white",
//           borderRight: "1px solid #f0f0f0",
//         }}
//       >
//         <div style={{ padding: "16px", textAlign: "left", marginLeft: "5px" }}>
//           <img
//             src={logoYct}
//             alt="YabaTech"
//             style={{ width: collapsed ? "40px" : "40px", height: "41px" }}
//           />
//           <span
//             style={{
//               opacity: collapsed ? "0" : "",
//               transition: collapsed ? " " : "ease-in .4s opacity",
//               marginLeft: collapsed ? "" : "10px",
//               color: "#5C5E64",
//               fontSize: "14px",
//               fontWeight: "500",
//             }}
//           >
//             YabaTech
//           </span>
//         </div>

//         <Menu
//           mode="inline"
//           defaultSelectedKeys={["1"]}
//           style={{ borderRight: 0 }}
//           theme="light"
//           // Add theme customization
//           className="custom-menu"
//         >
//           <Menu.Item
//             title="Dashboard"
//             key="1"
//             icon={
//               <img
//                 src={homei}
//                 alt="icon"
//                 style={{
//                   width: "16px", // Adjust size as needed
//                   height: "16px",
//                   verticalAlign: "middle",
//                   marginRight: "5px", // Spacing between icon and text
//                 }}
//               />
//             }
//           >
//             <span
//               style={{ color: "#5C5E64", fontSize: "14px", fontWeight: "500" }}
//             >
//               Dasboard
//             </span>
//           </Menu.Item>
//           <Menu.Item
//             title="User/Students"
//             key="2"
//             icon={
//               <img
//                 src={useri}
//                 alt="icon"
//                 style={{
//                   width: "16px",
//                   height: "16px",
//                   verticalAlign: "middle",
//                   marginRight: "5px",
//                 }}
//               />
//             }
//           >
//             <span
//               style={{ color: "#5C5E64", fontSize: "14px", fontWeight: "500" }}
//             >
//               {" "}
//               Users/Students{" "}
//             </span>
//           </Menu.Item>
//           <Menu.Item
//             title="Course"
//             key="3"
//             icon={
//               <img
//                 src={coursei}
//                 alt="icon"
//                 style={{
//                   width: "16px",
//                   height: "16px",
//                   verticalAlign: "middle",
//                   marginRight: "5px",
//                 }}
//               />
//             }
//           >
//             <span
//               style={{ color: "#5C5E64", fontSize: "14px", fontWeight: "500" }}
//             >
//               {" "}
//               Courses{" "}
//             </span>
//           </Menu.Item>
//           <Menu.Item
//             title="Results"
//             key="4"
//             icon={
//               <img
//                 src={resulti}
//                 alt="icon"
//                 style={{
//                   width: "16px",
//                   height: "16px",
//                   verticalAlign: "middle",
//                   marginRight: "5px",
//                 }}
//               />
//             }
//           >
//             <span
//               style={{ color: "#5C5E64", fontSize: "14px", fontWeight: "500" }}
//             >
//               {" "}
//               Results{" "}
//             </span>
//           </Menu.Item>
//         </Menu>

//         <div
//           style={{
//             position: "absolute",
//             bottom: "20px",
//             width: "100%",
//             padding: "0 16px",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               padding: "10px",
//               backgroundColor: "#f5f5f5",
//               borderRadius: "8px",
//             }}
//           >
//             <Avatar
//               icon={<UserOutlined />}
//               style={{
//                 width: collapsed ? "35px" : "",
//                 height: collapsed ? "30px" : "",
//               }}
//             />
//             {!collapsed && (
//               <div style={{ marginLeft: "12px" }}>
//                 <Text strong>{currentUser?.displayName || 'User'}</Text>
//                 <br />
//                 <Text type="secondary">Admin</Text>
//               </div>
//             )}
//           </div>
//           <Button
//             type="text"
//             danger
//             icon={<LogoutOutlined />}
//             style={{ width: "100%", marginTop: "10px" }}
//             onClick={handleLogout}
//           >
//             {!collapsed && "Log out"}
//           </Button>
//         </div>
//       </Sider>

//       <Layout>
//         <Header
//           style={{
//             padding: "0 16px",
//             background: "white",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Button
//             type="text"
//             icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//             onClick={toggleSider}
//           />
//           <Search
//             placeholder="Search"
//             style={{ width: 300, margin: "0 24px" }}
//           />
//           <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//             <Avatar icon={<UserOutlined />} />
//             <div>
//             <Text strong>{currentUser?.displayName || 'User'}</Text>
          
//             </div>

//             <Button
//               type="text"
//               icon={<BellOutlined />}
//               style={{ fontSize: "20px" }}
//             />
//           </div>
//         </Header>

//         <Content
//           style={{ margin: "24px 16px", padding: 24, background: "white" }}
//         >
//           <div
//             style={{
//               padding: "24px",
//               background: "#4CAF50",
//               borderRadius: "8px",
//               marginBottom: "24px",
//               color: "white",
//             }}
//           >
//             <Title level={2} style={{ color: "white", margin: 0 }}>
//               Welcome back, Mr Eni!
//             </Title>
//             <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
//               Always stay updated in your student portal
//             </Text>
//           </div>

//           <Title level={4}>Overview</Title>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(3, 1fr)",
//               gap: "16px",
//               marginTop: "16px",
//             }}
//           >
//             <Card title="Overview of courses">
//               <Text type="secondary">Add or remove courses</Text>
//             </Card>
//             <Card title="Overview of students">
//               <Text type="secondary">Check list of available student</Text>
//             </Card>
//             <Card title="Overview of results">
//               <Text type="secondary">Update result of student</Text>
//             </Card>
//           </div>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// }

// export default AdminDashboard;


import React from "react";
import AdminLayout from "../AdminLayout";
import { Typography, Card } from "antd";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div
        style={{
          padding: "24px",
          background: "#4CAF50",
          borderRadius: "8px",
          marginBottom: "24px",
          color: "white",
        }}
      >
        <Title level={2} style={{ color: "white", margin: 0 }}>
          Welcome back, Mr Eni!
        </Title>
        <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          Always stay updated in your student portal
        </Text>
      </div>

      <Title level={4}>Overview</Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {/* Your cards */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;