// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Skeleton } from "antd";
// import {
//   Breadcrumb,
//   Table,
//   Input,
//   Space,
//   Button,
//   Modal,
//   Form,
//   Select,
//   Upload,
//   message,
// } from "antd";
// import {
//   HomeOutlined,
//   UploadOutlined,
//   PlusOutlined,
//   DeleteOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import Papa from "papaparse";
// import { db } from "../../../firebase/firebaseConfig";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
//   query,
//   where,
//   onSnapshot,
//   orderBy,
//   writeBatch,
// } from "firebase/firestore";
// import AdminLayout from "../AdminLayout";
// import { getAuth } from "firebase/auth";
// import "./EnrollStudents.css";

// const { Option } = Select;

// const EnrollStudents = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [form] = Form.useForm();
//   const [csvFile, setCsvFile] = useState(null);
//   const [alertMessage, setAlertMessage] = useState(null);
//   const [alertType, setAlertType] = useState("info");
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   const auth = getAuth();
//   const currentUser = auth.currentUser;

//   // Real-time listener for students created by the current admin (sorted by createdAt descending)
//   useEffect(() => {
//     if (!currentUser) return;
//     const q = query(
//       collection(db, "students"),
//       where("userId", "==", currentUser.uid),
//       orderBy("createdAt", "desc")
//     );
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setStudents(snapshot.docs.map((doc) => ({ key: doc.id, ...doc.data() })));
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, [currentUser]);

//   // Fetch courses created by the current admin
//   useEffect(() => {
//     if (!currentUser) return;
//     const fetchCourses = async () => {
//       const q = query(
//         collection(db, "courses"),
//         where("userId", "==", currentUser.uid)
//       );
//       const courseSnapshot = await getDocs(q);
//       const courseList = courseSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         title: doc.data().courseTitle,
//       }));
//       setCourses(courseList);
//     };
//     fetchCourses();
//   }, [currentUser]);

//   // Show alert with auto-dismiss
//   const showAlert = (message, type) => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setTimeout(() => setAlertMessage(null), 5000);
//   };

//   // Handle opening modal
//   // Handle opening modal
//   const showModal = () => {
//     setModalVisible(true);
//     form.resetFields();
//   };

//   // Handle closing modal
//   const closeModal = () => {
//     setModalVisible(false);
//   };
//   // Handle enrolling a student via form
//   // const handleEnrollStudent = async (values) => {
//   //   setLoading(true);
//   //   try {
//   //     // Check if student already exists for this admin
//   //     const q = query(
//   //       collection(db, "students"),
//   //       where("matricNumber", "==", values.matricNumber),
//   //       where("userId", "==", currentUser.uid)
//   //     );
//   //     const existingStudents = await getDocs(q);
//   //     if (!existingStudents.empty) {
//   //       // Close modal and reset form immediately for duplicates
//   //       closeModal();
//   //       form.resetFields();
//   //       showAlert(
//   //         `❌ Student with Matric Number "${values.matricNumber}" is already enrolled!`,
//   //         "error"
//   //       );
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     // Convert selected courses to an array of course IDs
//   //     const selectedCourseIDs = values.courses; // using course IDs directly

//   //     // Add new student with userId tied to the current admin
//   //     await addDoc(collection(db, "students"), {
//   //       name: values.name,
//   //       matricNumber: values.matricNumber,
//   //       email: values.email,
//   //       department: values.department,
//   //       courses: selectedCourseIDs,
//   //       createdAt: new Date(),
//   //       userId: currentUser.uid,
//   //     });

//   //     // On success, close modal and reset form before showing success alert
//   //     closeModal();
//   //     form.resetFields();
//   //     showAlert("✅ Student enrolled successfully!", "success");
//   //   } catch (error) {
//   //     console.error("❌ Error enrolling student:", error);
//   //     showAlert("⚠ Failed to enroll student!", "error");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleEnrollStudent = async (values) => {
//     setLoading(true);
//     try {
//       // 🔍 Check if student already exists in `students` collection
//       const q = query(
//         collection(db, "students"),
//         where("matricNumber", "==", values.matricNumber),
//         where("userId", "==", currentUser.uid)
//       );
//       const existingStudents = await getDocs(q);
//       if (!existingStudents.empty) {
//         closeModal();
//         form.resetFields();
//         showAlert(
//           `❌ Student with Matric Number "${values.matricNumber}" is already enrolled!`,
//           "error"
//         );
//         setLoading(false);
//         return;
//       }
  
