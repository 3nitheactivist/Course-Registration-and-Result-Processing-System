import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  Input,
  Space,
  Breadcrumb,
  Skeleton,
  message,
  Avatar,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { db } from "../../../../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import AdminLayout from "../../AdminLayout";
import { getAuth } from "firebase/auth";
// import "./ViewCourse.css";

const ManageStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Modified query to fetch all students without the userId filter
  useEffect(() => {
    const q = query(
      collection(db, "students"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Search function
  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter students based on search input
  const filteredStudents = students.filter((student) => {
    return (
      (student.name || "").toLowerCase().includes(searchText) ||
      (student.matricNumber || "").toLowerCase().includes(searchText) ||
      (student.email || "").toLowerCase().includes(searchText) ||
      (student.department || "").toLowerCase().includes(searchText)
    );
  });

  // Table Columns
  const columns = [
    {
      title: "Profile",
      dataIndex: "profileImage",
      key: "profileImage",
      render: (_, record) => (
        <Avatar
          size={40}
          src={record.profileImage?.data}
          icon={<UserOutlined />}
          style={{ backgroundColor: record.profileImage?.data ? '#fff' : '#4CAF50' }}
        />
      ),
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginLeft: 8 }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
      sorter: (a, b) => a.matricNumber.localeCompare(b.matricNumber),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Department", dataIndex: "department", key: "department" },
  ];

  return (
    <AdminLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/students")}>
          Manage Students
        </Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      <div className="manage-courses-container">
        <div className="manage-course-header">
          <h2>Manage Students</h2>
        </div>

        <div className="manage-course-body">
          <div className="manage-course-cards">
            <div
              className="manage-course-card"
              onClick={() => navigate("/admin/students/enroll")}
            >
              <div className="course-card-icon">
                <PlusOutlined />
              </div>
              <div>
                <h3>Enroll Students</h3>
                <p>Create new students</p>
              </div>
            </div>
            <div
              className="manage-course-card"
              onClick={() => navigate("/admin/students/view")}
            >
              <div className="course-card-icon">
                <EyeOutlined />
              </div>
              <div>
                <h3>View Students</h3>
                <p>Check list of enrolled students</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="manage-course-table">
            <div className="manage-course-table-title">
              <h2>Available Students</h2>
            </div>

            {/* Search Bar */}
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search students..."
                prefix={<SearchOutlined />}
                onChange={handleSearch}
                allowClear
              />
            </Space>

            {/* Show Skeleton while loading */}
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredStudents}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 200 }} // Fix table header
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageStudents;
