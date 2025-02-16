

// import React, { useState, useEffect } from "react";
// import AdminLayout from "../AdminLayout";
// import {
//   Typography,
//   Form,
//   InputNumber,
//   Select,
//   Button,
//   Tabs,
//   Upload,
//   Alert,
//   Space,
// } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import Papa from "papaparse";
// import { db } from "../../../firebase/firebaseConfig";
// import { calculateGradeAndGPA } from "../../../utils/gradeUtils";
// import {
//   collection,
//   addDoc,
//   doc,
//   updateDoc,
//   writeBatch,
//   getDocs,
// } from "firebase/firestore";

// const { Title } = Typography;
// const { TabPane } = Tabs;

// const UploadResults = () => {
//   const [courses, setCourses] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [uploadingBulk, setUploadingBulk] = useState(false);
//   const [alertState, setAlertState] = useState(null);
//   const [form] = Form.useForm();

//   // Add this after your imports
//   const testFirestore = async () => {
//     try {
//       const testDoc = await addDoc(collection(db, "test"), {
//         test: true,
//         timestamp: new Date(),
//       });
//       console.log("Firestore connection test successful:", testDoc.id);
//     } catch (error) {
//       console.error("Firestore connection test failed:", error);
//     }
//   };

//   const showAlert = (message, type = "success") => {
//     console.log("Showing alert:", { message, type }); // Debug log
//     setAlertState({ message, type });
//   };

//   useEffect(() => {
//     testFirestore();
//     fetchCourses();
//     fetchStudents();
//   }, []);

//   // Add this at the top of your component
//   useEffect(() => {
//     const unhandledRejection = (event) => {
//       console.error("Unhandled promise rejection:", event.reason);
//     };

//     window.addEventListener("unhandledrejection", unhandledRejection);
//     return () =>
//       window.removeEventListener("unhandledrejection", unhandledRejection);
//   }, []);

//   const fetchCourses = async () => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const snapshot = await getDocs(coursesColRef);
//       const coursesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setCourses(coursesData);
//     } catch (error) {
//       showAlert("Failed to load courses", "error");
//       console.error("Courses fetch error:", error);
//     }
//   };

//   const fetchStudents = async () => {
//     try {
//       const studentsColRef = collection(db, "students");
//       const snapshot = await getDocs(studentsColRef);
//       const studentsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setStudents(studentsData);
//     } catch (error) {
//       showAlert("Failed to load students", "error");
//       console.error("Students fetch error:", error);
//     }
//   };

//   const validateScores = (courseId, continuousAssessment, examScore) => {
//     const course = courses.find((c) => c.id === courseId);
//     if (course?.gradingScheme) {
//       const { caMax = 40, examMax = 60 } = course.gradingScheme;
//       if (continuousAssessment > caMax) {
//         throw new Error(`Continuous Assessment cannot exceed ${caMax}`);
//       }
//       if (examScore > examMax) {
//         throw new Error(`Exam score cannot exceed ${examMax}`);
//       }
//     }
//   };

//   const calculateGrade = (totalScore) => {
//     if (totalScore >= 70) return { grade: "A", gpa: 4.0 };
//     if (totalScore >= 60) return { grade: "B", gpa: 3.0 };
//     if (totalScore >= 50) return { grade: "C", gpa: 2.0 };
//     if (totalScore >= 45) return { grade: "D", gpa: 1.0 };
//     return { grade: "F", gpa: 0.0 };
//   };

//   const onFinishSingle = async (values) => {
//     try {
//       console.log("Starting upload process with values:", values); // Debug log
//       const { courseId, studentId, continuousAssessment, examScore, semester } =
//         values;

//       if (
//         !courseId ||
//         !studentId ||
//         !continuousAssessment ||
//         !examScore ||
//         !semester
//       ) {
//         throw new Error("All fields are required");
//       }

//       // Validate scores against grading scheme
//       validateScores(courseId, continuousAssessment, examScore);

//       // Calculate total score and grade
//       const totalScore = continuousAssessment + examScore;
//       console.log("Calculated total score:", totalScore); // Debug log

//       const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
//       console.log("Calculated grade info:", { grade, gpa, description }); // Debug log

