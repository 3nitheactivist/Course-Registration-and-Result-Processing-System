import React from "react";
import AdminLayout from "../AdminLayout";
import { Typography, Card } from "antd";
import { useAuth } from "../../../context/AuthContext";
import collegeStudent from "../../../assets/Img/5. College Student.png";
import backPack from "../../../assets/Img/Backpack.png";
import scholarcapScroll from "../../../assets/Img/Scholarcap scroll.png";
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
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
        {/* ADD DATE FUNCTION HERE E.G.  24 JANUARY, 2025 */}
        <Title level={2} style={{ color: "white", margin: 0 }}>
          Welcome back, Mr {currentUser?.displayName}!
        </Title>
        <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
          Always stay updated in your student portal
        </Text>

        {/* IMAGES */}
        <div>
          <img src={backPack} alt="logo" />
          <img src={collegeStudent} alt="" />
          <img src={scholarcapScroll} alt="" />
        </div>
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
