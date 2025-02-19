// import React, { useState, useEffect } from "react";
// import { Alert, Skeleton } from "antd";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Breadcrumb,
//   Table,
//   Input,
//   Space,
//   Spin,
//   message,
//   Button,
//   Modal,
//   Form,
//   Select,
// } from "antd";
// import {
//   HomeOutlined,
//   SearchOutlined,
//   EyeOutlined,
//   EditOutlined,
//   DeleteOutlined,
// } from "@ant-design/icons";
// import { db } from "../../../../firebase/firebaseConfig";

// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   doc,
//   deleteDoc,
//   updateDoc,
//   getDocs,
// } from "firebase/firestore";
// import AdminLayout from "../../AdminLayout";
// // import "./ViewStudents.css";

// const { Option } = Select;

// const ViewStudents = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [students, setStudents] = useState([]);
//   const [allCourses, setAllCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState("");
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [form] = Form.useForm();
//   const [alertMessage, setAlertMessage] = useState(null);
//   const [alertType, setAlertType] = useState("info");

//   // Real-time listener for students, sorted by createdAt (newest first)
//   useEffect(() => {
//     const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const studentList = snapshot.docs.map((doc) => ({
//         key: doc.id,
//         ...doc.data(),
//       }));
//       setStudents(studentList);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Fetch all courses from Firestore for the select options
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const courseSnapshot = await getDocs(collection(db, "courses"));
//         const courseList = courseSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           courseTitle: doc.data().courseTitle,
//         }));
//         setAllCourses(courseList);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//         message.error("Failed to load courses!");
//       }
//     };
//     fetchCourses();
//   }, []);

//   // Search function
//   const handleSearch = (e) => {
//     setSearchText(e.target.value.toLowerCase());
//   };

//   // Filter students based on search input
//   const filteredStudents = students.filter((student) => {
//     return (
//       (student.name || "").toLowerCase().includes(searchText) ||
//       (student.matricNumber || "").toLowerCase().includes(searchText) ||
//       (student.email || "").toLowerCase().includes(searchText) ||
//       (student.department || "").toLowerCase().includes(searchText)
//     );
//   });

//   // ✅ Show alert with auto-dismiss
//   const showAlert = (message, type) => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setTimeout(() => setAlertMessage(null), 5000);
//   };

//   // Handle deleting a student
//   const handleDelete = async (studentId) => {
//     setLoading(true);
//     try {
//       await deleteDoc(doc(db, "students", studentId));
//       message.success("✅ Student deleted successfully!");
//       showAlert("✅ Student deleted successfully!", "success");
//     } catch (error) {
//       console.error("❌ Error deleting student:", error);
//       message.error("⚠ Failed to delete student!");
//       showAlert("⚠ Failed to delete student!", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open edit modal
//   const handleEdit = (record) => {
//     setEditingStudent(record);
//     // When editing, set the courses field to the array of course IDs already stored
//     form.setFieldsValue({
//       ...record,
//       courses: record.courses || [],
//     });
//     setIsEditModalVisible(true);
//   };

//   // Update student in Firestore
//   const handleUpdateStudent = async () => {
//     try {
//       const values = await form.validateFields();
//       await updateDoc(doc(db, "students", editingStudent.key), values);
//       showAlert("✅ Student updated successfully!", "success");
//       message.success("✅ Student updated successfully!");
//       setIsEditModalVisible(false);
//       setEditingStudent(null);
//     } catch (error) {
//       console.error("❌ Error updating student:", error);
//       message.error("⚠ Failed to update student!");
//       showAlert("⚠ Failed to update student!", "error");
//     }
//   };

//   // Table Columns – Added View, Edit, Delete actions
//   const columns = [
//     { title: "Name", dataIndex: "name", key: "name" },
//     { title: "Matric Number", dataIndex: "matricNumber", key: "matricNumber" },
//     { title: "Email", dataIndex: "email", key: "email" },
//     { title: "Department", dataIndex: "department", key: "department" },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Button
//             icon={<EyeOutlined />}
//             onClick={() => navigate(`/admin/students/profile/${record.key}`)}
//           >
//             {/* View */}
//           </Button>
//           <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
//             {/* Edit */}
//           </Button>
//           <Button
//             icon={<DeleteOutlined />}
//             danger
//             onClick={() => handleDelete(record.key)}
//           >
//             {/* Delete */}
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <AdminLayout>
//       {/* Breadcrumb Navigation */}
//       <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
//         <Breadcrumb.Item onClick={() => navigate("/admin/students")}>
//           <HomeOutlined style={{ paddingInline: "10px" }} />
//           Manage Students
//         </Breadcrumb.Item>
//         <Breadcrumb.Item>View Students</Breadcrumb.Item>
//       </Breadcrumb>
//       <hr />

//       <div className="view-students-header">
//         <h2>View Students</h2>
//       </div>

//       {/* ✅ Alert Section (Success/Error) */}
//       {alertMessage && (
//         <Alert
//           message={alertMessage}
//           type={alertType}
//           showIcon
//           closable
//           style={{ marginBottom: "16px" }}
//         />
//       )}

