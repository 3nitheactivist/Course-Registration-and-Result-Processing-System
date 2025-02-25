// import React, { useState, useEffect } from "react";
// import AdminLayout from "../AdminLayout";
// import {
//   Spin,
//   Divider,
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
//   query,
//   where,
// } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const { Title } = Typography;
// const { TabPane } = Tabs;
// const { Option } = Select;

// const UploadResults = () => {
//   const [courses, setCourses] = useState([]); // All courses (filtered by semester)
//   const [students, setStudents] = useState([]); // All students from Firestore
//   const [results, setResults] = useState([]); // Results already uploaded for a student
//   const [selectedStudent, setSelectedStudent] = useState(null); // Selected student document
//   const [uploadingBulk, setUploadingBulk] = useState(false);
//   const [alertState, setAlertState] = useState(null);
//   const [isFetchingResults, setIsFetchingResults] = useState(false);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const auth = getAuth();
//   const currentUser = auth.currentUser;

//   const showAlert = (message, type = "success") => {
//     setAlertState({ message, type });
//   };

//   useEffect(() => {
//     // Remove or comment out testFirestore() to avoid permission errors.
//     // testFirestore();
//     if (currentUser) {
//       fetchCourses();
//       fetchStudents();
//     }
//   }, [currentUser]);

//   // Fetch all courses for the current admin
//   const fetchCourses = async () => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(coursesColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch courses for a given semester for the current admin
//   const fetchCoursesBySemester = async (semester) => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(
//         coursesColRef,
//         where("semester", "==", semester),
//         where("userId", "==", currentUser.uid)
//       );
//       const snapshot = await getDocs(q);
//       const coursesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setCourses(coursesData);
//     } catch (error) {
//       showAlert("Failed to load courses for the selected semester", "error");
//       console.error("fetchCoursesBySemester error:", error);
//     }
//   };

//   // Fetch all students for the current admin
//   const fetchStudents = async () => {
//     try {
//       const studentsColRef = collection(db, "students");
//       const q = query(studentsColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch results for the selected student and semester
//   // const fetchResultsForStudent = async (semester) => {
//   //   try {
//   //     const resultsRef = collection(db, "results");
//   //     const q = query(
//   //       resultsRef,
//   //       where("studentId", "==", selectedStudent.id),
//   //       where("semester", "==", semester)
//   //     );
//   //     const snapshot = await getDocs(q);
//   //     const resultsData = snapshot.docs.map((doc) => ({
//   //       id: doc.id,
//   //       ...doc.data(),
//   //     }));
//   //     setResults(resultsData);
//   //   } catch (error) {
//   //     console.error("Error fetching student's results:", error);
//   //   }
//   // };
//   const fetchResultsForStudent = async (semester) => {
//     setIsFetchingResults(true);
//     try {
//       const resultsRef = collection(db, "results");
//       const q = query(
//         resultsRef,
//         where("studentId", "==", selectedStudent.id),
//         where("semester", "==", semester)
//       );
//       const snapshot = await getDocs(q);
//       const resultsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setResults(resultsData);
//     } catch (error) {
//       console.error("Error fetching student's results:", error);
//     } finally {
//       setIsFetchingResults(false);
//     }
//   };

//   // When a student is selected
//   const handleStudentChange = (studentId) => {
//     form.setFieldsValue({ studentId });
//     const student = students.find((s) => s.id === studentId);
//     setSelectedStudent(student);
//     // Reset previously entered scores
//     form.setFieldsValue({ results: {} });
//     // If a semester is already selected, fetch this student's results.
//     const semester = form.getFieldValue("semester");
//     if (semester && student) {
//       fetchResultsForStudent(semester);
//     }
//   };

//   // When semester selection changes
//   const handleSemesterChange = (semesterValue) => {
//     form.setFieldsValue({ semester: semesterValue });
//     fetchCoursesBySemester(semesterValue);
//     // If a student is selected, fetch results for that student for this semester.
//     if (selectedStudent) {
//       fetchResultsForStudent(semesterValue);
//     }
//   };

//   // onFinish for the Single Upload tab.
//   const onFinishSingle = async (values) => {
//     try {
//       const { studentId, semester, results: inputResults } = values;
//       // Check if the required fields are filled and that the results object has at least one key
//       if (
//         !studentId ||
//         !semester ||
//         !inputResults ||
//         Object.keys(inputResults).length === 0
//       ) {
//         throw new Error("Please fill in all required fields");
//       }

//       // Filter the student's registered courses to only those in the filtered courses list
//       const filteredStudentCourses = selectedStudent?.courses?.filter(
//         (courseId) => courses.some((course) => course.id === courseId)
//       );

//       if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
//         throw new Error(
//           "No registered courses found for the selected semester"
//         );
//       }

//       const batch = writeBatch(db);
//       filteredStudentCourses.forEach((courseId) => {
//         const scores = inputResults[courseId];
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
//           userId: currentUser.uid,
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

