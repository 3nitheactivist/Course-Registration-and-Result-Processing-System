// import React, { useState, useEffect } from "react";
// import AdminLayout from "../AdminLayout";
// import {
//   Typography,
//   Form,
//   InputNumber,
//   Select,
//   Button,
//   Alert,
//   Tabs,
//   Upload,
//   Space,
//   Breadcrumb,
// } from "antd";
// import { HomeOutlined, UploadOutlined } from "@ant-design/icons";
// import Papa from "papaparse";
// import { db } from "../../../firebase/firebaseConfig";
// import { calculateGradeAndGPA } from "../../../utils/gradeUtils";
// import { useNavigate } from "react-router-dom";
// import {
//   collection,
//   addDoc,
//   doc,
//   writeBatch,
//   getDocs,
// } from "firebase/firestore";
// // import { Navigate } from "react-router-dom";

// const { Title } = Typography;
// const { TabPane } = Tabs;

// const UploadResults = () => {
//   const [courses, setCourses] = useState([]); // All courses from Firestore
//   const [students, setStudents] = useState([]); // All students from Firestore
//   const [selectedStudent, setSelectedStudent] = useState(null); // Currently selected student (includes registered courses)
//   const [uploadingBulk, setUploadingBulk] = useState(false);
//   const [alertState, setAlertState] = useState(null);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();

//   // Quick test to ensure Firestore is connected (optional)
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
//     setAlertState({ message, type });
//   };

//   useEffect(() => {
//     testFirestore();
//     fetchCourses();
//     fetchStudents();
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

//   // When a student is selected, store the full student document in state.
//   // (Each student document should have a "courses" field that is an array of course IDs.)
//   const handleStudentChange = (studentId) => {
//     form.setFieldsValue({ studentId });
//     const student = students.find((s) => s.id === studentId);
//     setSelectedStudent(student);
//     // Reset any previously entered scores
//     form.setFieldsValue({ results: {} });
//   };

//   // onFinish for the Single Upload tab.
//   // It loops over each course registered for the selected student and saves the corresponding result.
//   const onFinishSingle = async (values) => {
//     try {
//       // Expected values structure:
//       // {
//       //   studentId,
//       //   semester,
//       //   results: {
//       //      courseId1: { continuousAssessment, examScore },
//       //      courseId2: { continuousAssessment, examScore },
//       //      ...
//       //   }
//       // }
//       const { studentId, semester, results } = values;
//       if (!studentId || !semester || !results) {
//         throw new Error("Please fill in all required fields");
//       }
//       const studentCourses = selectedStudent?.courses || [];
//       if (studentCourses.length === 0) {
//         throw new Error("Selected student has no registered courses");
//       }
//       const batch = writeBatch(db);
//       studentCourses.forEach((courseId) => {
//         const scores = results[courseId];
//         if (
//           !scores ||
//           scores.continuousAssessment === undefined ||
//           scores.examScore === undefined
//         ) {
//           throw new Error(`Scores for course ${courseId} are missing`);
//         }
//         const continuousAssessment = Number(scores.continuousAssessment);
//         const examScore = Number(scores.examScore);
//         const totalScore = continuousAssessment + examScore;
//         const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
//         const resultDoc = {
//           studentId,
//           courseId,
//           continuousAssessment,
//           examScore,
//           totalScore,
//           grade,
//           gpa,
//           description,
//           semester,
//           createdAt: new Date(),
//         };
//         const resultDocRef = doc(collection(db, "results"));
//         batch.set(resultDocRef, resultDoc);
//       });
//       await batch.commit();
//       showAlert("Results uploaded successfully!");
//       form.resetFields();
//       setSelectedStudent(null);
//     } catch (error) {
//       console.error("Error in onFinishSingle:", error);
//       showAlert(error.message || "Failed to upload results", "error");
//     }
//   };

//   // Bulk CSV Upload remains similar to before.
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
//               const totalScore = continuousAssessment + examScore;
//               const { grade, gpa, description } =
//                 calculateGradeAndGPA(totalScore);
//               const docRef = doc(collection(db, "results"));
//               batch.set(docRef, {
//                 courseId: record.courseId,
//                 studentId: record.studentId,
//                 continuousAssessment,
//                 examScore,
//                 totalScore,
//                 grade,
//                 gpa,
//                 description,
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

