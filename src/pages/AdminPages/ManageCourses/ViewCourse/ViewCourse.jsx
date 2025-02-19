// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Breadcrumb,
//   Table,
//   Input,
//   Space,
//   Button,
//   Modal,
//   Form,
//   message,
//   Skeleton,
// } from "antd";
// import {
//   HomeOutlined,
//   SearchOutlined,
//   EditOutlined,
//   DeleteOutlined,
// } from "@ant-design/icons";
// import { db } from "../../../../firebase/firebaseConfig";
// import {
//   collection,
//   deleteDoc,
//   doc,
//   updateDoc,
//   onSnapshot,
// } from "firebase/firestore";
// import AdminLayout from "../../AdminLayout";
// import "./ViewCourse.css";

// const ViewCourse = () => {
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [editingCourse, setEditingCourse] = useState(null);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     // Firestore Real-time Listener
//     const courseCollection = collection(db, "courses");

//     const unsubscribe = onSnapshot(courseCollection, (snapshot) => {
//       const courseList = snapshot.docs.map((doc) => ({
//         key: doc.id,
//         ...doc.data(),
//       }));
//       setCourses(courseList);
//       setLoading(false);
//     });

//     // Cleanup subscription on component unmount
//     return () => unsubscribe();
//   }, []);

//   // Search function
//   const handleSearch = (e) => {
//     setSearchText(e.target.value.toLowerCase());
//   };

//   // Filter courses based on search
//   const filteredCourses = courses.filter((course) => {
//     return (
//       (course.courseCode || "").toLowerCase().includes(searchText) ||
//       (course.courseTitle || "").toLowerCase().includes(searchText) ||
//       (course.department || "").toLowerCase().includes(searchText) ||
//       (course.semester || "").toLowerCase().includes(searchText)
//     );
//   });