//   // Helper function to render registered courses for the selected student
//   // const renderCourses = () => {
//   //   // Compute unmarked and marked courses based on existing results:
//   //   const unmarkedCourses =
//   //     selectedStudent.courses.filter(
//   //       (courseId) =>
//   //         !results.some(
//   //           (result) =>
//   //             result.studentId === selectedStudent.id &&
//   //             result.courseId === courseId
//   //         )
//   //     ) || [];
//   //   const markedCourses =
//   //     selectedStudent.courses.filter((courseId) =>
//   //       results.some(
//   //         (result) =>
//   //           result.studentId === selectedStudent.id &&
//   //           result.courseId === courseId
//   //       )
//   //     ) || [];

//   //   return (
//   //     <>
//   //       {markedCourses.length > 0 && (
//   //         <Alert
//   //           message={`The following courses have already been marked: ${markedCourses
//   //             .map((courseId) => {
//   //               const course = courses.find((c) => c.id === courseId);
//   //               return course ? course.courseCode : courseId;
//   //             })
//   //             .join(", ")}`}
//   //           type="info"
//   //           showIcon
//   //           style={{ marginBottom: "16px" }}
//   //         />
//   //       )}
//   //       {unmarkedCourses.length > 0 ? (
//   //         <>
//   //           <Title level={5}>Enter Scores for Registered Courses</Title>
//   //           {unmarkedCourses.map((courseId) => {
//   //             const course = courses.find((c) => c.id === courseId);
//   //             if (!course) return null;
//   //             return (
//   //               <div
//   //                 key={courseId}
//   //                 style={{
//   //                   border: "1px solid #f0f0f0",
//   //                   padding: "16px",
//   //                   marginBottom: "16px",
//   //                 }}
//   //               >
//   //                 <Title level={5}>
//   //                   {`${course.courseCode} - ${course.courseTitle}`}
//   //                 </Title>
//   //                 <Form.Item
//   //                   name={["results", courseId, "continuousAssessment"]}
//   //                   label="Continuous Assessment"
//   //                   rules={[
//   //                     {
//   //                       required: true,
//   //                       message: "Please enter CA score",
//   //                     },
//   //                     {
//   //                       type: "number",
//   //                       min: 0,
//   //                       max: 40,
//   //                       message: "Score must be between 0 and 40",
//   //                     },
//   //                   ]}
//   //                 >
//   //                   <InputNumber min={0} max={40} style={{ width: "100%" }} />
//   //                 </Form.Item>
//   //                 <Form.Item
//   //                   name={["results", courseId, "examScore"]}
//   //                   label="Exam Score"
//   //                   rules={[
//   //                     {
//   //                       required: true,
//   //                       message: "Please enter Exam score",
//   //                     },
//   //                     {
//   //                       type: "number",
//   //                       min: 0,
//   //                       max: 60,
//   //                       message: "Score must be between 0 and 60",
//   //                     },
//   //                   ]}
//   //                 >
//   //                   <InputNumber min={0} max={60} style={{ width: "100%" }} />
//   //                 </Form.Item>
//   //               </div>
//   //             );
//   //           })}
//   //         </>
//   //       ) : (
//   //         <Alert
//   //           message="All registered courses have already been marked."
//   //           type="warning"
//   //           showIcon
//   //           style={{ marginBottom: "16px" }}
//   //         />
//   //       )}
//   //     </>
//   //   );
//   // };

//   const renderCourses = () => {
//     // Compute unmarked and marked courses based on existing results:
//     const unmarkedCourses =
//       selectedStudent.courses.filter((courseId) =>
//         !results.some(
//           (result) =>
//             result.studentId === selectedStudent.id &&
//             result.courseId === courseId
//         )
//       ) || [];
//     const markedCourses =
//       selectedStudent.courses.filter((courseId) =>
//         results.some(
//           (result) =>
//             result.studentId === selectedStudent.id &&
//             result.courseId === courseId
//         )
//       ) || [];

//     return (
//       <>
//         {markedCourses.length > 0 && (
//           <Alert
//             message={`The following courses have already been marked: ${markedCourses
//               .map((courseId) => {
//                 const course = courses.find((c) => c.id === courseId);
//                 return course ? course.courseCode : courseId;
//               })
//               .join(", ")}`}
//             type="info"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//         {unmarkedCourses.length > 0 ? (
//           <>
//             <Title level={5}>Enter Scores for Registered Courses</Title>
//             {unmarkedCourses.map((courseId) => {
//               const course = courses.find((c) => c.id === courseId);
//               if (!course) return null;
//               return (
//                 <div
//                   key={courseId}
//                   style={{
//                     border: "1px solid #f0f0f0",
//                     padding: 16,
//                     marginBottom: 16,
//                   }}
//                 >
//                   <Title level={5}>
//                     {`${course.courseCode} - ${course.courseTitle}`}
//                   </Title>
//                   <Form.Item
//                     name={["results", courseId, "continuousAssessment"]}
//                     label="Continuous Assessment"
//                     rules={[
//                       { required: true, message: "Please enter CA score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 40,
//                         message: "Score must be between 0 and 40",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={40} style={{ width: "100%" }} />
//                   </Form.Item>
//                   <Form.Item
//                     name={["results", courseId, "examScore"]}
//                     label="Exam Score"
//                     rules={[
//                       { required: true, message: "Please enter Exam score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 60,
//                         message: "Score must be between 0 and 60",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={60} style={{ width: "100%" }} />
//                   </Form.Item>
//                 </div>
//               );
//             })}
//           </>
//         ) : (
//           <Alert
//             message="All registered courses have already been marked."
//             type="warning"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//       </>
//     );
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
//                 userId: currentUser.uid,
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
//         <hr style={{ marginTop: "-5px" }} />
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
//               {/* Student Selection */}
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
//                     <Option key={student.id} value={student.id}>
//                       {`${student.matricNumber} - ${student.name}`}
//                     </Option>
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
//                 <Select
//                   placeholder="Select Semester"
//                   onChange={handleSemesterChange}
//                 >
//                   <Option value="FirstSemester">First Semester</Option>
//                   <Option value="SecondSemester">Second Semester</Option>
//                 </Select>
//               </Form.Item>