//       // 🔍 Check if email is already in `users` collection
//       const userQuery = query(collection(db, "users"), where("email", "==", values.email));
//       const existingUser = await getDocs(userQuery);
//       if (!existingUser.empty) {
//         showAlert("⚠ Email already exists in users collection!", "warning");
//         setLoading(false);
//         return;
//       }
  
//       // ✅ Create user in Firebase Authentication
//       const auth = getAuth();
//       const defaultPassword = "student123"; // Default password (students should reset later)
//       const userCredential = await createUserWithEmailAndPassword(auth, values.email, defaultPassword);
//       const userId = userCredential.user.uid;
  
//       // ✅ Add student to `students` collection
//       const studentDoc = await addDoc(collection(db, "students"), {
//         name: values.name,
//         matricNumber: values.matricNumber,
//         email: values.email,
//         department: values.department,
//         courses: values.courses, // Store course IDs
//         createdAt: new Date(),
//         userId: currentUser.uid,
//       });
  
//       // ✅ Add student to `users` collection
//       await addDoc(collection(db, "users"), {
//         userId,
//         email: values.email,
//         matricNumber: values.matricNumber,
//         role: "student",
//         createdAt: new Date(),
//       });
  
//       showAlert("✅ Student enrolled successfully!", "success");
//       form.resetFields();
//       closeModal();
//     } catch (error) {
//       console.error("❌ Error enrolling student:", error);
//       showAlert("⚠ Failed to enroll student!", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle deleting a student
//   const handleDelete = async (studentId) => {
//     setLoading(true);
//     try {
//       await deleteDoc(doc(db, "students", studentId));
//       showAlert("✅ Student deleted successfully!", "success");
//     } catch (error) {
//       console.error("❌ Error deleting student:", error);
//       showAlert("⚠ Failed to delete student!", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle CSV Upload for enrolling students
//   const handleCSVUpload = () => {
//     if (!csvFile) {
//       showAlert("⚠ Please upload a CSV file.", "error");
//       return;
//     }
//     setLoading(true);

//     Papa.parse(csvFile, {
//       header: true,
//       skipEmptyLines: true,
//       complete: async (result) => {
//         try {
//           let successCount = 0;
//           let duplicateCount = 0;

//           for (const student of result.data) {
//             const {
//               name,
//               matricNumber,
//               email,
//               department,
//               courses: courseNames,
//             } = student;
//             if (!name || !matricNumber || !email || !department) {
//               showAlert(
//                 "⚠ Some fields are missing in the CSV file.",
//                 "warning"
//               );
//               continue;
//             }

//             // Check if student already exists for this admin
//             const q = query(
//               collection(db, "students"),
//               where("matricNumber", "==", matricNumber),
//               where("userId", "==", currentUser.uid)
//             );
//             const existingStudents = await getDocs(q);
//             if (!existingStudents.empty) {
//               console.log(`Skipping duplicate: ${matricNumber}`);
//               duplicateCount++;
//               continue;
//             }

//             // Convert course names (CSV may provide comma-separated course titles) to course IDs.
//             // It's recommended to have course IDs in CSV, but if not, we try to match by title.
//             const selectedCourseIDs = courseNames
//               .split(",")
//               .map(
//                 (courseTitle) =>
//                   courses.find(
//                     (course) => course.title.trim() === courseTitle.trim()
//                   )?.id || courseTitle.trim()
//               );

//             // Add new student with userId tied to current admin
//             await addDoc(collection(db, "students"), {
//               name,
//               matricNumber,
//               email,
//               department,
//               courses: selectedCourseIDs,
//               createdAt: new Date(),
//               userId: currentUser.uid,
//             });
//             successCount++;
//           }

