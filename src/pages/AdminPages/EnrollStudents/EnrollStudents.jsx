import React from "react";
import AdminLayout from "../AdminLayout";
import { Typography } from "antd";

const { Title } = Typography;

const EnrollStudents = () => {
  return (
    <AdminLayout>
      <Title level={2}>Users/Students</Title>
      {/* Add your users/students specific content here */}
        <h4>HALOOOOOOOOO, WELCOME!!</h4>
    </AdminLayout>
  );
};

export default EnrollStudents;