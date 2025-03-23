import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Card, message, Skeleton, List, Button, Avatar, Row, Col, Typography } from "antd";
import { HomeOutlined, ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { db } from "../../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AdminLayout from "../../AdminLayout";

const { Title, Text } = Typography;

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
              return courseSnap.exists()
                ? { id: courseSnap.id, ...courseSnap.data() }
                : null;
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
        <Breadcrumb.Item onClick={() => navigate("/admin/students/view")}>
          View Students
        </Breadcrumb.Item>
        <Breadcrumb.Item>Student Profile</Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : student ? (
        <Card
          title={`Student Profile - ${student.name}`}
          bordered
          extra={
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6} style={{ textAlign: 'center' }}>
              <Avatar
                size={150}
                src={student.profileImage?.data}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: student.profileImage?.data ? '#fff' : '#4CAF50',
                  marginBottom: 16 
                }}
              />
              <Title level={4}>{student.name}</Title>
              <Text type="secondary">{student.matricNumber}</Text>
            </Col>
            <Col xs={24} md={18}>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <p>
                  <strong>Email:</strong> {student.email}
                </p>
                <p>
                  <strong>Department:</strong> {student.department}
                </p>
                <p>
                  <strong>Phone Number:</strong> {student.phoneNumber || 'Not provided'}
                </p>
                <p>
                  <strong>Gender:</strong> {student.gender || 'Not provided'}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {student.dateOfBirth || 'Not provided'}
                </p>
              </div>
              
              <h3>Enrolled Courses:</h3>
              {courses && courses.length > 0 ? (
                <List
                  bordered
                  dataSource={courses}
                  renderItem={(course) => (
                    <List.Item>
                      {course.courseTitle} ({course.courseCode})
                    </List.Item>
                  )}
                />
              ) : (
                <p>No enrolled courses</p>
              )}
            </Col>
          </Row>
        </Card>
      ) : null}
    </AdminLayout>
  );
};

export default StudentProfile;