//       // Prepare the result document
//       const resultDoc = {
//         courseId,
//         studentId,
//         continuousAssessment: Number(continuousAssessment),
//         examScore: Number(examScore),
//         totalScore,
//         grade,
//         gpa,
//         description,
//         semester,
//         createdAt: new Date(),
//       };

//       console.log("Saving result document:", resultDoc); // Debug log

//       // Save to Firestore
//       const resultsRef = collection(db, "results");
//       const docRef = await addDoc(resultsRef, resultDoc);

//       console.log("Document saved with ID:", docRef.id); // Debug log

//       showAlert("Result uploaded successfully!");
//       form.resetFields();
//     } catch (error) {
//       console.error("Error in onFinishSingle:", error); // Debug log
//       showAlert(error.message || "Failed to upload result", "error");
//     }
//   };
 
//   const handleCSVUpload = (file) => {
//     setUploadingBulk(true);
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: async (results) => {
//         try {
//           const batch = writeBatch(db);
//           const errors = [];

//           for (const record of results.data) {
//             try {
//               const continuousAssessment = Number(record.continuousAssessment);
//               const examScore = Number(record.examScore);

//               // Validate scores
//               validateScores(record.courseId, continuousAssessment, examScore);

//               const totalScore = continuousAssessment + examScore;
//               const { grade, gpa, description } =
//                 calculateGradeAndGPA(totalScore); // <- Updated here

//               const docRef = doc(collection(db, "results"));
//               batch.set(docRef, {
//                 courseId: record.courseId,
//                 studentId: record.studentId,
//                 continuousAssessment,
//                 examScore,
//                 totalScore,
//                 grade,
//                 gpa,
//                 description, // <- Add this if you want to store the description
//                 semester: record.semester,
//                 createdAt: new Date(),
//               });
//             } catch (error) {
//               errors.push(
//                 `Row ${results.data.indexOf(record) + 1}: ${error.message}`
//               );
//             }
//           }

//           if (errors.length > 0) {
//             throw new Error(`Validation errors:\n${errors.join("\n")}`);
//           }

//           await batch.commit();
//           showAlert("Bulk results uploaded successfully!");
//         } catch (error) {
//           showAlert(error.message || "Failed to upload bulk results", "error");
//           console.error("Bulk upload error:", error);
//         } finally {
//           setUploadingBulk(false);
//         }
//       },
//       error: (error) => {
//         showAlert("Failed to parse CSV file", "error");
//         console.error("CSV parse error:", error);
//         setUploadingBulk(false);
//       },
//     });
//     return false;
//   };

//   const onFinishGradingScheme = async (values) => {
//     try {
//       const { courseId, caMax, examMax } = values;

//       // Validate total adds up to 100
//       if (caMax + examMax !== 100) {
//         throw new Error("Total of CA and Exam maximum scores must equal 100");
//       }

//       const courseRef = doc(db, "courses", courseId);
//       await updateDoc(courseRef, {
//         gradingScheme: {
//           caMax: Number(caMax),
//           examMax: Number(examMax),
//         },
//       });

//       showAlert("Grading scheme updated successfully!");
//       form.resetFields();
//     } catch (error) {
//       showAlert(error.message || "Failed to update grading scheme", "error");
//       console.error("Error updating grading scheme:", error);
//     }
//   };

//   return (
//     <AdminLayout>
//       <Space direction="vertical" style={{ width: "100%" }}>
//         <Title level={4}>Upload Results & Grading Scheme</Title>

//         {/* Alert Component */}
//         {alertState && (
//           <Alert
//             message={alertState.message}
//             type={alertState.type}
//             showIcon
//             closable
//             onClose={() => setAlertState(null)}
//           />
//         )}

//         <Tabs defaultActiveKey="1">
//           {/* Single Result Upload */}
//           <TabPane tab="Single Upload" key="1">
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinishSingle}
//               onFinishFailed={(errorInfo) => {
//                 console.log("Form validation failed:", errorInfo);
//               }}
//             >
//               <Form.Item
//                 name="courseId"
//                 label="Course"
//                 rules={[{ required: true, message: "Please select a course" }]}
//               >
//                 <Select
//                   placeholder="Select Course"
//                   showSearch
//                   optionFilterProp="children"
//                 >
//                   {courses.map((course) => (
//                     <Select.Option key={course.id} value={course.id}>
//                       {`${course.courseCode} - ${course.courseTitle}`}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 name="studentId"
//                 label="Student"
//                 rules={[{ required: true, message: "Please select a student" }]}
//               >
//                 <Select
//                   placeholder="Select Student"
//                   showSearch
//                   optionFilterProp="children"
//                 >
//                   {students.map((student) => (
//                     <Select.Option key={student.id} value={student.id}>
//                       {`${student.matricNumber} - ${student.name}`}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 name="continuousAssessment"
//                 label="Continuous Assessment"
//                 rules={[
//                   {
//                     required: true,
//                     message: "Please input continuous assessment score",
//                   },
//                   {
//                     type: "number",
//                     min: 0,
//                     max: 40,
//                     message: "Score must be between 0 and 40",
//                   },
//                 ]}
//               >
//                 <InputNumber min={0} max={40} style={{ width: "100%" }} />
//               </Form.Item>