//               {/* Display Registered Courses for the Selected Student */}

//               {selectedStudent &&
//                 form.getFieldValue("semester") &&
//                 selectedStudent.courses &&
//                 selectedStudent.courses.length > 0 &&
//                 (() => {
//                   // Compute unmarked and marked courses based on existing results:
//                   const unmarkedCourses =
//                     selectedStudent.courses.filter(
//                       (courseId) =>
//                         !results.some(
//                           (result) =>
//                             result.studentId === selectedStudent.id &&
//                             result.courseId === courseId
//                         )
//                     ) || [];
//                   const markedCourses =
//                     selectedStudent.courses.filter((courseId) =>
//                       results.some(
//                         (result) =>
//                           result.studentId === selectedStudent.id &&
//                           result.courseId === courseId
//                       )
//                     ) || [];

//                   return (
//                     <>
//                       {markedCourses.length > 0 && (
//                         <Alert
//                           message={`The following courses have already been marked: ${markedCourses
//                             .map((courseId) => {
//                               const course = courses.find(
//                                 (c) => c.id === courseId
//                               );
//                               return course ? course.courseCode : courseId;
//                             })
//                             .join(", ")}`}
//                           type="info"
//                           showIcon
//                           style={{ marginBottom: "16px" }}
//                         />
//                       )}
//                       {unmarkedCourses.length > 0 ? (
//                         <>
//                           <Title level={5}>
//                             Enter Scores for Registered Courses
//                           </Title>
//                           {unmarkedCourses.map((courseId) => {
//                             const course = courses.find(
//                               (c) => c.id === courseId
//                             );
//                             if (!course) return null;
//                             return (
//                               <div
//                                 key={courseId}
//                                 style={{
//                                   border: "1px solid #f0f0f0",
//                                   padding: "16px",
//                                   marginBottom: "16px",
//                                 }}
//                               >
//                                 <Title level={5}>
//                                   {`${course.courseCode} - ${course.courseTitle}`}
//                                 </Title>
//                                 <Form.Item
//                                   name={[
//                                     "results",
//                                     courseId,
//                                     "continuousAssessment",
//                                   ]}
//                                   label="Continuous Assessment"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please enter CA score",
//                                     },
//                                     {
//                                       type: "number",
//                                       min: 0,
//                                       max: 40,
//                                       message: "Score must be between 0 and 40",
//                                     },
//                                   ]}
//                                 >
//                                   <InputNumber
//                                     min={0}
//                                     max={40}
//                                     style={{ width: "100%" }}
//                                   />
//                                 </Form.Item>
//                                 <Form.Item
//                                   name={["results", courseId, "examScore"]}
//                                   label="Exam Score"
//                                   rules={[
//                                     {
//                                       required: true,
//                                       message: "Please enter Exam score",
//                                     },
//                                     {
//                                       type: "number",
//                                       min: 0,
//                                       max: 60,
//                                       message: "Score must be between 0 and 60",
//                                     },
//                                   ]}
//                                 >
//                                   <InputNumber
//                                     min={0}
//                                     max={60}
//                                     style={{ width: "100%" }}
//                                   />
//                                 </Form.Item>
//                               </div>
//                             );
//                           })}
//                         </>
//                       ) : (
//                         <Alert
//                           message="All registered courses have already been marked."
//                           type="warning"
//                           showIcon
//                           style={{ marginBottom: "16px" }}
//                         />
//                       )}
//                     </>
//                   );
//                 })}

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

// import React, { useState, useEffect } from "react";
// import AdminLayout from "../AdminLayout";
// import {
//   Spin,
//   Divider,
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
//   query,
//   where,
// } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const { Title } = Typography;
// const { TabPane } = Tabs;
// const { Option } = Select;

// const UploadResults = () => {
//   const [courses, setCourses] = useState([]); // All courses (filtered by semester)
//   const [students, setStudents] = useState([]); // All students from Firestore
//   const [results, setResults] = useState([]); // Results already uploaded for a student
//   const [selectedStudent, setSelectedStudent] = useState(null); // Selected student document
//   const [uploadingBulk, setUploadingBulk] = useState(false);
//   const [alertState, setAlertState] = useState(null);
//   const [isFetchingResults, setIsFetchingResults] = useState(false);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const auth = getAuth();
//   const currentUser = auth.currentUser;