//   return (
//     <AdminLayout>
//       <Space direction="vertical" style={{ width: "100%" }}>
//         <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
//           <Breadcrumb.Item onClick={() => navigate("/admin/results")}>
//             <HomeOutlined style={{ paddingInline: "10px" }} />
//             Results Overview
//           </Breadcrumb.Item>
//           <Breadcrumb.Item>Upload Results</Breadcrumb.Item>
//         </Breadcrumb>
//         <hr style={{marginTop: "-5px"}}/>
//         <Title level={4}>Upload Results</Title>

//         {/* Alert Section */}
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
//           {/* Single Upload Tab */}
//           <TabPane tab="Single Upload" key="1">
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinishSingle}
//               onFinishFailed={(errorInfo) => {
//                 console.log("Form validation failed:", errorInfo);
//               }}
//             >
//               {/* Student Selection (First) */}
//               <Form.Item
//                 name="studentId"
//                 label="Student"
//                 rules={[{ required: true, message: "Please select a student" }]}
//               >
//                 <Select
//                   placeholder="Select Student"
//                   showSearch
//                   optionFilterProp="children"
//                   onChange={handleStudentChange}
//                 >
//                   {students.map((student) => (
//                     <Select.Option key={student.id} value={student.id}>
//                       {`${student.matricNumber} - ${student.name}`}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </Form.Item>

//               {/* Semester Selection */}
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

//               {/* Display Registered Courses for the Selected Student */}
//               {selectedStudent &&
//                 selectedStudent.courses &&
//                 selectedStudent.courses.length > 0 && (
//                   <>
//                     <Title level={5}>Enter Scores for Registered Courses</Title>
//                     {selectedStudent.courses.map((courseId) => {
//                       // Find full course details from the preloaded courses list
//                       const course = courses.find((c) => c.id === courseId);
//                       if (!course) return null;
//                       return (
//                         <div
//                           key={courseId}
//                           style={{
//                             border: "1px solid #f0f0f0",
//                             padding: "16px",
//                             marginBottom: "16px",
//                           }}
//                         >
//                           <Title level={5}>
//                             {`${course.courseCode} - ${course.courseTitle}`}
//                           </Title>
//                           <Form.Item
//                             name={["results", courseId, "continuousAssessment"]}
//                             label="Continuous Assessment"
//                             rules={[
//                               {
//                                 required: true,
//                                 message: "Please enter CA score",
//                               },
//                               {
//                                 type: "number",
//                                 min: 0,
//                                 max: 40,
//                                 message: "Score must be between 0 and 40",
//                               },
//                             ]}
//                           >
//                             <InputNumber
//                               min={0}
//                               max={40}
//                               style={{ width: "100%" }}
//                             />
//                           </Form.Item>
//                           <Form.Item
//                             name={["results", courseId, "examScore"]}
//                             label="Exam Score"
//                             rules={[
//                               {
//                                 required: true,
//                                 message: "Please enter Exam score",
//                               },
//                               {
//                                 type: "number",
//                                 min: 0,
//                                 max: 60,
//                                 message: "Score must be between 0 and 60",
//                               },
//                             ]}
//                           >
//                             <InputNumber
//                               min={0}
//                               max={60}
//                               style={{ width: "100%" }}
//                             />
//                           </Form.Item>
//                         </div>
//                       );
//                     })}
//                   </>
//                 )}

//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Upload Results
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>