//           showAlert(
//             `✅ CSV Upload: ${successCount} students added, ${duplicateCount} duplicates skipped.`,
//             "success"
//           );
//           setCsvFile(null);
//         } catch (error) {
//           console.error("❌ Error uploading CSV:", error);
//           showAlert("⚠ Failed to upload students.", "error");
//         } finally {
//           setLoading(false);
//         }
//       },
//     });
//   };

//   // Define table columns for students
//   const columns = [
//     { title: "Name", dataIndex: "name", key: "name" },
//     { title: "Matric Number", dataIndex: "matricNumber", key: "matricNumber" },
//     { title: "Email", dataIndex: "email", key: "email" },
//     { title: "Department", dataIndex: "department", key: "department" },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Button
//           icon={<DeleteOutlined />}
//           danger
//           onClick={() => handleDelete(record.key)}
//         >
//           Delete
//         </Button>
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
//         <Breadcrumb.Item>Enroll Student</Breadcrumb.Item>
//       </Breadcrumb>
//       <hr />
//       <h2>Enroll Students</h2>

//       {/* Alert Section */}
//       {alertMessage && (
//         <Alert
//           message={alertMessage}
//           type={alertType}
//           showIcon
//           closable
//           style={{ marginBottom: "16px" }}
//         />
//       )}

//       <Space style={{ marginBottom: 16 }}>
//         <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
//           Enroll Student
//         </Button>
//         <Upload
//           beforeUpload={(file) => setCsvFile(file)}
//           showUploadList={false}
//         >
//           <Button icon={<UploadOutlined />}>Upload CSV</Button>
//         </Upload>
//         <Button type="primary" onClick={handleCSVUpload} disabled={!csvFile}>
//           Process CSV
//         </Button>
//       </Space>

//       {/* Students Table */}
//       {loading ? (
//         <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
//       ) : (
//         <Table
//           columns={columns}
//           dataSource={students}
//           pagination={{ pageSize: 5 }}
//         />
//       )}

//       {/* Enroll Student Modal */}
//       <Modal
//         title="Enroll Student"
//         open={modalVisible}
//         onOk={() => form.submit()}
//         onCancel={closeModal}
//         confirmLoading={loading} // Adds loading spinner to the submit button
//         okButtonProps={{ disabled: loading }} // Disables the OK button when loading
//       >
//         <Form form={form} layout="vertical" onFinish={handleEnrollStudent}>
//           <Form.Item label="Name" name="name" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Matric Number"
//             name="matricNumber"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Email"
//             name="email"
//             rules={[{ required: true, type: "email" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Department"
//             name="department"
//             rules={[{ required: true }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Courses"
//             name="courses"
//             rules={[{ required: true }]}
//           >
//             <Select mode="multiple" placeholder="Select Courses">
//               {courses.map((course) => (
//                 <Option key={course.id} value={course.id}>
//                   {course.title}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </AdminLayout>
//   );
// };