//   const showAlert = (message, type = "success") => {
//     setAlertState({ message, type });
//   };

//   useEffect(() => {
//     // Remove or comment out testFirestore() to avoid permission errors.
//     // testFirestore();
//     if (currentUser) {
//       fetchCourses();
//       fetchStudents();
//     }
//   }, [currentUser]);

//   // Fetch all courses for the current admin
//   const fetchCourses = async () => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(coursesColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch courses for a given semester for the current admin
//   const fetchCoursesBySemester = async (semester) => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(
//         coursesColRef,
//         where("semester", "==", semester),
//         where("userId", "==", currentUser.uid)
//       );
//       const snapshot = await getDocs(q);
//       const coursesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setCourses(coursesData);
//     } catch (error) {
//       showAlert("Failed to load courses for the selected semester", "error");
//       console.error("fetchCoursesBySemester error:", error);
//     }
//   };

//   // Fetch all students for the current admin
//   const fetchStudents = async () => {
//     try {
//       const studentsColRef = collection(db, "students");
//       const q = query(studentsColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch results for the selected student and semester
//   const fetchResultsForStudent = async (semester) => {
//     setIsFetchingResults(true);
//     try {
//       const resultsRef = collection(db, "results");
//       const q = query(
//         resultsRef,
//         where("studentId", "==", selectedStudent.id),
//         where("semester", "==", semester)
//       );
//       const snapshot = await getDocs(q);
//       const resultsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setResults(resultsData);
//     } catch (error) {
//       console.error("Error fetching student's results:", error);
//     } finally {
//       setIsFetchingResults(false);
//     }
//   };

//   // When a student is selected
//   const handleStudentChange = (studentId) => {
//     form.setFieldsValue({ studentId });
//     const student = students.find((s) => s.id === studentId);
//     setSelectedStudent(student);
//     // Reset previously entered scores
//     form.setFieldsValue({ results: {} });
//     // If a semester is already selected, fetch this student's results.
//     const semester = form.getFieldValue("semester");
//     if (semester && student) {
//       fetchResultsForStudent(semester);
//     }
//   };

//   // When semester selection changes
//   const handleSemesterChange = (semesterValue) => {
//     form.setFieldsValue({ semester: semesterValue });
//     fetchCoursesBySemester(semesterValue);
//     // If a student is selected, fetch results for that student for this semester.
//     if (selectedStudent) {
//       fetchResultsForStudent(semesterValue);
//     }
//   };

//   // onFinish for the Single Upload tab.
//   const onFinishSingle = async (values) => {
//     try {
//       const { studentId, semester, results: inputResults } = values;
//       // Check if the required fields are filled and that the results object has at least one key
//       if (
//         !studentId ||
//         !semester ||
//         !inputResults ||
//         Object.keys(inputResults).length === 0
//       ) {
//         throw new Error("Please fill in all required fields");
//       }

//       // Filter the student's registered courses to only those in the filtered courses list
//       const filteredStudentCourses = selectedStudent?.courses?.filter(
//         (courseId) => courses.some((course) => course.id === courseId)
//       );

//       if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
//         throw new Error(
//           "No registered courses found for the selected semester"
//         );
//       }

//       const batch = writeBatch(db);
//       filteredStudentCourses.forEach((courseId) => {
//         const scores = inputResults[courseId];
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
//           userId: currentUser.uid,
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

//   // Helper function to render registered courses for the selected student
//   const renderCourses = () => {
//     if (!selectedStudent || !selectedStudent.courses || selectedStudent.courses.length === 0) {
//       return null;
//     }

//     // Compute unmarked and marked courses based on existing results:
//     const unmarkedCourses =
//       selectedStudent.courses.filter(
//         (courseId) =>
//           !results.some(
//             (result) =>
//               result.studentId === selectedStudent.id &&
//               result.courseId === courseId
//           )
//       ) || [];
//     const markedCourses =
//       selectedStudent.courses.filter((courseId) =>
//         results.some(
//           (result) =>
//             result.studentId === selectedStudent.id &&
//             result.courseId === courseId
//         )
//       ) || [];

