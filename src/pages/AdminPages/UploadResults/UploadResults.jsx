import React, { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import {
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  message,
  Tabs,
  Upload,
} from "antd";
import { calculateGrade, calculateGPA } from "../../../utils/gradeUtils";
import Papa from "papaparse";
import { db } from "../../../firebase/firebaseConfig"; // ensure your firebase is configured and exported
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
const { Title } = Typography;
const { TabPane } = Tabs;

const UploadResults = () => {
  // State to hold dynamic course and student data
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Fetch courses and students from Firebase on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesColRef = collection(db, "courses");
        const snapshot = await getDocs(coursesColRef);
        const coursesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        message.error("Failed to load courses");
        console.error("Courses fetch error:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        const studentsColRef = collection(db, "students");
        const snapshot = await getDocs(studentsColRef);
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);
      } catch (error) {
        message.error("Failed to load students");
        console.error("Students fetch error:", error);
      }
    };

    fetchCourses();
    fetchStudents();
  }, []);

  // ----- Single Upload Section -----
  const onFinishSingle = async (values) => {
    try {
      const { courseId, studentId, continuousAssessment, examScore, semester } =
        values;

      // Optional: fetch the selected course's grading scheme to validate scores
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDocs(collection(db, "courses")); // alternative if needed
      // For a single document:
      // const courseSnap = await getDoc(courseRef);
      // if (courseSnap.exists()) { ... }

      // If your course document contains a gradingScheme, validate scores
      // (Assuming you already fetched course details in courses state)
      const selectedCourse = courses.find((course) => course.id === courseId);
      if (selectedCourse && selectedCourse.gradingScheme) {
        const { caMax, examMax } = selectedCourse.gradingScheme;
        if (caMax && continuousAssessment > caMax) {
          message.error(
            `Continuous Assessment score exceeds maximum allowed (${caMax}) for this course`
          );
          return;
        }
        if (examMax && examScore > examMax) {
          message.error(
            `Exam score exceeds maximum allowed (${examMax}) for this course`
          );
          return;
        }
      }

      // Calculate total score, grade, and GPA
      const totalScore = continuousAssessment + examScore;
      const grade = calculateGrade(totalScore);
      const gpa = calculateGPA(grade);


      // Save the result in Firebase using addDoc
      await addDoc(collection(db, "results"), {
        courseId,
        studentId,
        continuousAssessment,
        examScore,
        grade,
        gpa,
        semester,
        createdAt: new Date(),
      });

      message.success("Result uploaded successfully!");
    } catch (error) {
      console.error("Error uploading result:", error);
      message.error("Failed to upload result.");
    }
  };

// ----- Bulk CSV Upload Section -----
const handleCSVUpload = (file) => {
  setUploadingBulk(true);
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const data = results.data; // Each row should include: courseId, studentId, continuousAssessment, examScore, semester
      try {
        // Use a batch write for efficiency
        const batch = writeBatch(db);
        data.forEach((record) => {
          const continuousAssessment = Number(record.continuousAssessment);
          const examScore = Number(record.examScore);
          const totalScore = continuousAssessment + examScore;
          const grade = calculateGrade(totalScore);
          const gpa = calculateGPA(grade);
          const docRef = doc(collection(db, "results"));
          batch.set(docRef, {
            courseId: record.courseId,
            studentId: record.studentId,
            continuousAssessment,
            examScore,
            grade,
            gpa,
            semester: record.semester,
            createdAt: new Date(),
          });
        });
        await batch.commit();
        message.success("Bulk results uploaded successfully!");
      } catch (error) {
        console.error("Bulk upload error:", error);
        message.error("Failed to upload bulk results.");
      }
      setUploadingBulk(false);
    },
    error: (error) => {
      console.error("CSV parse error:", error);
      message.error("Failed to parse CSV file.");
      setUploadingBulk(false);
    },
  });
  // Return false to prevent the Upload component from automatically uploading
  return false;
};


// ----- Assign Grading Scheme Section -----
const onFinishGradingScheme = async (values) => {
  try {
    const { courseId, caMax, examMax } = values;
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      gradingScheme: {
        caMax: Number(caMax),
        examMax: Number(examMax),
      },
    });
    message.success("Grading scheme updated successfully!");
  } catch (error) {
    console.error("Error updating grading scheme:", error);
    message.error("Failed to update grading scheme.");
  }
};

  return (
    <AdminLayout>
      <Title level={4}>Upload Results & Grading Scheme</Title>
      <Tabs defaultActiveKey="1">
        {/* Single Result Upload */}
        <TabPane tab="Single Upload" key="1">
          <Form layout="vertical" onFinish={onFinishSingle}>
            <Form.Item
              name="courseId"
              label="Course"
              rules={[{ required: true, message: "Please select a course" }]}
            >
              <Select placeholder="Select Course">
                {courses.map((course) => (
                  <Select.Option key={course.id} value={course.id}>
                    {course.courseName || course.id}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="studentId"
              label="Student"
              rules={[{ required: true, message: "Please select a student" }]}
            >
              <Select placeholder="Select Student">
                {students.map((student) => (
                  <Select.Option key={student.id} value={student.id}>
                    {student.name || student.id}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="continuousAssessment"
              label="Continuous Assessment"
              rules={[
                {
                  required: true,
                  message: "Please input continuous assessment score",
                },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="examScore"
              label="Exam Score"
              rules={[{ required: true, message: "Please input exam score" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="semester"
              label="Semester"
              rules={[{ required: true, message: "Please select a semester" }]}
            >
              <Select placeholder="Select Semester">
                <Select.Option value="FirstSemester">First</Select.Option>
                <Select.Option value="SecondSemster">Second</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Upload Result
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* Bulk CSV Upload */}
        <TabPane tab="Bulk CSV Upload" key="2">
          <Upload
            accept=".csv"
            beforeUpload={handleCSVUpload}
            showUploadList={false}
            disabled={uploadingBulk}
          >
            <Button loading={uploadingBulk}>Upload CSV</Button>
          </Upload>
          <p>
            CSV file should have headers:{" "}
            <code>
              courseId, studentId, continuousAssessment, examScore, semester
            </code>
          </p>
        </TabPane>

        {/* Assign Grading Scheme to a Course */}
        <TabPane tab="Assign Grading Scheme" key="3">
          <Form layout="vertical" onFinish={onFinishGradingScheme}>
            <Form.Item
              name="courseId"
              label="Course"
              rules={[{ required: true, message: "Please select a course" }]}
            >
              <Select placeholder="Select Course">
                {courses.map((course) => (
                  <Select.Option key={course.id} value={course.id}>
                    {course.courseName || course.id}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="caMax"
              label="Max Continuous Assessment Score"
              rules={[{ required: true, message: "Please input max CA score" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="examMax"
              label="Max Exam Score"
              rules={[
                { required: true, message: "Please input max Exam score" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Grading Scheme
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </AdminLayout>
  );
};

export default UploadResults;
