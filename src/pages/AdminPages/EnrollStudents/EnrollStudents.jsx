import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
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
} from "@ant-design/icons";
import Papa from "papaparse";
import { db } from "../../../firebase/firebaseConfig";
import {
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

  // ✅ Real-time listener for students, sorted by `createdAt`
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ key: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      const courseSnapshot = await getDocs(collection(db, "courses"));
      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().courseTitle,
      }));
      setCourses(courseList);
    };
    fetchCourses();
  }, []);

  // ✅ Show alert with auto-dismiss
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // ✅ Handle opening modal
  const showModal = () => {
    setModalVisible(true);
    form.resetFields();
  };

  // ✅ Handle closing modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // ✅ Handle enrolling a student
  const handleEnrollStudent = async (values) => {
    setLoading(true);
    try {
      // 🔍 Check if student already exists
      const q = query(
        collection(db, "students"),
        where("matricNumber", "==", values.matricNumber)
      );
      const existingStudents = await getDocs(q);

      if (!existingStudents.empty) {
        showAlert(
          `❌ Student with Matric Number "${values.matricNumber}" is already enrolled!`,
          "error"
        );
        setLoading(false);
        return;
      }

      // ✅ Convert selected course titles to course IDs
      const selectedCourseIDs = values.courses.map(
        (courseTitle) =>
          courses.find((course) => course.title === courseTitle)?.id ||
          courseTitle
      );

      // ✅ Add new student
      await addDoc(collection(db, "students"), {
        name: values.name,
        matricNumber: values.matricNumber,
        email: values.email,
        department: values.department,
        courses: selectedCourseIDs, // Store course IDs
        createdAt: new Date(),
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

  // ✅ Handle deleting a student
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

  // ✅ Handle CSV Upload
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
            const {
              name,
              matricNumber,
              email,
              department,
              courses: courseNames,
            } = student;
            if (!name || !matricNumber || !email || !department) {
              showAlert(
                "⚠ Some fields are missing in the CSV file.",
                "warning"
              );
              continue;
            }

            // 🔍 Check if student already exists
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

            // ✅ Convert course names to course IDs
            const selectedCourseIDs = courseNames
              .split(",")
              .map(
                (courseTitle) =>
                  courses.find(
                    (course) => course.title.trim() === courseTitle.trim()
                  )?.id || courseTitle.trim()
              );

            // ✅ Add new student
            await addDoc(collection(db, "students"), {
              name,
              matricNumber,
              email,
              department,
              courses: selectedCourseIDs,
              createdAt: new Date(),
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

  // ✅ Define table columns
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
          Manage Students
        </Breadcrumb.Item>
        <Breadcrumb.Item>Enroll Student</Breadcrumb.Item>
      </Breadcrumb>
      <hr />
      <h2>Enroll Students</h2>

      {/* ✅ Alert Section (Success/Error) */}
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
      <Table
        columns={columns}
        dataSource={students}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      {/* ✅ Enroll Student Modal (Now Includes Course Selection) */}
      <Modal
        title="Enroll Student"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={closeModal}
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
                <Option key={course.id} value={course.title}>
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
