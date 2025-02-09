import "./ViewCourse.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Table } from "antd";
import AdminLayout from "../../AdminLayout";
import { HomeOutlined } from "@ant-design/icons";

const ViewCourse = () => {
  const navigate = useNavigate();

  // Example course data
  const courses = [
    {
      key: "1",
      courseCode: "CSC101",
      courseTitle: "Intro to Computer Science",
      creditHours: 3,
      department: "CS",
      semester: "First",
    },
  ];

  const columns = [
    { title: "Course Code", dataIndex: "courseCode", key: "courseCode" },
    { title: "Course Title", dataIndex: "courseTitle", key: "courseTitle" },
    { title: "Credit Hours", dataIndex: "creditHours", key: "creditHours" },
  ];

  return (
    <AdminLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
          <HomeOutlined
            style={{ paddingInline: "10px", alignItems: "center" }}
          />
          Manage Courses
        </Breadcrumb.Item>
        <Breadcrumb.Item>View Course</Breadcrumb.Item>
      </Breadcrumb>
      <hr />
    <div className="view-course-header">
        <h2>View Courses</h2>
    </div>
      
      <Table
        dataSource={courses}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </AdminLayout>
  );
};

export default ViewCourse;