//       {/* Search Bar */}
//       <Space style={{ marginBottom: 16 }}>
//         <Input
//           placeholder="Search students..."
//           prefix={<SearchOutlined />}
//           onChange={handleSearch}
//           allowClear
//         />
//       </Space>

//       {/* Show Spinner while loading */}
//       {loading ? (
//         <Skeleton active paragraph={{ rows: 6 }} title={false} />
//       ) : (
//         <Table
//           columns={columns}
//           dataSource={filteredStudents}
//           pagination={{ pageSize: 5 }}
//           scroll={{ y: 300 }}
//         />
//       )}

//       {/* Edit Student Modal */}
//       <Modal
//         title="Edit Student"
//         open={isEditModalVisible}
//         onOk={handleUpdateStudent}
//         onCancel={() => setIsEditModalVisible(false)}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             label="Name"
//             name="name"
//             rules={[{ required: true, message: "Please enter student name" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Matric Number"
//             name="matricNumber"
//             rules={[{ required: true, message: "Please enter matric number" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Email"
//             name="email"
//             rules={[
//               {
//                 required: true,
//                 type: "email",
//                 message: "Please enter a valid email",
//               },
//             ]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Department"
//             name="department"
//             rules={[{ required: true, message: "Please enter department" }]}
//           >
//             <Input />
//           </Form.Item>
//           {/* Select field for courses */}
//           <Form.Item
//             label="Courses"
//             name="courses"
//             rules={[{ required: true, message: "Please select courses" }]}
//           >
//             <Select mode="multiple" placeholder="Select Courses">
//               {allCourses.map((course) => (
//                 <Option key={course.id} value={course.id}>
//                   {course.courseTitle}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </AdminLayout>
//   );
// };

// export default ViewStudents;
import React, { useState, useEffect } from "react";
import { Alert, Skeleton } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  Table,
  Input,
  Space,
  Spin,
  message,
  Button,
  Modal,
  Form,
  Select,
} from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { db } from "../../../../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  where,
} from "firebase/firestore";
import AdminLayout from "../../AdminLayout";
import { getAuth } from "firebase/auth";
// import "./ViewStudents.css";

const { Option } = Select;

const ViewStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Real-time listener for students created by the current admin, sorted by createdAt (newest first)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "students"),
      where("userId", "==", currentUser.uid),
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
  }, [currentUser]);

  // Fetch all courses created by the current admin (for the select options)
  useEffect(() => {
    if (!currentUser) return;
    const fetchCourses = async () => {
      try {
        const q = query(
          collection(db, "courses"),
          where("userId", "==", currentUser.uid)
        );
        const courseSnapshot = await getDocs(q);
        const courseList = courseSnapshot.docs.map((doc) => ({
          id: doc.id,
          courseTitle: doc.data().courseTitle,
        }));
        setAllCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Failed to load courses!");
      }
    };
    fetchCourses();
  }, [currentUser]);

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

  // Show alert with auto-dismiss
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Handle deleting a student
  const handleDelete = async (studentId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "students", studentId));
      message.success("✅ Student deleted successfully!");
      showAlert("✅ Student deleted successfully!", "success");
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      message.error("⚠ Failed to delete student!");
      showAlert("⚠ Failed to delete student!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (record) => {
    setEditingStudent(record);
    // When editing, set the courses field to the array of course IDs already stored
    form.setFieldsValue({
      ...record,
      courses: record.courses || [],
    });
    setIsEditModalVisible(true);
  };

  // Update student in Firestore
  const handleUpdateStudent = async () => {
    try {
      const values = await form.validateFields();
      await updateDoc(doc(db, "students", editingStudent.key), values);
      showAlert("✅ Student updated successfully!", "success");
      message.success("✅ Student updated successfully!");
      setIsEditModalVisible(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("❌ Error updating student:", error);
      message.error("⚠ Failed to update student!");
      showAlert("⚠ Failed to update student!", "error");
    }
  };

  // Table Columns – Added View, Edit, Delete actions
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Matric Number", dataIndex: "matricNumber", key: "matricNumber" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Department", dataIndex: "department", key: "department" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/students/profile/${record.key}`)}
          >
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.key)}
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
        <Breadcrumb.Item onClick={() => navigate("/admin/students")}>
          <HomeOutlined style={{ paddingInline: "10px" }} />
          Manage Students
        </Breadcrumb.Item>
        <Breadcrumb.Item>View Students</Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      <div className="view-students-header">
        <h2>View Students</h2>
      </div>

      {/* Alert Section (Success/Error) */}
      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

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
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredStudents}
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      )}

      {/* Edit Student Modal */}
      <Modal
        title="Edit Student"
        open={isEditModalVisible}
        onOk={handleUpdateStudent}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter student name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Matric Number"
            name="matricNumber"
            rules={[{ required: true, message: "Please enter matric number" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please enter department" }]}
          >
            <Input />
          </Form.Item>
          {/* Select field for courses */}
          <Form.Item
            label="Courses"
            name="courses"
            rules={[{ required: true, message: "Please select courses" }]}
          >
            <Select mode="multiple" placeholder="Select Courses">
              {allCourses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.courseTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default ViewStudents;
