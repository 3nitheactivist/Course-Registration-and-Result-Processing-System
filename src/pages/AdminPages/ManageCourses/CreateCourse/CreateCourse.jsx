import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Upload,
  Switch,
  Row,
  Col,
  Alert,
  Result,
} from "antd";
import { HomeOutlined, InboxOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { db } from "../../../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AdminLayout from "../../AdminLayout";
import "./CreateCourse.css";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [importEnabled, setImportEnabled] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");


  const validateCSVData = (data) => {
    const requiredFields = ["courseTitle", "courseCode", "creditHours", "department", "semester", "level"];
  
    for (const row of data) {
      const missingFields = requiredFields.filter(field => !row[field]);
      if (missingFields.length > 0) {
        setAlertMessage(`Missing required fields: ${missingFields.join(", ")} in CSV data`);
        setAlertType("error");
        return false;
      }
    }
    return true;
  };
  

  const onFinish = async (values) => {
    if (importEnabled && csvFile) {
      await handleCSVUpload();
      return;
    }
  
    if (!values.courseCode) {
      setAlertMessage("Course Code is missing!");
      setAlertType("error");
      return;
    }
  
    setLoading(true);
    try {
      const normalizedCourseCode = values.courseCode.toLowerCase();
      const courseRef = collection(db, "courses");
      const q = query(courseRef, where("courseCode", "==", normalizedCourseCode));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        setAlertMessage("This course is already registered!");
        setAlertType("error");
        return;
      }
  
      await addDoc(courseRef, {
        courseTitle: values.courseTitle,
        courseCode: normalizedCourseCode,
        creditHours: Number(values.creditHours),
        department: values.department,
        semester: values.semester,
        level: values.level,
        createdAt: serverTimestamp(),
      });
  
      setAlertMessage("Course created successfully!");
      setAlertType("success");
  
      // ✨ Reset Form & Upload Field
      form.resetFields();
      setCsvFile(null);
  
      // ✨ Reset Upload.Dragger UI
      setTimeout(() => {
        document.querySelector(".ant-upload-list").innerHTML = "";
      }, 100);
  
      setSubmitStatus("success");
    } catch (error) {
      console.error("Error adding course:", error);
      setAlertMessage("An error occurred while creating the course.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setAlertMessage("Please upload a CSV file.");
      setAlertType("error");
      return;
    }
  
    setLoading(true);
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
  
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/['"]+/g, ""), // Normalize headers
        transform: (value) => value.trim().replace(/['"]+/g, ""),
        complete: async (result) => {
          console.log("📂 Parsed CSV Data:", result.data); // Debugging
  
          // ✅ Fix headers by mapping lowercase headers to expected camelCase format
          const fixedData = result.data.map((row) => ({
            courseTitle: row.coursetitle,
            courseCode: row.coursecode,
            creditHours: row.credithours,
            department: row.department,
            semester: row.semester,
            level: row.level,
          }));
  
          console.log("✅ Fixed CSV Data:", fixedData); // Debugging
  
          if (!validateCSVData(fixedData)) {
            setLoading(false);
            return;
          }
  
          try {
            const courseCollection = collection(db, "courses");
            let successCount = 0;
            let failureCount = 0;
  
            for (const course of fixedData) {
              try {
                const normalizedCourseCode = course.courseCode.toLowerCase();
                const q = query(courseCollection, where("courseCode", "==", normalizedCourseCode));
                const querySnapshot = await getDocs(q);
  
                if (!querySnapshot.empty) {
                  console.log(`Skipping duplicate course: ${course.courseCode}`);
                  failureCount++;
                  continue;
                }
  
                await addDoc(courseCollection, {
                  courseTitle: course.courseTitle,
                  courseCode: normalizedCourseCode,
                  creditHours: Number(course.creditHours),
                  department: course.department,
                  semester: course.semester,
                  level: course.level,
                  createdAt: serverTimestamp(),
                });
                successCount++;
              } catch (error) {
                console.error(`Error adding course ${course.courseCode}:`, error);
                failureCount++;
              }
            }
  
            setAlertMessage(
              `CSV Upload Complete: ${successCount} courses added, ${failureCount} failed/duplicates`
            );
            setAlertType(failureCount === 0 ? "success" : "warning");
  
            // ✨ Reset file input (Clears the uploaded file)
            setCsvFile(null);
  
            // ✨ Reset Upload.Dragger by clearing file list
            setTimeout(() => {
              document.querySelector(".ant-upload-list").innerHTML = ""; // Clear UI list
            }, 100);
  
            form.resetFields();
          } catch (error) {
            console.error("Error uploading CSV:", error);
            setAlertMessage("Failed to upload courses. Please try again.");
            setAlertType("error");
          } finally {
            setLoading(false);
          }
        },
      });
    };
  
    reader.readAsText(csvFile);
  };
  
  return (
    <AdminLayout>
      {/* Show success/error message if submission is completed */}
      {submitStatus ? (
        <Result
          status={submitStatus}
          title={
            submitStatus === "success"
              ? "Course Created Successfully!"
              : "Failed to Create Course"
          }
          subTitle={
            submitStatus === "success"
              ? "Your course has been created and is now available in the system."
              : "There was an error creating your course. Please try again."
          }
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => navigate("/admin/courses")}
            >
              Go to Courses
            </Button>,
            <Button key="retry" onClick={() => setSubmitStatus(null)}>
              Create Another
            </Button>,
          ]}
        />
      ) : (
        <>
          <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
            <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
              <HomeOutlined style={{ paddingInline: "10px" }} />
              Manage Courses
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create Course</Breadcrumb.Item>
          </Breadcrumb>

          <h2>Create Course</h2>

          {/* Show Ant Design Alert for Success or Error Messages */}
          {/* Show Ant Design Alert for Success or Error Messages */}
          {alertMessage && (
            <Alert
              message={alertMessage}
              type={alertType}
              showIcon
              closable
              style={{ marginBottom: "16px" }}
            />
          )}

          <div className="course-form-container">
            <Row gutter={24}>
              <Col span={14}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    label="Course Title"
                    name="courseTitle"
                    rules={[{ required: !importEnabled }]}
                  >
                    <Input placeholder="Enter course title" />
                  </Form.Item>

                  <Form.Item
                    label="Course Code"
                    name="courseCode"
                    rules={[{ required: !importEnabled }]}
                  >
                    <Input placeholder="Enter course code" />
                  </Form.Item>

                  <Form.Item
                    label="Credit Hours"
                    name="creditHours"
                    rules={[{ required: !importEnabled }]}
                  >
                    <Input placeholder="Enter credit hours" type="number" />
                  </Form.Item>

                  <Form.Item
                    label="Department"
                    name="department"
                    rules={[{ required: !importEnabled }]}
                  >
                    <Input placeholder="Enter department" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Semester"
                        name="semester"
                        rules={[{ required: !importEnabled }]}
                      >
                        <Input placeholder="Enter semester" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Level"
                        name="level"
                        rules={[{ required: !importEnabled }]}
                      >
                        <Input placeholder="Enter level" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Switch
                      checked={importEnabled}
                      checkedChildren="CSV Import Enabled"
                      unCheckedChildren="CSV Import Disabled"
                      onChange={(checked) => {
                        setImportEnabled(checked);
                        setCsvFile(null);
                        form.resetFields();
                      }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      disabled={importEnabled && !csvFile}
                    >
                      {importEnabled ? "Upload CSV" : "Save Course"}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>

              <Col span={10}>
                <div
                  className={`upload-section ${
                    !importEnabled ? "upload-disabled" : ""
                  }`}
                >
                  <h3>Upload CSV</h3>
                  <Upload.Dragger
                    name="file"
                    accept=".csv"
                    beforeUpload={() => false}
                    disabled={!importEnabled}
                    onChange={(info) => setCsvFile(info.file)}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      {importEnabled
                        ? "Click or drag CSV file to upload"
                        : "Enable CSV import to upload files"}
                    </p>
                    <p className="ant-upload-hint">
                      Bulk import course details using CSV format
                    </p>
                  </Upload.Dragger>
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default CreateCourse;