//     return (
//       <>
//         {markedCourses.length > 0 && (
//           <Alert
//             message={`The following courses have already been marked: ${markedCourses
//               .map((courseId) => {
//                 const course = courses.find((c) => c.id === courseId);
//                 return course ? course.courseCode : courseId;
//               })
//               .join(", ")}`}
//             type="info"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//         {unmarkedCourses.length > 0 ? (
//           <>
//             <Title level={5}>Enter Scores for Registered Courses</Title>
//             {unmarkedCourses.map((courseId) => {
//               const course = courses.find((c) => c.id === courseId);
//               if (!course) return null;
//               return (
//                 <div
//                   key={courseId}
//                   style={{
//                     border: "1px solid #f0f0f0",
//                     padding: 16,
//                     marginBottom: 16,
//                   }}
//                 >
//                   <Title level={5}>
//                     {`${course.courseCode} - ${course.courseTitle}`}
//                   </Title>
//                   <Form.Item
//                     name={["results", courseId, "continuousAssessment"]}
//                     label="Continuous Assessment"
//                     rules={[
//                       { required: true, message: "Please enter CA score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 40,
//                         message: "Score must be between 0 and 40",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={40} style={{ width: "100%" }} />
//                   </Form.Item>
//                   <Form.Item
//                     name={["results", courseId, "examScore"]}
//                     label="Exam Score"
//                     rules={[
//                       { required: true, message: "Please enter Exam score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 60,
//                         message: "Score must be between 0 and 60",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={60} style={{ width: "100%" }} />
//                   </Form.Item>
//                 </div>
//               );
//             })}
//           </>
//         ) : (
//           <Alert
//             message="All registered courses have already been marked."
//             type="warning"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//       </>
//     );
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
//                 userId: currentUser.uid,
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
//         <hr style={{ marginTop: "-5px" }} />
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
//               {/* Student Selection */}
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
//                     <Option key={student.id} value={student.id}>
//                       {`${student.matricNumber} - ${student.name}`}
//                     </Option>
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
//                 <Select
//                   placeholder="Select Semester"
//                   onChange={handleSemesterChange}
//                 >
//                   <Option value="FirstSemester">First Semester</Option>
//                   <Option value="SecondSemester">Second Semester</Option>
//                 </Select>
//               </Form.Item>

//               {/* Display Registered Courses for the Selected Student */}
//               {selectedStudent && form.getFieldValue("semester") && renderCourses()}

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

// import React, { useState, useEffect } from "react";
// import AdminLayout from "../AdminLayout";
// import {
//   Spin,
//   Divider,
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
//   query,
//   where,
// } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const { Title } = Typography;
// const { TabPane } = Tabs;
// const { Option } = Select;

// const UploadResults = () => {
//   const [courses, setCourses] = useState([]); // All courses (filtered by semester)
//   const [students, setStudents] = useState([]); // All students from Firestore
//   const [results, setResults] = useState([]); // Results already uploaded for a student
//   const [selectedStudent, setSelectedStudent] = useState(null); // Selected student document
//   const [uploadingBulk, setUploadingBulk] = useState(false);
//   const [alertState, setAlertState] = useState(null);
//   const [isFetchingResults, setIsFetchingResults] = useState(false);
//   const navigate = useNavigate();
//   const [form] = Form.useForm();
//   const auth = getAuth();
//   const currentUser = auth.currentUser;

//   const showAlert = (message, type = "success") => {
//     setAlertState({ message, type });
//   };

//   useEffect(() => {
//     // Remove testFirestore() call if present to avoid permission errors.
//     if (currentUser) {
//       fetchCourses();
//       fetchStudents();
//     }
//   }, [currentUser]);

//   // Fetch all courses for the current admin
//   const fetchCourses = async () => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(coursesColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch courses for a given semester for the current admin
//   const fetchCoursesBySemester = async (semester) => {
//     try {
//       const coursesColRef = collection(db, "courses");
//       const q = query(
//         coursesColRef,
//         where("semester", "==", semester),
//         where("userId", "==", currentUser.uid)
//       );
//       const snapshot = await getDocs(q);
//       const coursesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setCourses(coursesData);
//     } catch (error) {
//       showAlert("Failed to load courses for the selected semester", "error");
//       console.error("fetchCoursesBySemester error:", error);
//     }
//   };

//   // Fetch all students for the current admin
//   const fetchStudents = async () => {
//     try {
//       const studentsColRef = collection(db, "students");
//       const q = query(studentsColRef, where("userId", "==", currentUser.uid));
//       const snapshot = await getDocs(q);
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

//   // Fetch results for the selected student and semester
//   const fetchResultsForStudent = async (semester) => {
//     setIsFetchingResults(true);
//     try {
//       const resultsRef = collection(db, "results");
//       const q = query(
//         resultsRef,
//         where("studentId", "==", selectedStudent.id),
//         where("semester", "==", semester)
//       );
//       const snapshot = await getDocs(q);
//       const resultsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setResults(resultsData);
//     } catch (error) {
//       console.error("Error fetching student's results:", error);
//     } finally {
//       setIsFetchingResults(false);
//     }
//   };

//   // When a student is selected
//   const handleStudentChange = (studentId) => {
//     form.setFieldsValue({ studentId });
//     const student = students.find((s) => s.id === studentId);
//     setSelectedStudent(student);
//     // Reset previously entered scores
//     form.setFieldsValue({ results: {} });
//     // If a semester is already selected, fetch this student's results.
//     const semester = form.getFieldValue("semester");
//     if (semester && student) {
//       fetchResultsForStudent(semester);
//     }
//   };

//   // When semester selection changes
//   const handleSemesterChange = (semesterValue) => {
//     form.setFieldsValue({ semester: semesterValue });
//     fetchCoursesBySemester(semesterValue);
//     // If a student is selected, fetch results for that student for this semester.
//     if (selectedStudent) {
//       fetchResultsForStudent(semesterValue);
//     }
//   };

