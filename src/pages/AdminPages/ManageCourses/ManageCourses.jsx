// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Table, Input, Space, Breadcrumb, Spin, message, Skeleton } from "antd";
// import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
// import { db } from "../../../firebase/firebaseConfig";
// import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"; // Firestore functions
// import AdminLayout from "../AdminLayout";
// import "./ManageCourses.css";

// const ManageCourses = () => {
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState([]); // Store courses from Firestore
//   const [loading, setLoading] = useState(false);
//   const [searchText, setSearchText] = useState(""); // Search input state

//   // Fetch courses from Firestore
//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       try {
//         const courseRef = collection(db, "courses");
//         const q = query(courseRef, orderBy("createdAt", "desc"), limit(3)); // Fetch latest 3 courses
//         const querySnapshot = await getDocs(q);

//         const courseList = querySnapshot.docs.map((doc) => ({
//           key: doc.id,
//           ...doc.data(),
//         }));

//         setCourses(courseList);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//         message.error("Failed to load courses!");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, []);

//   // Search function
//   const handleSearch = (e) => {
//     setSearchText(e.target.value.toLowerCase());
//   };

//   // Filter courses based on search input
//   const filteredCourses = courses.filter(
//     (course) =>
//       course.courseCode.toLowerCase().includes(searchText) ||
//       course.courseTitle.toLowerCase().includes(searchText) ||
//       course.department.toLowerCase().includes(searchText) ||
//       course.semester.toLowerCase().includes(searchText)
//   );

//   // Ant Design Table Columns
//   const columns = [
//     {
//       title: "Course Code",
//       dataIndex: "courseCode",
//       key: "courseCode",
//       sorter: (a, b) => a.courseCode.localeCompare(b.courseCode),
//     },
//     {
//       title: "Course Title",
//       dataIndex: "courseTitle",
//       key: "courseTitle",
//       sorter: (a, b) => a.courseTitle.localeCompare(b.courseTitle),
//     },
//     {
//       title: "Credit Hours",
//       dataIndex: "creditHours",
//       key: "creditHours",
//       sorter: (a, b) => a.creditHours - b.creditHours,
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//       key: "department",
//       sorter: (a, b) => a.department.localeCompare(b.department),
//     },
//     {
//       title: "Semester",
//       dataIndex: "semester",
//       key: "semester",
//       sorter: (a, b) => a.semester.localeCompare(b.semester),
//     },
//   ];

//   return (
//     <AdminLayout>
//       {/* Breadcrumb Navigation */}
//       <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
//         <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
//           Manage Courses
//         </Breadcrumb.Item>
//       </Breadcrumb>
//       <hr />

//       <div className="manage-course-container">
//         <div className="manage-course-header">
//           <h2>Manage Courses</h2>
//         </div>

//         <div className="manage-course-body">
//           <div className="manage-course-cards">
//             <div className="manage-course-card" onClick={() => navigate("/admin/courses/createCourse")}>
//               <div className="course-card-icon">
//                 <PlusOutlined />
//               </div>
//               <div>
//                 <h3>Create course</h3>
//                 <p>Create new course for students</p>
//               </div>
//             </div>
//             <div className="manage-course-card" onClick={() => navigate("/admin/courses/viewCourse")}>
//               <div className="course-card-icon">
//                 <EyeOutlined />
//               </div>
//               <div>
//                 <h3>View Course</h3>
//                 <p>Check list of available courses</p>
//               </div>
//             </div>
//           </div>

//           {/* Table Section */}
//           <div className="manage-course-table">
//             <div className="manage-course-table-title">
//               <h2>Available Courses</h2>
//             </div>

//             {/* Search Bar */}
//             <Space style={{ marginBottom: 16 }}>
//               <Input
//                 placeholder="Search courses..."
//                 prefix={<SearchOutlined />}
//                 onChange={handleSearch}
//                 allowClear
//               />
//             </Space>

//             {/* Show Spinner while loading */}
//             {loading ? (
//               <Skeleton active paragraph={{rows: 3}} />
//             ) : (
//               <Table
//                 // rowSelection={{ type: "checkbox" }}
//                 columns={columns}
//                 dataSource={filteredCourses}
//                 pagination={{ pageSize: 3 }}
//                 scroll={{ y: 200 }} // Fix table header
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default ManageCourses;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Space, Breadcrumb, message, Skeleton } from "antd";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { db } from "../../../firebase/firebaseConfig";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import AdminLayout from "../AdminLayout";
import "./ManageCourses.css";

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch courses created by the current admin (latest 3 courses)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courseRef = collection(db, "courses");
        const q = query(
          courseRef,
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const courseList = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          ...doc.data(),
        }));
        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Failed to load courses!");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCourses();
    }
  }, [currentUser]);

  // Search function
  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter courses based on search input
  const filteredCourses = courses.filter(
    (course) =>
      course.courseCode.toLowerCase().includes(searchText) ||
      course.courseTitle.toLowerCase().includes(searchText) ||
      course.department.toLowerCase().includes(searchText) ||
      course.semester.toLowerCase().includes(searchText)
  );

  // Ant Design Table Columns
  const columns = [
    {
      title: "Course Code",
      dataIndex: "courseCode",
      key: "courseCode",
      sorter: (a, b) => a.courseCode.localeCompare(b.courseCode),
    },
    {
      title: "Course Title",
      dataIndex: "courseTitle",
      key: "courseTitle",
      sorter: (a, b) => a.courseTitle.localeCompare(b.courseTitle),
    },
    {
      title: "Credit Hours",
      dataIndex: "creditHours",
      key: "creditHours",
      sorter: (a, b) => a.creditHours - b.creditHours,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      sorter: (a, b) => a.semester.localeCompare(b.semester),
    },
  ];

  return (
    <AdminLayout>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: "16px", cursor: "pointer" }}>
        <Breadcrumb.Item onClick={() => navigate("/admin/courses")}>
          Manage Courses
        </Breadcrumb.Item>
      </Breadcrumb>
      <hr />

      <div className="manage-course-container">
        <div className="manage-course-header">
          <h2>Manage Courses</h2>
        </div>

        <div className="manage-course-body">
          <div className="manage-course-cards">
            <div
              className="manage-course-card"
              onClick={() => navigate("/admin/courses/createCourse")}
            >
              <div className="course-card-icon">
                <PlusOutlined />
              </div>
              <div>
                <h3>Create Course</h3>
                <p>Create new course for students</p>
              </div>
            </div>
            <div
              className="manage-course-card"
              onClick={() => navigate("/admin/courses/viewCourse")}
            >
              <div className="course-card-icon">
                <EyeOutlined />
              </div>
              <div>
                <h3>View Course</h3>
                <p>Check list of available courses</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="manage-course-table">
            <div className="manage-course-table-title">
              <h2>Available Courses</h2>
            </div>

            {/* Search Bar */}
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search courses..."
                prefix={<SearchOutlined />}
                onChange={handleSearch}
                allowClear
              />
            </Space>

            {/* Show Skeleton while loading */}
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredCourses}
                pagination={{ pageSize: 3 }}
                scroll={{ y: 200 }} // Fix table header
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCourses;
