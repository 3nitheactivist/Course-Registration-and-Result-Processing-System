import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Table,
  Input,
  Space,
  Button,
  Modal,
  Form,
  Skeleton,
  Alert,
} from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { db } from "../../../../firebase/firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import AdminLayout from "../../AdminLayout";
import "./ViewCourse.css";
import { getAuth } from "firebase/auth";

const ViewCourse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const [form] = Form.useForm();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    const courseCollection = collection(db, "courses");
    const q = query(courseCollection, where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));
      setCourses(courseList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredCourses = courses.filter((course) => {
    return (
      (course.courseCode || "").toLowerCase().includes(searchText) ||
      (course.courseTitle || "").toLowerCase().includes(searchText) ||
      (course.department || "").toLowerCase().includes(searchText) ||
      (course.semester || "").toLowerCase().includes(searchText)
    );
  });

  const confirmDelete = (courseIds) => {
    setCourseToDelete(courseIds);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setIsDeleteModalVisible(false);
    if (!courseToDelete || courseToDelete.length === 0) {
      setAlertMessage("Please select at least one course to delete!");
      setAlertType("warning");
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        courseToDelete.map(async (courseId) => {
          await deleteDoc(doc(db, "courses", courseId));
        })
      );

      setCourses((prevCourses) =>
        prevCourses.filter((course) => !courseToDelete.includes(course.key))
      );
      setSelectedRowKeys((prevKeys) =>
        prevKeys.filter((key) => !courseToDelete.includes(key))
      );
      setAlertMessage("Selected courses deleted successfully!");
      setAlertType("success");
    } catch (error) {
      console.error("Error deleting courses:", error);
      setAlertMessage("Failed to delete selected courses!");
      setAlertType("error");
    } finally {
      setLoading(false);
      setCourseToDelete([]);
    }
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleUpdateCourse = async () => {
    try {
      setIsUpdating(true);
      const values = await form.validateFields();
      await updateDoc(doc(db, "courses", editingCourse.key), values);
      setAlertMessage("Course updated successfully!");
      setAlertType("success");
      setIsEditModalVisible(false);
      setEditingCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      setAlertMessage("Failed to update course!");
      setAlertType("error");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    { title: "Course Code", dataIndex: "courseCode", key: "courseCode" },
    { title: "Course Title", dataIndex: "courseTitle", key: "courseTitle" },
    { title: "Course Unit", dataIndex: "creditHours", key: "creditHours" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Semester", dataIndex: "semester", key: "semester" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => confirmDelete([record.key])}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
          <HomeOutlined style={{ paddingInline: "10px" }} />
          Manage Courses
        </Breadcrumb.Item>
        <Breadcrumb.Item>View Course</Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      {/* Alert Message */}
      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          style={{ marginBottom: "16px" }}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="view-course-header">
        <h2>View Courses</h2>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search courses..."
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          allowClear
        />
      </Space>

      <Button
        type="danger"
        onClick={() => confirmDelete(selectedRowKeys)}
        disabled={selectedRowKeys.length === 0}
        style={{ marginBottom: 16 }}
      >
        Delete Selected
      </Button>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      ) : (
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          columns={columns}
          dataSource={filteredCourses}
          pagination={{ pageSize: 5 }}
        />
      )}

      <Modal
        title="Confirm Deletion"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      >
        <p>
          Are you sure you want to delete the selected course(s)? This action
          cannot be undone.
        </p>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course"
        open={isEditModalVisible}
        onOk={handleUpdateCourse}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Course Title"
            name="courseTitle"
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Course Code"
            name="courseCode"
            rules={[{ required: true, message: "Please enter course code" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Course Unit"
            name="creditHours"
            rules={[{ required: true, message: "Please enter credit hours" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please enter department" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Semester"
            name="semester"
            rules={[{ required: true, message: "Please enter semester" }]}
          >
            <Input disabled /> {/* Semester input is disabled */}
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default ViewCourse;
