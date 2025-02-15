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