//   // // onFinish for the Single Upload tab.
//   // const onFinishSingle = async (values) => {
//   //   try {
//   //     const { studentId, semester, results: inputResults } = values;
//   //     // Check if the required fields are filled and that the results object has at least one key
//   //     if (
//   //       !studentId ||
//   //       !semester ||
//   //       !inputResults ||
//   //       Object.keys(inputResults).length === 0
//   //     ) {
//   //       throw new Error("Please fill in all required fields");
//   //     }

//   //     // Filter the student's registered courses to only those in the filtered courses list
//   //     const filteredStudentCourses = selectedStudent?.courses?.filter(
//   //       (courseId) => courses.some((course) => course.id === courseId)
//   //     );

//   //     if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
//   //       throw new Error(
//   //         "No registered courses found for the selected semester"
//   //       );
//   //     }

//   //     const batch = writeBatch(db);
//   //     filteredStudentCourses.forEach((courseId) => {
//   //       const scores = inputResults[courseId];
//   //       if (
//   //         !scores ||
//   //         scores.continuousAssessment === undefined ||
//   //         scores.examScore === undefined
//   //       ) {
//   //         throw new Error(`Scores for course ${courseId} are missing`);
//   //       }
//   //       const continuousAssessment = Number(scores.continuousAssessment);
//   //       const examScore = Number(scores.examScore);
//   //       const totalScore = continuousAssessment + examScore;
//   //       const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
//   //       const resultDoc = {
//   //         studentId,
//   //         courseId,
//   //         continuousAssessment,
//   //         examScore,
//   //         totalScore,
//   //         grade,
//   //         gpa,
//   //         description,
//   //         semester,
//   //         createdAt: new Date(),
//   //         userId: currentUser.uid,
//   //       };
//   //       const resultDocRef = doc(collection(db, "results"));
//   //       batch.set(resultDocRef, resultDoc);
//   //     });

//   //     await batch.commit();
//   //     showAlert("Results uploaded successfully!");
//   //     form.resetFields();
//   //     setSelectedStudent(null);
//   //   } catch (error) {
//   //     console.error("Error in onFinishSingle:", error);
//   //     showAlert(error.message || "Failed to upload results", "error");
//   //   }
//   // };

//   // Helper function to render registered courses for the selected student

//   // onFinish for the Single Upload tab.
//   const onFinishSingle = async (values) => {
//     try {
//       const { studentId, semester, results: inputResults } = values;

//       // Check if the required fields are filled
//       if (!studentId || !semester) {
//         throw new Error("Please fill in all required fields");
//       }

//       // Check that results exist and at least one course has scores
//       if (!inputResults || Object.keys(inputResults).length === 0) {
//         throw new Error("Please enter scores for at least one course");
//       }

//       // Make sure we have at least one course with both scores filled
//       const hasValidScores = Object.values(inputResults).some(
//         (course) =>
//           course.continuousAssessment !== undefined &&
//           course.examScore !== undefined
//       );

//       if (!hasValidScores) {
//         throw new Error(
//           "Please fill in both Continuous Assessment and Exam Score for at least one course"
//         );
//       }

//       // Filter the student's registered courses to only those in the filtered courses list
//       const filteredStudentCourses = selectedStudent?.courses?.filter(
//         (courseId) => courses.some((course) => course.id === courseId)
//       );

//       if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
//         throw new Error(
//           "No registered courses found for the selected semester"
//         );
//       }

//       const batch = writeBatch(db);
//       // Only process courses that have complete scores
//       filteredStudentCourses.forEach((courseId) => {
//         const scores = inputResults[courseId];
//         // Skip courses without scores
//         if (
//           scores &&
//           scores.continuousAssessment !== undefined &&
//           scores.examScore !== undefined
//         ) {
//           const continuousAssessment = Number(scores.continuousAssessment);
//           const examScore = Number(scores.examScore);
//           const totalScore = continuousAssessment + examScore;
//           const { grade, gpa, description } = calculateGradeAndGPA(totalScore);
//           const resultDoc = {
//             studentId,
//             courseId,
//             continuousAssessment,
//             examScore,
//             totalScore,
//             grade,
//             gpa,
//             description,
//             semester,
//             createdAt: new Date(),
//             userId: currentUser.uid,
//           };
//           const resultDocRef = doc(collection(db, "results"));
//           batch.set(resultDocRef, resultDoc);
//         }
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
//   const renderCourses = () => {
//     if (
//       !selectedStudent ||
//       !selectedStudent.courses ||
//       selectedStudent.courses.length === 0
//     ) {
//       return (
//         <Alert
//           message="No registered courses found for this student."
//           type="warning"
//           showIcon
//           style={{ marginBottom: 16 }}
//         />
//       );
//     }