//   // Handle course deletion
//   // const handleDelete = async () => {
//   //   if (selectedRowKeys.length === 0) {
//   //     message.warning("Please select at least one course to delete!");
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     await Promise.all(selectedRowKeys.map(async (courseId) => {
//   //       await deleteDoc(doc(db, "courses", courseId));
//   //     }));

//   //     message.success("Selected courses deleted successfully!");
//   //     setSelectedRowKeys([]);
//   //   } catch (error) {
//   //     console.error("Error deleting courses:", error);
//   //     message.error("Failed to delete selected courses!");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleDelete = async (courseIds) => {
//     if (!courseIds || courseIds.length === 0) {
//       message.warning("Please select at least one course to delete!");
//       return;
//     }

//     setLoading(true);
//     try {
//       await Promise.all(
//         courseIds.map(async (courseId) => {
//           await deleteDoc(doc(db, "courses", courseId));
//         })
//       );

//       message.success("Selected courses deleted successfully!");
//       setSelectedRowKeys((prevKeys) =>
//         prevKeys.filter((key) => !courseIds.includes(key))
//       );
//     } catch (error) {
//       console.error("Error deleting courses:", error);
//       message.error("Failed to delete selected courses!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show edit modal
//   const handleEdit = (record) => {
//     setEditingCourse(record);
//     form.setFieldsValue(record);
//     setIsEditModalVisible(true);
//   };

//   // Update course in Firestore
//   const handleUpdateCourse = async () => {
//     try {
//       const values = await form.validateFields();
//       await updateDoc(doc(db, "courses", editingCourse.key), values);
//       message.success("Course updated successfully!");
//       setIsEditModalVisible(false);
//       setEditingCourse(null);
//     } catch (error) {
//       console.error("Error updating course:", error);
//       message.error("Failed to update course!");
//     }
//   };

//   // Table Columns
//   const columns = [
//     { title: "Course Code", dataIndex: "courseCode", key: "courseCode" },
//     { title: "Course Title", dataIndex: "courseTitle", key: "courseTitle" },
//     { title: "Credit Hours", dataIndex: "creditHours", key: "creditHours" },
//     { title: "Department", dataIndex: "department", key: "department" },
//     { title: "Semester", dataIndex: "semester", key: "semester" },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
//             Edit
//           </Button>
//           <Button
//             icon={<DeleteOutlined />}
//             danger
//             onClick={() => handleDelete([record.key])}
//           >
//             Delete
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <AdminLayout>
//       {/* Breadcrumb Navigation */}
//       <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
//         <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
//           <HomeOutlined style={{ paddingInline: "10px" }} />
//           Manage Courses
//         </Breadcrumb.Item>
//         <Breadcrumb.Item>View Course</Breadcrumb.Item>
//       </Breadcrumb>
//       <hr />

//       <div className="view-course-header">
//         <h2>View Courses</h2>
//       </div>

//       {/* Search Bar */}
//       <Space style={{ marginBottom: 16 }}>
//         <Input
//           placeholder="Search courses..."
//           prefix={<SearchOutlined />}
//           onChange={handleSearch}
//           allowClear
//         />
//       </Space>

//       {/* Delete Selected Button */}
//       <Button
//         type="danger"
//         onClick={handleDelete}
//         disabled={selectedRowKeys.length === 0}
//         style={{ marginBottom: 16 }}
//       >
//         Delete Selected
//       </Button>

//       {/* Course Table */}
//       {loading ? (
//         <Skeleton active paragraph={{ rows: 6 }} title={false} />
//       ) : (
//         <Table
//           rowSelection={{
//             selectedRowKeys,
//             onChange: (keys) => setSelectedRowKeys(keys),
//           }}
//           columns={columns}
//           dataSource={filteredCourses}
//           pagination={{ pageSize: 5 }}
//         />
//       )}

//       {/* Edit Course Modal */}
//       <Modal
//         title="Edit Course"
//         open={isEditModalVisible}
//         onOk={handleUpdateCourse}
//         onCancel={() => setIsEditModalVisible(false)}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             label="Course Title"
//             name="courseTitle"
//             rules={[{ required: true, message: "Please enter course title" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Course Code"
//             name="courseCode"
//             rules={[{ required: true, message: "Please enter course code" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Credit Hours"
//             name="creditHours"
//             rules={[{ required: true, message: "Please enter credit hours" }]}
//           >
//             <Input type="number" />
//           </Form.Item>
//           <Form.Item
//             label="Department"
//             name="department"
//             rules={[{ required: true, message: "Please enter department" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Semester"
//             name="semester"
//             rules={[{ required: true, message: "Please enter semester" }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </AdminLayout>
//   );
// };

// export default ViewCourse;

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
  message,
  Skeleton,
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
  const [form] = Form.useForm();

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Real-time Listener: Listen only for courses created by the current admin
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

  // Search function
  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter courses based on search text
  const filteredCourses = courses.filter((course) => {
    return (
      (course.courseCode || "").toLowerCase().includes(searchText) ||
      (course.courseTitle || "").toLowerCase().includes(searchText) ||
      (course.department || "").toLowerCase().includes(searchText) ||
      (course.semester || "").toLowerCase().includes(searchText)
    );
  });

  // Handle course deletion (single deletion here)
  const handleDelete = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) {
      message.warning("Please select at least one course to delete!");
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        courseIds.map(async (courseId) => {
          await deleteDoc(doc(db, "courses", courseId));
        })
      );
      message.success("Selected courses deleted successfully!");
      setSelectedRowKeys((prevKeys) =>
        prevKeys.filter((key) => !courseIds.includes(key))
      );
    } catch (error) {
      console.error("Error deleting courses:", error);
      message.error("Failed to delete selected courses!");
    } finally {
      setLoading(false);
    }
  };

  // Show edit modal
  const handleEdit = (record) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  // Update course in Firestore
  const handleUpdateCourse = async () => {
    try {
      const values = await form.validateFields();
      await updateDoc(doc(db, "courses", editingCourse.key), values);
      message.success("Course updated successfully!");
      setIsEditModalVisible(false);
      setEditingCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Failed to update course!");
    }
  };

  // Table columns definition
  const columns = [
    { title: "Course Code", dataIndex: "courseCode", key: "courseCode" },
    { title: "Course Title", dataIndex: "courseTitle", key: "courseTitle" },
    { title: "Credit Hours", dataIndex: "creditHours", key: "creditHours" },
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
            onClick={() => handleDelete([record.key])}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
          <HomeOutlined style={{ paddingInline: "10px" }} />
          Manage Courses
        </Breadcrumb.Item>
        <Breadcrumb.Item>View Course</Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      <div className="view-course-header">
        <h2>View Courses</h2>
      </div>

      {/* Search Bar */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search courses..."
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          allowClear
        />
      </Space>

      {/* Delete Selected Button */}
      <Button
        type="danger"
        onClick={() => handleDelete(selectedRowKeys)}
        disabled={selectedRowKeys.length === 0}
        style={{ marginBottom: 16 }}
      >
        Delete Selected
      </Button>

      {/* Course Table */}
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

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course"
        open={isEditModalVisible}
        onOk={handleUpdateCourse}
        onCancel={() => setIsEditModalVisible(false)}
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
            label="Credit Hours"
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
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default ViewCourse;