//               <Form.Item
//                 name="examScore"
//                 label="Exam Score"
//                 rules={[
//                   { required: true, message: "Please input exam score" },
//                   {
//                     type: "number",
//                     min: 0,
//                     max: 60,
//                     message: "Score must be between 0 and 60",
//                   },
//                 ]}
//               >
//                 <InputNumber min={0} max={60} style={{ width: "100%" }} />
//               </Form.Item>

//               <Form.Item
//                 name="semester"
//                 label="Semester"
//                 rules={[
//                   { required: true, message: "Please select a semester" },
//                 ]}
//               >
//                 <Select placeholder="Select Semester">
//                   <Select.Option value="FirstSemester">
//                     First Semester
//                   </Select.Option>
//                   <Select.Option value="SecondSemester">
//                     Second Semester
//                   </Select.Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   onClick={() => console.log("Button clicked")}
//                 >
//                   Upload Result
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>

//           {/* Bulk CSV Upload */}
//           <TabPane tab="Bulk CSV Upload" key="2">
//             <Space direction="vertical" style={{ width: "100%" }}>
//               <Upload
//                 accept=".csv"
//                 beforeUpload={handleCSVUpload}
//                 showUploadList={false}
//                 disabled={uploadingBulk}
//               >
//                 <Button icon={<UploadOutlined />} loading={uploadingBulk}>
//                   Upload CSV
//                 </Button>
//               </Upload>
//               <Alert
//                 message="CSV Format Requirements"
//                 description={
//                   <div>
//                     <p>CSV file should have the following headers:</p>
//                     <code>
//                       courseId,studentId,continuousAssessment,examScore,semester
//                     </code>
//                     <p>Notes:</p>
//                     <ul>
//                       <li>Continuous Assessment maximum score: 40</li>
//                       <li>Exam maximum score: 60</li>
//                       <li>
//                         Semester should be either "FirstSemester" or
//                         "SecondSemester"
//                       </li>
//                     </ul>
//                   </div>
//                 }
//                 type="info"
//               />
//             </Space>
//           </TabPane>

//           {/* Assign Grading Scheme */}
//           <TabPane tab="Assign Grading Scheme" key="3">
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinishGradingScheme}
//             >
//               <Form.Item
//                 name="courseId"
//                 label="Course"
//                 rules={[{ required: true, message: "Please select a course" }]}
//               >
//                 <Select
//                   placeholder="Select Course"
//                   showSearch
//                   optionFilterProp="children"
//                 >
//                   {courses.map((course) => (
//                     <Select.Option key={course.id} value={course.id}>
//                       {`${course.courseCode} - ${course.courseTitle}`}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 name="caMax"
//                 label="Maximum Continuous Assessment Score"
//                 rules={[
//                   { required: true, message: "Please input maximum CA score" },
//                   {
//                     type: "number",
//                     min: 0,
//                     max: 100,
//                     message: "Score must be between 0 and 100",
//                   },
//                 ]}
//               >
//                 <InputNumber min={0} max={100} style={{ width: "100%" }} />
//               </Form.Item>

//               <Form.Item
//                 name="examMax"
//                 label="Maximum Exam Score"
//                 rules={[
//                   {
//                     required: true,
//                     message: "Please input maximum exam score",
//                   },
//                   {
//                     type: "number",
//                     min: 0,
//                     max: 100,
//                     message: "Score must be between 0 and 100",
//                   },
//                 ]}
//               >
//                 <InputNumber min={0} max={100} style={{ width: "100%" }} />
//               </Form.Item>