//     // Compute unmarked and marked courses based on existing results:
//     const unmarkedCourses =
//       selectedStudent.courses.filter(
//         (courseId) =>
//           !results.some(
//             (result) =>
//               result.studentId === selectedStudent.id &&
//               result.courseId === courseId
//           )
//       ) || [];
//     const markedCourses =
//       selectedStudent.courses.filter((courseId) =>
//         results.some(
//           (result) =>
//             result.studentId === selectedStudent.id &&
//             result.courseId === courseId
//         )
//       ) || [];

//     return (
//       <>
//         {markedCourses.length > 0 && (
//           <Alert
//             message={`The following courses have already been marked: ${markedCourses
//               .map((courseId) => {
//                 const course = courses.find((c) => c.id === courseId);
//                 return course ? course.courseCode : courseId;
//               })
//               .join(", ")}`}
//             type="info"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//         {unmarkedCourses.length > 0 ? (
//           <>
//             <Title level={5}>Enter Scores for Registered Courses</Title>
//             {unmarkedCourses.map((courseId) => {
//               const course = courses.find((c) => c.id === courseId);
//               if (!course) return null;
//               return (
//                 <div
//                   key={courseId}
//                   style={{
//                     border: "1px solid #f0f0f0",
//                     padding: 16,
//                     marginBottom: 16,
//                   }}
//                 >
//                   <Title level={5}>
//                     {`${course.courseCode} - ${course.courseTitle}`}
//                   </Title>
//                   <Form.Item
//                     name={["results", courseId, "continuousAssessment"]}
//                     label="Continuous Assessment"
//                     rules={[
//                       { required: true, message: "Please enter CA score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 40,
//                         message: "Score must be between 0 and 40",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={40} style={{ width: "100%" }} />
//                   </Form.Item>
//                   <Form.Item
//                     name={["results", courseId, "examScore"]}
//                     label="Exam Score"
//                     rules={[
//                       { required: true, message: "Please enter Exam score" },
//                       {
//                         type: "number",
//                         min: 0,
//                         max: 60,
//                         message: "Score must be between 0 and 60",
//                       },
//                     ]}
//                   >
//                     <InputNumber min={0} max={60} style={{ width: "100%" }} />
//                   </Form.Item>
//                 </div>
//               );
//             })}
//           </>
//         ) : (
//           <Alert
//             message="All registered courses have already been marked."
//             type="warning"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
//       </>
//     );
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
//                 userId: currentUser.uid,
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
//         <hr style={{ marginTop: "-5px" }} />
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
//             {selectedStudent && form.getFieldValue("semester") ? (
//               isFetchingResults ? (
//                 <Spin tip="Loading results..." style={{ marginBottom: 16 }} />
//               ) : (
//                 renderCourses()
//               )
//             ) : (
//               <Alert
//                 message="Please select a semester to display registered courses."
//                 type="warning"
//                 showIcon
//                 style={{ marginBottom: "16px" }}
//               />
//             )}

