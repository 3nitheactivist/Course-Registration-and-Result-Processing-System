import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Card, Spin, List, Button, message, Skeleton } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import AdminLayout from "../../AdminLayout";
// import "./StudentProfile.css";

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student data & their enrolled courses
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const studentData = { id: studentSnap.id, ...studentSnap.data() };
          setStudent(studentData);

          // If student has course IDs, fetch detailed course info
          if (studentData.courses && studentData.courses.length > 0) {
            const coursePromises = studentData.courses.map(async (courseId) => {
              const courseRef = doc(db, "courses", courseId);
              const courseSnap = await getDoc(courseRef);
              return courseSnap.exists() ? { id: courseSnap.id, ...courseSnap.data() } : null;
            });
            const courseDetails = (await Promise.all(coursePromises)).filter(Boolean);
            setCourses(courseDetails);
          }
        } else {
          message.error("Student not found");
          navigate("/admin/students");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        message.error("Error loading student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, navigate]);

  return (
    <AdminLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/students")}>
          <HomeOutlined style={{ paddingInline: "10px" }} />
          Manage Students
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate("/admin/students/view")}>View Students</Breadcrumb.Item>
        <Breadcrumb.Item>Student Profile</Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      {loading ? (
        <Skeleton active paragraph={{ rows: 4}}/>
       
      ) : student ? (
        <Card
          title={`Student Profile - ${student.name}`}
          bordered
          extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>}
        >
          <p>
            <strong>Matric Number:</strong> {student.matricNumber}
          </p>
          <p>
            <strong>Email:</strong> {student.email}
          </p>
          <p>
            <strong>Department:</strong> {student.department}
          </p>
          <h3>Enrolled Courses:</h3>
          {courses && courses.length > 0 ? (
            <List
              bordered
              dataSource={courses}
              renderItem={(course) => <List.Item>{course.courseTitle} ({course.courseCode})</List.Item>}
            />
          ) : (
            <p>No enrolled courses</p>
          )}
        </Card>
      ) : null}
    </AdminLayout>
  );
};

export default StudentProfile;