//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Update Grading Scheme
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>
//         </Tabs>
//       </Space>
//     </AdminLayout>
//   );
// };

// export default UploadResults;


import React, { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import {
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  Alert,
  Tabs,
  Upload,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { db } from "../../../firebase/firebaseConfig";
import { calculateGradeAndGPA } from "../../../utils/gradeUtils";
import {
  collection,
  addDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";

const { Title } = Typography;
const { TabPane } = Tabs;

const UploadResults = () => {
  const [courses, setCourses] = useState([]); // All courses from Firestore
  const [students, setStudents] = useState([]); // All students from Firestore
  const [selectedStudent, setSelectedStudent] = useState(null); // Currently selected student (includes registered courses)
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [form] = Form.useForm();

  // Quick test to ensure Firestore is connected (optional)
  const testFirestore = async () => {
    try {
      const testDoc = await addDoc(collection(db, "test"), {
        test: true,
        timestamp: new Date(),
      });
      console.log("Firestore connection test successful:", testDoc.id);
    } catch (error) {
      console.error("Firestore connection test failed:", error);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlertState({ message, type });
  };

  useEffect(() => {
    testFirestore();
    fetchCourses();
    fetchStudents();
  }, []);

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
      showAlert("Failed to load courses", "error");
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
      showAlert("Failed to load students", "error");
      console.error("Students fetch error:", error);
    }
  };

  // When a student is selected, store the full student document in state.
  // (Each student document should have a "courses" field that is an array of course IDs.)
  const handleStudentChange = (studentId) => {
    form.setFieldsValue({ studentId });
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student);
    // Reset any previously entered scores
    form.setFieldsValue({ results: {} });
  };

  // onFinish for the Single Upload tab.
  // It loops over each course registered for the selected student and saves the corresponding result.
  const onFinishSingle = async (values) => {
    try {
      // Expected values structure:
      // {
      //   studentId,
      //   semester,
      //   results: {
      //      courseId1: { continuousAssessment, examScore },
      //      courseId2: { continuousAssessment, examScore },
      //      ... 
      //   }
      // }
      const { studentId, semester, results } = values;
      if (!studentId || !semester || !results) {
        throw new Error("Please fill in all required fields");
      }
      const studentCourses = selectedStudent?.courses || [];
      if (studentCourses.length === 0) {
        throw new Error("Selected student has no registered courses");
      }
      const batch = writeBatch(db);
      studentCourses.forEach((courseId) => {
        const scores = results[courseId];
        if (
          !scores ||
          scores.continuousAssessment === undefined ||
          scores.examScore === undefined
        ) {
          throw new Error(`Scores for course ${courseId} are missing`);
        }
        const continuousAssessment = Number(scores.continuousAssessment);
        const examScore = Number(scores.examScore);
        const totalScore = continuousAssessment + examScore;
        const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
        const resultDoc = {
          studentId,
          courseId,
          continuousAssessment,
          examScore,
          totalScore,
          grade,
          gpa,
          description,
          semester,
          createdAt: new Date(),
        };
        const resultDocRef = doc(collection(db, "results"));
        batch.set(resultDocRef, resultDoc);
      });
      await batch.commit();
      showAlert("Results uploaded successfully!");
      form.resetFields();
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error in onFinishSingle:", error);
      showAlert(error.message || "Failed to upload results", "error");
    }
  };

  // Bulk CSV Upload remains similar to before.
  const handleCSVUpload = (file) => {
    setUploadingBulk(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const batch = writeBatch(db);
          const errors = [];
          for (const record of results.data) {
            try {
              const continuousAssessment = Number(record.continuousAssessment);
              const examScore = Number(record.examScore);
              const totalScore = continuousAssessment + examScore;
              const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
              const docRef = doc(collection(db, "results"));
              batch.set(docRef, {
                courseId: record.courseId,
                studentId: record.studentId,
                continuousAssessment,
                examScore,
                totalScore,
                grade,
                gpa,
                description,
                semester: record.semester,
                createdAt: new Date(),
              });
            } catch (error) {
              errors.push(
                `Row ${results.data.indexOf(record) + 1}: ${error.message}`
              );
            }
          }
          if (errors.length > 0) {
            throw new Error(`Validation errors:\n${errors.join("\n")}`);
          }
          await batch.commit();
          showAlert("Bulk results uploaded successfully!");
        } catch (error) {
          showAlert(error.message || "Failed to upload bulk results", "error");
          console.error("Bulk upload error:", error);
        } finally {
          setUploadingBulk(false);
        }
      },
      error: (error) => {
        showAlert("Failed to parse CSV file", "error");
        console.error("CSV parse error:", error);
        setUploadingBulk(false);
      },
    });
    return false;
  };

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={4}>Upload Results</Title>

        {/* Alert Section */}
        {alertState && (
          <Alert
            message={alertState.message}
            type={alertState.type}
            showIcon
            closable
            onClose={() => setAlertState(null)}
          />
        )}

        <Tabs defaultActiveKey="1">
          {/* Single Upload Tab */}
          <TabPane tab="Single Upload" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinishSingle}
              onFinishFailed={(errorInfo) => {
                console.log("Form validation failed:", errorInfo);
              }}
            >
              {/* Student Selection (First) */}
              <Form.Item
                name="studentId"
                label="Student"
                rules={[{ required: true, message: "Please select a student" }]}
              >
                <Select
                  placeholder="Select Student"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleStudentChange}
                >
                  {students.map((student) => (
                    <Select.Option key={student.id} value={student.id}>
                      {`${student.matricNumber} - ${student.name}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Semester Selection */}
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: "Please select a semester" }]}
              >
                <Select placeholder="Select Semester">
                  <Select.Option value="FirstSemester">
                    First Semester
                  </Select.Option>
                  <Select.Option value="SecondSemester">
                    Second Semester
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Display Registered Courses for the Selected Student */}
              {selectedStudent &&
                selectedStudent.courses &&
                selectedStudent.courses.length > 0 && (
                  <>
                    <Title level={5}>Enter Scores for Registered Courses</Title>
                    {selectedStudent.courses.map((courseId) => {
                      // Find full course details from the preloaded courses list
                      const course = courses.find((c) => c.id === courseId);
                      if (!course) return null;
                      return (
                        <div
                          key={courseId}
                          style={{
                            border: "1px solid #f0f0f0",
                            padding: "16px",
                            marginBottom: "16px",
                          }}
                        >
                          <Title level={5}>
                            {`${course.courseCode} - ${course.courseTitle}`}
                          </Title>
                          <Form.Item
                            name={["results", courseId, "continuousAssessment"]}
                            label="Continuous Assessment"
                            rules={[
                              {
                                required: true,
                                message: "Please enter CA score",
                              },
                              {
                                type: "number",
                                min: 0,
                                max: 40,
                                message: "Score must be between 0 and 40",
                              },
                            ]}
                          >
                            <InputNumber min={0} max={40} style={{ width: "100%" }} />
                          </Form.Item>
                          <Form.Item
                            name={["results", courseId, "examScore"]}
                            label="Exam Score"
                            rules={[
                              {
                                required: true,
                                message: "Please enter Exam score",
                              },
                              {
                                type: "number",
                                min: 0,
                                max: 60,
                                message: "Score must be between 0 and 60",
                              },
                            ]}
                          >
                            <InputNumber min={0} max={60} style={{ width: "100%" }} />
                          </Form.Item>
                        </div>
                      );
                    })}
                  </>
                )}

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Upload Results
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Bulk CSV Upload Tab */}
          <TabPane tab="Bulk CSV Upload" key="2">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Upload
                accept=".csv"
                beforeUpload={handleCSVUpload}
                showUploadList={false}
                disabled={uploadingBulk}
              >
                <Button icon={<UploadOutlined />} loading={uploadingBulk}>
                  Upload CSV
                </Button>
              </Upload>
              <Alert
                message="CSV Format Requirements"
                description={
                  <div>
                    <p>CSV file should have the following headers:</p>
                    <code>
                      courseId,studentId,continuousAssessment,examScore,semester
                    </code>
                    <p>Notes:</p>
                    <ul>
                      <li>Continuous Assessment maximum score: 40</li>
                      <li>Exam maximum score: 60</li>
                      <li>
                        Semester should be either "FirstSemester" or "SecondSemester"
                      </li>
                    </ul>
                  </div>
                }
                type="info"
              />
            </Space>
          </TabPane>
        </Tabs>
      </Space>
    </AdminLayout>
  );
};

export default UploadResults;
