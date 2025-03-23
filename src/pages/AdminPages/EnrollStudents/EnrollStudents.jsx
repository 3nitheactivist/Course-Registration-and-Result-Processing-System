import React, { useState, useEffect, useRef } from "react";
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
  serverTimestamp,
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
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
  Avatar,
} from "antd";
import {
  HomeOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  LoadingOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import { db, auth, studentAuth } from "../../../config/firebase";
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Real-time listener for students created by the current admin (sorted by createdAt descending)
  useEffect(() => {
    const q = query(
      collection(db, "students"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ key: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch courses created by the current admin
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, "courses");
        const q = query(
          coursesRef,
          where("userId", "==", auth.currentUser.uid),
          orderBy("courseTitle")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const courseList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCourses(courseList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching courses:", error);
        showAlert("Failed to load courses", "error");
      }
    };

    fetchCourses();
  }, []);

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
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle enrolling a student via form
  const handleEnrollStudent = async (values) => {
    setLoading(true);
    const adminUser = auth.currentUser;

    if (!adminUser) {
      showAlert("Admin session expired. Please log in again.", "error");
      setLoading(false);
      return;
    }

    try {
      // 1. Check for existing student
      const studentQuery = query(
        collection(db, "students"),
        where("matricNumber", "==", values.matricNumber)
      );
      const existingStudents = await getDocs(studentQuery);
      if (!existingStudents.empty) {
        showAlert(
          `Student with Matric Number "${values.matricNumber}" is already enrolled!`,
          "error"
        );
        setLoading(false);
        return;
      }

      // 2. Create student auth account using studentAuth
      const userCredential = await createUserWithEmailAndPassword(
        studentAuth,
        values.email,
        "student123" // Default password
      );
      const newUserId = userCredential.user.uid;

      // 3. Create user document with matric number
      await setDoc(doc(db, "users", newUserId), {
        name: values.name,
        email: values.email,
        matricNumber: values.matricNumber,
        role: "student",
        createdAt: serverTimestamp(),
        createdBy: adminUser.uid
      });

      // 4. Create student record
      const studentData = {
        name: values.name,
        matricNumber: values.matricNumber,
        email: values.email,
        department: values.department,
        courses: values.courses,
        createdAt: serverTimestamp(),
        enrolledBy: adminUser.uid,
        userId: newUserId
      };
      
      // Add profile image if available
      if (imageFile && imagePreview) {
        studentData.profileImage = {
          data: imagePreview,
          uploaded: new Date().toISOString()
        };
      }

      await setDoc(doc(db, "students", newUserId), studentData);

      showAlert("✅ Student enrolled successfully!", "success");
      form.resetFields();
      setImageFile(null);
      setImagePreview(null);
      closeModal();
    } catch (error) {
      console.error("❌ Error enrolling student:", error);
      showAlert(`Failed to enroll student: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  
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
            const selectedCourseIDs = courseNames
              .split(",")
              .map(
                (courseTitle) =>
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
              enrolledBy: auth.currentUser.uid,
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
          {/* Profile Image Upload */}
          <Form.Item label="Student Photo">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Avatar 
                  size={104} 
                  icon={<UserOutlined />} 
                  src={imagePreview}
                  style={{ 
                    backgroundColor: '#4CAF50',
                    cursor: 'pointer',
                    border: '1px dashed #d9d9d9',
                  }} 
                  onClick={() => fileInputRef.current?.click()}
                />
                <Button
                  shape="circle"
                  icon={<CameraOutlined />}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    border: "none",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  // Check file size (max 2MB)
                  if (file.size > 2 * 1024 * 1024) {
                    message.error('Image must be smaller than 2MB!');
                    return;
                  }
                  
                  // Save file to state
                  setImageFile(file);
                  
                  // Create preview
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImagePreview(event.target.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              
              {imageFile && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontWeight: 'bold' }}>{imageFile.name}</span>
                  <span style={{ color: '#888' }}> - {(imageFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </Form.Item>

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
            rules={[{ required: true, message: 'Please select at least one course' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select courses"
              optionFilterProp="children"
              loading={!courses.length}
              showSearch
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {courses.map((course) => (
                <Select.Option 
                  key={course.id} 
                  value={course.id}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <strong>{course.courseCode}</strong> - {course.courseTitle}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.9em' }}>
                      {course.creditHours} CH
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {courses.length === 0 && (
            <Alert
              message="No courses found"
              description="You need to create some courses first before enrolling students."
              type="info"
              showIcon
              style={{ marginTop: '10px' }}
            />
          )}
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default EnrollStudents;
