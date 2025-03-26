import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Skeleton } from 'antd';
import { auth, db } from '../../../firebase/firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import DashboardContent from '../DashboardContent/DashboardContent';
import StudentLayout from '../StudentLayout/StudentLayout';

const { Text } = Typography;

const StudentDashboard = () => {
  const [viewMode, setViewMode] = useState('table');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentAndCourses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/student/login');
          return;
        }

        // Fetch student data using email
        const studentsRef = collection(db, 'students');
        const studentSnapshot = await getDocs(studentsRef);
        const studentDoc = studentSnapshot.docs.find(doc => doc.data().email === user.email);

        if (studentDoc) {
          const student = studentDoc.data();
          // Include the entire studentDoc data with id
          setStudentData({
            id: studentDoc.id,
            ...student
          });

          // Fetch courses data
          const coursesData = await Promise.all(
            (student.courses || []).map(async (courseId) => {
              const courseDoc = await getDoc(doc(db, 'courses', courseId));
              if (courseDoc.exists()) {
                return {
                  key: courseId,
                  ...courseDoc.data()
                };
              }
              return null;
            })
          );

          // Filter out any null values and set courses
          setCourses(coursesData.filter(course => course !== null));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndCourses();
  }, [navigate]);

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text) => <a href="#">{text}</a>,
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
    },
    {
      title: 'Course Unit',
      dataIndex: 'creditHours',
      key: 'creditHours',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    }
  ];

  return (
    <StudentLayout 
      studentData={studentData}
      selectedKey="dashboard"
      breadcrumbItems={['Dashboard']}
    >
      {loading ? (
        <div style={{ padding: '20px' }}>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: '20px' }} />
        </div>
      ) : (
        <DashboardContent 
          studentData={studentData}
          courses={courses}
          viewMode={viewMode}
          setViewMode={setViewMode}
          columns={columns}
          loading={loading}
        />
      )}
    </StudentLayout>
  );
};

export default StudentDashboard;