// export default EnrollStudents;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Skeleton } from "antd";
import {
  Breadcrumb,
  Table,
  Input,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Upload,
  message,
} from "antd";
import {
  HomeOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import { db } from "../../../firebase/firebaseConfig";
import {
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import AdminLayout from "../AdminLayout";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Added createUserWithEmailAndPassword
import "./EnrollStudents.css";

const { Option } = Select;

const EnrollStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [csvFile, setCsvFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Real-time listener for students created by the current admin (sorted by createdAt descending)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "students"),
      // Changed: now we assume matric numbers are unique globally so we don’t filter by admin’s UID here
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ key: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch courses created by the current admin
  useEffect(() => {
    if (!currentUser) return;
    const fetchCourses = async () => {
      const q = query(
        collection(db, "courses"),
        where("userId", "==", currentUser.uid)
      );
      const courseSnapshot = await getDocs(q);
      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().courseTitle,
      }));
      setCourses(courseList);
    };
    fetchCourses();
  }, [currentUser]);

  // Show alert with auto-dismiss
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Handle opening modal
  const showModal = () => {
    setModalVisible(true);
    form.resetFields();
  };

  // Handle closing modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Modified: Handle enrolling a student via form
  // const handleEnrollStudent = async (values) => {
  //   setLoading(true);
  //   try {
  //     // 1. Check if a student with the provided matric number is already enrolled (globally)
  //     const studentQuery = query(
  //       collection(db, "students"),
  //       where("matricNumber", "==", values.matricNumber)
  //     );
  //     const existingStudentDocs = await getDocs(studentQuery);
  //     if (!existingStudentDocs.empty) {
  //       closeModal();
  //       form.resetFields();
  //       showAlert(
  //         `❌ Student with Matric Number "${values.matricNumber}" is already enrolled!`,
  //         "error"
  //       );
  //       setLoading(false);
  //       return;
  //     }

  //     // 2. Check if the email already exists in the users collection
  //     const userQuery = query(
  //       collection(db, "users"),
  //       where("email", "==", values.email)
  //     );
  //     const existingUserDocs = await getDocs(userQuery);

  //     let userId;
  //     if (existingUserDocs.empty) {
  //       // Email does not exist: Create user in Firebase Authentication with a default password
  //       const defaultPassword = "student123"; // Default password (students should reset later)
  //       const userCredential = await createUserWithEmailAndPassword(
  //         auth,
  //         values.email,
  //         defaultPassword
  //       );
  //       userId = userCredential.user.uid;
  //       // Add new user document to "users"
  //       await addDoc(collection(db, "users"), {
  //         userId,
  //         email: values.email,
  //         matricNumber: values.matricNumber,
  //         role: "student",
  //         createdAt: new Date(),
  //       });
  //     } else {
  //       // Email exists (the student self-registered)
  //       const userDoc = existingUserDocs.docs[0].data();
  //       userId = userDoc.userId; // use the existing UID
  //       // Optionally, update the existing user document with the matric number if not already set.
  //       // For example: updateDoc(existingUserDocs.docs[0].ref, { matricNumber: values.matricNumber });
  //     }

  //     // 3. Add the student record to the "students" collection
  //     await addDoc(collection(db, "students"), {
  //       name: values.name,
  //       matricNumber: values.matricNumber,
  //       email: values.email,
  //       department: values.department,
  //       courses: values.courses, // Store course IDs
  //       createdAt: new Date(),
  //       enrolledBy: currentUser.uid, // The admin who enrolled the student
  //       authUserId: userId, // Link to the Firebase Auth user ID
  //     });

  //     showAlert("✅ Student enrolled successfully!", "success");
  //     form.resetFields();
  //     closeModal();
  //   } catch (error) {
  //     console.error("❌ Error enrolling student:", error);
  //     showAlert("⚠ Failed to enroll student!", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Modified: Handle enrolling a student via form