//           {/* Bulk CSV Upload Tab */}
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
  Breadcrumb,
} from "antd";
import { HomeOutlined, UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { db } from "../../../firebase/firebaseConfig";
import { calculateGradeAndGPA } from "../../../utils/gradeUtils";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const UploadResults = () => {
  const [courses, setCourses] = useState([]); // All courses (will be filtered by semester)
  const [students, setStudents] = useState([]); // All students from Firestore
  const [selectedStudent, setSelectedStudent] = useState(null); // Currently selected student (includes registered courses)
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const navigate = useNavigate();
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
    // Initially, you could load all courses or leave courses empty until a semester is selected.
    fetchCourses(); 
    fetchStudents();
  }, []);

  // Fetch all courses (used on initial load if needed)
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

  // New: Fetch courses for the selected semester only.
  const fetchCoursesBySemester = async (semester) => {
    try {
      const coursesColRef = collection(db, "courses");
      const q = query(coursesColRef, where("semester", "==", semester));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);
    } catch (error) {
      showAlert("Failed to load courses for the selected semester", "error");
      console.error("fetchCoursesBySemester error:", error);
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
  const handleStudentChange = (studentId) => {
    form.setFieldsValue({ studentId });
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student);
    // Reset any previously entered scores
    form.setFieldsValue({ results: {} });
  };

  // Handler for when the semester selection changes.
  const handleSemesterChange = (semesterValue) => {
    form.setFieldsValue({ semester: semesterValue });
    fetchCoursesBySemester(semesterValue);
  };

  // onFinish for the Single Upload tab.
  // const onFinishSingle = async (values) => {
  //   try {
  //     // Expected values structure:
  //     // {
  //     //   studentId,
  //     //   semester,
  //     //   results: { courseId1: { continuousAssessment, examScore }, ... }
  //     // }
  //     const { studentId, semester, results } = values;
  //     if (!studentId || !semester || !results) {
  //       throw new Error("Please fill in all required fields");
  //     }
  //     const studentCourses = selectedStudent?.courses || [];
  //     if (studentCourses.length === 0) {
  //       throw new Error("Selected student has no registered courses");
  //     }
  //     const batch = writeBatch(db);
  //     studentCourses.forEach((courseId) => {
  //       const scores = results[courseId];
  //       if (
  //         !scores ||
  //         scores.continuousAssessment === undefined ||
  //         scores.examScore === undefined
  //       ) {
  //         throw new Error(`Scores for course ${courseId} are missing`);
  //       }
  //       const continuousAssessment = Number(scores.continuousAssessment);
  //       const examScore = Number(scores.examScore);
  //       const totalScore = continuousAssessment + examScore;
  //       const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
  //       const resultDoc = {
  //         studentId,
  //         courseId,
  //         continuousAssessment,
  //         examScore,
  //         totalScore,
  //         grade,
  //         gpa,
  //         description,
  //         semester,
  //         createdAt: new Date(),
  //       };
  //       const resultDocRef = doc(collection(db, "results"));
  //       batch.set(resultDocRef, resultDoc);
  //     });
  //     await batch.commit();
  //     showAlert("Results uploaded successfully!");
  //     form.resetFields();
  //     setSelectedStudent(null);
  //   } catch (error) {
  //     console.error("Error in onFinishSingle:", error);
  //     showAlert(error.message || "Failed to upload results", "error");
  //   }
  // };
  const onFinishSingle = async (values) => {
    try {
      const { studentId, semester, results } = values;
      if (!studentId || !semester || !results) {
        throw new Error("Please fill in all required fields");
      }
      
      // Filter student's courses to only include those that are in the filtered courses list (for the selected semester)
      const filteredStudentCourses = selectedStudent?.courses?.filter(courseId =>
        courses.some((course) => course.id === courseId)
      );
  
      if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
        throw new Error("No registered courses found for the selected semester");
      }
      
      const batch = writeBatch(db);
      filteredStudentCourses.forEach((courseId) => {
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
              const { grade, gpa, description } =
                calculateGradeAndGPA(totalScore);
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
        <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
          <Breadcrumb.Item onClick={() => navigate("/admin/results")}>
            <HomeOutlined style={{ paddingInline: "10px" }} />
            Results Overview
          </Breadcrumb.Item>
          <Breadcrumb.Item>Upload Results</Breadcrumb.Item>
        </Breadcrumb>
        <hr style={{ marginTop: "-5px" }} />
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
              {/* Student Selection */}
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
                    <Option key={student.id} value={student.id}>
                      {`${student.matricNumber} - ${student.name}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Semester Selection */}
              <Form.Item
                name="semester"
                label="Semester"
                rules={[
                  { required: true, message: "Please select a semester" },
                ]}
              >
                <Select
                  placeholder="Select Semester"
                  onChange={handleSemesterChange}
                >
                  <Option value="FirstSemester">First Semester</Option>
                  <Option value="SecondSemester">Second Semester</Option>
                </Select>
              </Form.Item>

              {/* Display Registered Courses for the Selected Student */}
              {selectedStudent &&
                selectedStudent.courses &&
                selectedStudent.courses.length > 0 && (
                  <>
                    <Title level={5}>
                      Enter Scores for Registered Courses
                    </Title>
                    {selectedStudent.courses.map((courseId) => {
                      // Find full course details from the (filtered) courses list
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
                        Semester should be either "FirstSemester" or
                        "SecondSemester"
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