//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinishSingle}
//               onFinishFailed={(errorInfo) => {
//                 console.log("Form validation failed:", errorInfo);
//               }}
//             >
//               {/* Student Selection */}
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
//                     <Option key={student.id} value={student.id}>
//                       {`${student.matricNumber} - ${student.name}`}
//                     </Option>
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
//                 <Select
//                   placeholder="Select Semester"
//                   onChange={handleSemesterChange}
//                 >
//                   <Option value="FirstSemester">First Semester</Option>
//                   <Option value="SecondSemester">Second Semester</Option>
//                 </Select>
//               </Form.Item>

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
  Spin,
  Divider,
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
import { getAuth } from "firebase/auth";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const UploadResults = () => {
  const [courses, setCourses] = useState([]); // All courses (filtered by semester)
  const [students, setStudents] = useState([]); // All students from Firestore
  const [results, setResults] = useState([]); // Results already uploaded for a student
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student document
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [alertState, setAlertState] = useState(null);
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const showAlert = (message, type = "success") => {
    setAlertState({ message, type });
  };

  useEffect(() => {
    // Remove testFirestore() call if present to avoid permission errors.
    if (currentUser) {
      fetchCourses();
      fetchStudents();
    }
  }, [currentUser]);

  // Fetch all courses for the current admin
  const fetchCourses = async () => {
    try {
      const coursesColRef = collection(db, "courses");
      const q = query(coursesColRef, where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
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

  // Fetch courses for a given semester for the current admin
  const fetchCoursesBySemester = async (semester) => {
    try {
      const coursesColRef = collection(db, "courses");
      const q = query(
        coursesColRef,
        where("semester", "==", semester),
        where("userId", "==", currentUser.uid)
      );
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

  // Fetch all students for the current admin
  const fetchStudents = async () => {
    try {
      const studentsColRef = collection(db, "students");
      const q = query(studentsColRef, where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
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

  // Fetch results for the selected student and semester
  const fetchResultsForStudent = async (semester) => {
    setIsFetchingResults(true);
    try {
      if (!selectedStudent || !semester) {
        setResults([]);
        return;
      }
      
      const resultsRef = collection(db, "results");
      const q = query(
        resultsRef,
        where("studentId", "==", selectedStudent.id),
        where("semester", "==", semester)
      );
      const snapshot = await getDocs(q);
      const resultsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(resultsData);
    } catch (error) {
      console.error("Error fetching student's results:", error);
      setResults([]);
    } finally {
      setIsFetchingResults(false);
    }
  };

  // When a student is selected
  const handleStudentChange = (studentId) => {
    form.setFieldsValue({ studentId });
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student);
    // Reset previously entered scores
    form.setFieldsValue({ results: {} });
    // If a semester is already selected, fetch this student's results.
    const semester = form.getFieldValue("semester");
    if (semester && student) {
      fetchResultsForStudent(semester);
    }
  };

  // When semester selection changes
  const handleSemesterChange = (semesterValue) => {
    form.setFieldsValue({ semester: semesterValue });
    fetchCoursesBySemester(semesterValue);
    // If a student is selected, fetch results for that student for this semester.
    if (selectedStudent) {
      fetchResultsForStudent(semesterValue);
    }
  };

  // onFinish for the Single Upload tab.
  const onFinishSingle = async (values) => {
    try {
      const { studentId, semester, results: inputResults } = values;

      // Check if the required fields are filled
      if (!studentId || !semester) {
        throw new Error("Please fill in all required fields");
      }

      // Check that results exist and at least one course has scores
      if (!inputResults || Object.keys(inputResults).length === 0) {
        throw new Error("Please enter scores for at least one course");
      }

      // Make sure we have at least one course with both scores filled
      const hasValidScores = Object.values(inputResults).some(
        (course) =>
          course && 
          course.continuousAssessment !== undefined &&
          course.examScore !== undefined
      );

      if (!hasValidScores) {
        throw new Error(
          "Please fill in both Continuous Assessment and Exam Score for at least one course"
        );
      }

      // Filter the student's registered courses to only those in the filtered courses list
      const filteredStudentCourses = selectedStudent?.courses?.filter(
        (courseId) => courses.some((course) => course.id === courseId)
      );

      if (!filteredStudentCourses || filteredStudentCourses.length === 0) {
        throw new Error(
          "No registered courses found for the selected semester"
        );
      }

      const batch = writeBatch(db);
      let addedResults = 0;
      
      // Only process courses that have complete scores
      filteredStudentCourses.forEach((courseId) => {
        const scores = inputResults[courseId];
        // Skip courses without scores
        if (
          scores &&
          scores.continuousAssessment !== undefined &&
          scores.examScore !== undefined
        ) {
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
            userId: currentUser.uid,
          };
          const resultDocRef = doc(collection(db, "results"));
          batch.set(resultDocRef, resultDoc);
          addedResults++;
        }
      });

      if (addedResults === 0) {
        throw new Error("Please enter scores for at least one course");
      }

      await batch.commit();
      showAlert("Results uploaded successfully!");
      form.resetFields();
      setSelectedStudent(null);
      setResults([]);
    } catch (error) {
      console.error("Error in onFinishSingle:", error);
      showAlert(error.message || "Failed to upload results", "error");
    }
  };

  const renderCourses = () => {
    if (
      !selectedStudent ||
      !selectedStudent.courses ||
      selectedStudent.courses.length === 0
    ) {
      return (
        <Alert
          message="No registered courses found for this student."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    // Compute unmarked and marked courses based on existing results:
    const unmarkedCourses =
      selectedStudent.courses.filter(
        (courseId) =>
          !results.some(
            (result) =>
              result.studentId === selectedStudent.id &&
              result.courseId === courseId
          )
      ) || [];
    const markedCourses =
      selectedStudent.courses.filter((courseId) =>
        results.some(
          (result) =>
            result.studentId === selectedStudent.id &&
            result.courseId === courseId
        )
      ) || [];

    return (
      <>
        {markedCourses.length > 0 && (
          <Alert
            message={`The following courses have already been marked: ${markedCourses
              .map((courseId) => {
                const course = courses.find((c) => c.id === courseId);
                return course ? course.courseCode : courseId;
              })
              .join(", ")}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {unmarkedCourses.length > 0 ? (
          <>
            <Title level={5}>Enter Scores for Registered Courses</Title>
            {unmarkedCourses.map((courseId) => {
              const course = courses.find((c) => c.id === courseId);
              if (!course) return null;
              return (
                <div
                  key={courseId}
                  style={{
                    border: "1px solid #f0f0f0",
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <Title level={5}>
                    {`${course.courseCode} - ${course.courseTitle}`}
                  </Title>
                  <Form.Item
                    name={["results", courseId, "continuousAssessment"]}
                    label="Continuous Assessment"
                    rules={[
                      { required: false },
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
                      { required: false },
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
        ) : (
          <Alert
            message="All registered courses have already been marked."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </>
    );
  };

  // Bulk CSV Upload
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
                userId: currentUser.uid,
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

              {/* Render courses INSIDE the Form component */}
              {selectedStudent && form.getFieldValue("semester") ? (
                isFetchingResults ? (
                  <Spin tip="Loading results..." style={{ marginBottom: 16 }} />
                ) : (
                  renderCourses()
                )
              ) : (
                <Alert
                  message="Please select a student and semester to display registered courses."
                  type="warning"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
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