const handleEnrollStudent = async (values) => {
  setLoading(true);
  try {
    // 1. Check if a student with the provided matric number is already enrolled (globally)
    const studentQuery = query(
      collection(db, "students"),
      where("matricNumber", "==", values.matricNumber)
    );
    const existingStudentDocs = await getDocs(studentQuery);
    if (!existingStudentDocs.empty) {
      closeModal();
      form.resetFields();
      showAlert(
        `❌ Student with Matric Number "${values.matricNumber}" is already enrolled!`,
        "error"
      );
      setLoading(false);
      return;
    }

    // 2. Check if the email already exists in the users collection
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", values.email)
    );
    const existingUserDocs = await getDocs(userQuery);

    let userId;
    if (existingUserDocs.empty) {
      // Email does not exist: Create user in Firebase Authentication with a default password
      const defaultPassword = "student123"; // Default password (students should reset later)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        defaultPassword
      );
      userId = userCredential.user.uid;
      // Use setDoc instead of addDoc to set the document ID to the student’s UID
      await setDoc(doc(db, "users", userId), {
        userId,
        email: values.email,
        matricNumber: values.matricNumber,
        role: "student",
        createdAt: new Date(),
      });
    } else {
      // Email exists (the student self-registered)
      const userDoc = existingUserDocs.docs[0].data();
      userId = userDoc.userId; // use the existing UID
      // Optionally, update the existing user document with the matric number if needed.
    }

    // 3. Add the student record to the "students" collection
    await addDoc(collection(db, "students"), {
      name: values.name,
      matricNumber: values.matricNumber,
      email: values.email,
      department: values.department,
      courses: values.courses, // Store course IDs
      createdAt: new Date(),
      enrolledBy: currentUser.uid, // The admin who enrolled the student
      authUserId: userId, // Link to the Firebase Auth user ID
    });

    showAlert("✅ Student enrolled successfully!", "success");
    form.resetFields();
    closeModal();
  } catch (error) {
    console.error("❌ Error enrolling student:", error);
    showAlert("⚠ Failed to enroll student!", "error");
  } finally {
    setLoading(false);
  }
};
  // Handle deleting a student
  const handleDelete = async (studentId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "students", studentId));
      showAlert("✅ Student deleted successfully!", "success");
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      showAlert("⚠ Failed to delete student!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV Upload for enrolling students
  const handleCSVUpload = () => {
    if (!csvFile) {
      showAlert("⚠ Please upload a CSV file.", "error");
      return;
    }
    setLoading(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          let successCount = 0;
          let duplicateCount = 0;

          for (const student of result.data) {
            const { name, matricNumber, email, department, courses: courseNames } =
              student;
            if (!name || !matricNumber || !email || !department) {
              showAlert(
                "⚠ Some fields are missing in the CSV file.",
                "warning"
              );
              continue;
            }

            // Check if student already exists (by matric number)
            const q = query(
              collection(db, "students"),
              where("matricNumber", "==", matricNumber)
            );
            const existingStudents = await getDocs(q);
            if (!existingStudents.empty) {
              console.log(`Skipping duplicate: ${matricNumber}`);
              duplicateCount++;
              continue;
            }

            // Convert course names (CSV may provide comma-separated course titles) to course IDs.
            const selectedCourseIDs = courseNames.split(",").map((courseTitle) =>
              courses.find(
                (course) => course.title.trim() === courseTitle.trim()
              )?.id || courseTitle.trim()
            );

            // Add new student record
            await addDoc(collection(db, "students"), {
              name,
              matricNumber,
              email,
              department,
              courses: selectedCourseIDs,
              createdAt: new Date(),
              enrolledBy: currentUser.uid,
            });
            successCount++;
          }

          showAlert(
            `✅ CSV Upload: ${successCount} students added, ${duplicateCount} duplicates skipped.`,
            "success"
          );
          setCsvFile(null);
        } catch (error) {
          console.error("❌ Error uploading CSV:", error);
          showAlert("⚠ Failed to upload students.", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Define table columns for students
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Matric Number", dataIndex: "matricNumber", key: "matricNumber" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Department", dataIndex: "department", key: "department" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record.key)}
        >
          Delete
        </Button>
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
        <Breadcrumb.Item>Enroll Student</Breadcrumb.Item>
      </Breadcrumb>
      <hr />
      <h2>Enroll Students</h2>

      {/* Alert Section */}
      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Enroll Student
        </Button>
        <Upload
          beforeUpload={(file) => setCsvFile(file)}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Upload CSV</Button>
        </Upload>
        <Button type="primary" onClick={handleCSVUpload} disabled={!csvFile}>
          Process CSV
        </Button>
      </Space>

      {/* Students Table */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={students}
          pagination={{ pageSize: 5 }}
        />
      )}

      {/* Enroll Student Modal */}
      <Modal
        title="Enroll Student"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={closeModal}
        confirmLoading={loading}
        okButtonProps={{ disabled: loading }}
      >
        <Form form={form} layout="vertical" onFinish={handleEnrollStudent}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Matric Number"
            name="matricNumber"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Courses"
            name="courses"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select Courses">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default EnrollStudents;
