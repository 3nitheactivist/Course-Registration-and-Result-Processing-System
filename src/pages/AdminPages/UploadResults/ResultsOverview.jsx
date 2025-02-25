import React, { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import {
  Typography,
  Card,
  Table,
  Space,
  Select,
  Button,
  Statistic,
  Row,
  Col,
  Tag,
  Drawer,
  Divider,
  Input,
  InputNumber,
  Form,
  Modal,
  message,
  Alert,
} from "antd";
import { motion } from "framer-motion";
import {
  UserOutlined,
  BookOutlined,
  FileSearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { jsPDF } from "jspdf";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ResultsOverview = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("FirstSemester");
  const [selectedResult, setSelectedResult] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    failRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Helper: Compute grade distribution from results
  const getGradeDistributionData = () => {
    const distribution = results.reduce((acc, curr) => {
      acc[curr.grade] = (acc[curr.grade] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(distribution).map(([grade, count]) => ({
      x: grade,
      y: count,
      color:
        grade === "A"
          ? "#3f8600"
          : grade === "B"
          ? "#1890ff"
          : grade === "C"
          ? "#faad14"
          : grade === "D"
          ? "#d4b106"
          : "#cf1322",
    }));
  };

  // Initial data fetch for courses and students
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, studentsData] = await Promise.all([
          fetchCourses(),
          fetchStudents(),
        ]);
        setCourses(coursesData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  // Fetch results whenever filters change
  useEffect(() => {
    if (selectedSemester && currentUser) {
      fetchResults();
    }
  }, [selectedCourse, selectedSemester, currentUser]);

  // Initialize edit form when a result is selected
  useEffect(() => {
    if (selectedResult) {
      setEditData({
        grade: selectedResult.grade,
        description: selectedResult.description,
      });
      setIsEditing(false);
    }
  }, [selectedResult]);

  // Fetch results from Firestore
  const fetchResults = async () => {
    setLoading(true);
    try {
      const resultsRef = collection(db, "results");
      let q;
      if (selectedCourse) {
        q = query(
          resultsRef,
          where("semester", "==", selectedSemester),
          where("courseId", "==", selectedCourse),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "asc")
        );
      } else {
        q = query(
          resultsRef,
          where("semester", "==", selectedSemester),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "asc")
        );
      }

      const snapshot = await getDocs(q);
      const resultsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate statistics
      const totalStudents = resultsData.length;
      const averageScore =
        totalStudents > 0
          ? resultsData.reduce((acc, curr) => acc + curr.totalScore, 0) /
            totalStudents
          : 0;
      const passing = resultsData.filter((r) => r.totalScore >= 45).length;
      const passRate = totalStudents > 0 ? (passing / totalStudents) * 100 : 0;

      setResults(resultsData);
      setStats({
        totalStudents,
        averageScore: averageScore.toFixed(2),
        passRate: passRate.toFixed(2),
        failRate: (100 - passRate).toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to fetch courses and students
  const fetchCourses = async () => {
    const coursesRef = collection(db, "courses");
    const q = query(
      coursesRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchStudents = async () => {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // Save edits: Only update grade and description
  const saveEdits = async () => {
    try {
      const resultDocRef = doc(db, "results", selectedResult.id);
      await updateDoc(resultDocRef, {
        grade: editData.grade,
        description: editData.description,
      });
      await fetchResults();
      setIsEditing(false);
      setSelectedResult({ ...selectedResult, ...editData });
    } catch (error) {
      console.error("Error updating result:", error);
    }
  };

  // Generate transcript PDF
  const downloadTranscript = () => {
    if (!selectedResult) return;
    const student = students.find((s) => s.id === selectedResult.studentId);
    const course = courses.find((c) => c.id === selectedResult.courseId);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transcript", 105, 20, { align: "center" });
    doc.setFontSize(12);
    let y = 40;
    if (student) {
      doc.text(`Student Name: ${student.name}`, 10, y);
      y += 10;
      doc.text(`Matric Number: ${student.matricNumber}`, 10, y);
      y += 10;
    }
    if (course) {
      doc.text(`Course: ${course.courseCode} - ${course.courseTitle}`, 10, y);
      y += 10;
    }
    doc.text(
      `Continuous Assessment: ${selectedResult.continuousAssessment}`,
      10,
      y
    );
    y += 10;
    doc.text(`Exam Score: ${selectedResult.examScore}`, 10, y);
    y += 10;
    doc.text(`Total Score: ${selectedResult.totalScore}`, 10, y);
    y += 10;
    doc.text(`Grade: ${selectedResult.grade}`, 10, y);
    y += 10;
    doc.text(`GPA: ${selectedResult.gpa}`, 10, y);
    y += 10;
    doc.text(`Description: ${selectedResult.description}`, 10, y);
    const fileName = student
      ? `transcript-${student.matricNumber}.pdf`
      : "transcript.pdf";
    doc.save(fileName);
  };

  // Filter results by search query
  const filteredResults = results.filter((r) => {
    const student = students.find((s) => s.id === r.studentId);
    if (!student) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.matricNumber.toLowerCase().includes(searchLower)
    );
  });

  // Table column definitions
  const columns = [
    {
      title: "Student",
      dataIndex: "studentId",
      key: "student",
      render: (studentId) => {
        const student = students.find((s) => s.id === studentId);
        return student
          ? `${student.name} (${student.matricNumber})`
          : studentId;
      },
    },
    {
      title: "Course",
      dataIndex: "courseId",
      key: "course",
      render: (courseId) => {
        const course = courses.find((c) => c.id === courseId);
        return course
          ? `${course.courseCode} - ${course.courseTitle}`
          : courseId;
      },
    },
    {
      title: "CA Score",
      dataIndex: "continuousAssessment",
      key: "ca",
      sorter: (a, b) => a.continuousAssessment - b.continuousAssessment,
    },
    {
      title: "Exam Score",
      dataIndex: "examScore",
      key: "exam",
      sorter: (a, b) => a.examScore - b.examScore,
    },
    {
      title: "Total",
      dataIndex: "totalScore",
      key: "total",
      sorter: (a, b) => a.totalScore - b.totalScore,
      render: (score) => (
        <span style={{ color: score >= 45 ? "#3f8600" : "#cf1322" }}>
          {score}
        </span>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      filters: [
        { text: "A", value: "A" },
        { text: "B", value: "B" },
        { text: "C", value: "C" },
        { text: "D", value: "D" },
        { text: "F", value: "F" },
      ],
      onFilter: (value, record) => record.grade === value,
      render: (grade) => {
        const color =
          grade === "A"
            ? "green"
            : grade === "B"
            ? "blue"
            : grade === "C"
            ? "orange"
            : grade === "D"
            ? "gold"
            : "red";
        return <Tag color={color}>{grade}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedResult(record);
            setDrawerVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Function to open delete confirmation modal
  const handleDeleteResult = () => {
    if (!selectedResult) return;
    setDeleteModalVisible(true);
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={4}>Results Overview</Title>

          {alertMessage && (
            <Alert
              message={alertMessage}
              type={alertType}
              showIcon
              closable
              style={{ marginBottom: "16px" }}
              onClose={() => setAlertMessage(null)}
            />
          )}
          {/* Filters Section */}
          <Card>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Select Course"
                onChange={(value) => {
                  setSelectedCourse(value);
                }}
                allowClear
              >
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.courseCode}
                  </Option>
                ))}
              </Select>

              <Select
                style={{ width: 200 }}
                value={selectedSemester}
                onChange={(value) => {
                  setSelectedSemester(value);
                }}
              >
                <Option value="FirstSemester">First Semester</Option>
                <Option value="SecondSemester">Second Semester</Option>
              </Select>

              <Input.Search
                placeholder="Search Student"
                onSearch={(value) => setSearchQuery(value)}
                allowClear
                style={{ width: 200 }}
              />

              <Button
                type="primary"
                onClick={() => navigate("/admin/results/uploadResults")}
              >
                Upload Results
              </Button>
            </Space>
          </Card>

          {/* Statistics Cards */}
          <Row gutter={16}>
            <Col span={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card>
                  <Statistic
                    title="Total Students"
                    value={stats.totalStudents}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col span={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card>
                  <Statistic
                    title="Average Score"
                    value={stats.averageScore}
                    prefix={<BookOutlined />}
                    suffix="%"
                  />
                </Card>
              </motion.div>
            </Col>
            <Col span={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card>
                  <Statistic
                    title="Pass Rate"
                    value={stats.passRate}
                    prefix={<ArrowUpOutlined />}
                    suffix="%"
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col span={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card>
                  <Statistic
                    title="Fail Rate"
                    value={stats.failRate}
                    prefix={<ArrowDownOutlined />}
                    suffix="%"
                    valueStyle={{ color: "#cf1322" }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Grade Distribution Card */}
          <Card title="Grade Distribution">
            <Table
              dataSource={getGradeDistributionData()}
              pagination={false}
              size="small"
            >
              <Table.Column title="Grade" dataIndex="x" />
              <Table.Column
                title="Count"
                dataIndex="y"
                render={(value, record) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: `${(value / stats.totalStudents) * 200}px`,
                        height: "20px",
                        backgroundColor: record.color,
                        marginRight: "8px",
                        borderRadius: "4px",
                      }}
                    />
                    {value}
                  </div>
                )}
              />
            </Table>
          </Card>

          {/* Results Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredResults}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>

        {/* Result Details Drawer */}
        <Drawer
          title="Result Details"
          placement="right"
          onClose={() => {
            setDrawerVisible(false);
            setIsEditing(false);
          }}
          open={drawerVisible}
          width={500}
        >
          {selectedResult && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Student</Text>
                <Title level={5}>
                  {students.find((s) => s.id === selectedResult.studentId)
                    ?.name}
                </Title>
                <Text>
                  {students.find((s) => s.id === selectedResult.studentId)
                    ?.matricNumber}
                </Text>
              </div>

              <Divider />

              <div>
                <Text type="secondary">Course</Text>
                <Title level={5}>
                  {courses.find((c) => c.id === selectedResult.courseId)
                    ?.courseTitle}
                </Title>
                <Text>
                  {courses.find((c) => c.id === selectedResult.courseId)
                    ?.courseCode}
                </Text>
              </div>

              <Divider />

              {isEditing ? (
                // Only allow editing grade and description
                <Form layout="vertical">
                  <Form.Item
                    label="Grade"
                    rules={[{ required: true, message: "Please enter grade" }]}
                  >
                    <Input
                      value={editData.grade}
                      onChange={(e) =>
                        setEditData({ ...editData, grade: e.target.value })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Description">
                    <Input.TextArea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  </Form.Item>
                  <Space>
                    <Button type="primary" onClick={saveEdits}>
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  </Space>
                </Form>
              ) : (
                <>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="CA Score"
                        value={selectedResult.continuousAssessment}
                        suffix="/40"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Exam Score"
                        value={selectedResult.examScore}
                        suffix="/60"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Total Score"
                        value={selectedResult.totalScore}
                        suffix="/100"
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Grade"
                        value={selectedResult.grade}
                        valueStyle={{
                          color:
                            selectedResult.grade === "A"
                              ? "#3f8600"
                              : selectedResult.grade === "B"
                              ? "#1890ff"
                              : selectedResult.grade === "C"
                              ? "#faad14"
                              : selectedResult.grade === "D"
                              ? "#d4b106"
                              : "#cf1322",
                        }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="GPA"
                        value={selectedResult.gpa}
                        precision={2}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <div>
                    <Text type="secondary">Grade Description</Text>
                    <Paragraph>{selectedResult.description}</Paragraph>
                  </div>
                </>
              )}

              <Divider />

              {/* Edit, Download Transcript and Delete Buttons */}
              {!isEditing && (
                <Space>
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button onClick={downloadTranscript}>
                    Download Transcript
                  </Button>
                  <Button danger onClick={handleDeleteResult}>
                    Delete
                  </Button>
                </Space>
              )}
            </Space>
          )}
        </Drawer>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Delete Result"
          visible={deleteModalVisible}
          onOk={async () => {
            try {
              const resultDocRef = doc(db, "results", selectedResult.id);
              await deleteDoc(resultDocRef);
              await fetchResults();
              setDrawerVisible(false);
              setAlertMessage("Result deleted successfully!");
              setAlertType("success");
            } catch (error) {
              console.error("Error deleting result:", error);
              setAlertMessage("Failed to delete result!");
              setAlertType("error");
            } finally {
              setDeleteModalVisible(false);
            }
          }}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okType="danger"
        />
      </motion.div>
    </AdminLayout>
  );
};

export default ResultsOverview;
