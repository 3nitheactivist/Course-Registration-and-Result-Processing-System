import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext"; // ✅ Import useAuth
import Login from "./pages/Authentication/Login/Login";
import SignUp from "./pages/Authentication/SignUp/SignUp";
import AdminDashboard from "./pages/AdminPages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import StudentDashboard from "./pages/StudentPages/StudentDashboard/StudentDashboard";
import ManageCourses from "./pages/AdminPages/ManageCourses/ManageCourses";
import "antd/dist/reset.css"; // or antd/dist/antd.css for older versions
import EnrollStudents from "./pages/AdminPages/EnrollStudents/EnrollStudents";
import UploadResults from "./pages/AdminPages/UploadResults/UploadResults";
import CreateCourse from "./pages/AdminPages/ManageCourses/CreateCourse/CreateCourse";
import ViewCourse from "./pages/AdminPages/ManageCourses/ViewCourse/ViewCourse";
import ManageStudents from "./pages/AdminPages/EnrollStudents/ManageStudents/ManageStudents";
import ViewStudents from "./pages/AdminPages/EnrollStudents/ViewStudents/ViewStudents";
import StudentProfile from "./pages/AdminPages/EnrollStudents/ViewStudents/StudentProfile";
import ResultsOverview from "./pages/AdminPages/UploadResults/ResultsOverview";
import StudentLogin from "./pages/Authentication/StudentLogin";
import StudentResults from "./pages/StudentPages/StudentResults/StudentResults";
import StudentCourses from "./pages/StudentPages/DashboardContent/DashboardContent";
import ProfileStudent from "./pages/StudentPages/ProfileStudent/ProfileStudent";

// import AdminLayout from "./pages/AdminPages/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreenWrapper />} />{" "}
        {/* Use wrapper */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        {/* STUDENTS COMPONENTS */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/login"
          element={
              <StudentLogin />
          }
        />
        <Route
          path="/student/view-results"
          element={
            <ProtectedRoute>
              < StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/view-courses"
          element={
            <ProtectedRoute>
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <ProfileStudent />
            </ProtectedRoute>
          }
        />
        {/* ADMIN COMPONENTS */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/enroll"
          element={
            <ProtectedRoute>
              <EnrollStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/view"
          element={
            <ProtectedRoute>
              <ViewStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/profile/:studentId"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <ManageCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/createCourse"
          element={
            <ProtectedRoute>
              <CreateCourse />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/viewCourse"
          element={
            <ProtectedRoute>
              <ViewCourse />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results/uploadResults"
          element={
            <ProtectedRoute>
              <UploadResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute>
              <ResultsOverview />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// ✅ New Wrapper to prevent early redirection issues
function LoadingScreenWrapper() {
  const { user, loading } = useAuth(); // ✅ No more ReferenceError
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (user) {
          navigate("/admin/dashboard");
        } else {
          navigate("/login");
        }
      }, 2000);
    }
  }, [user, loading, navigate]);

  return loading ? (
    <div className="auth-loading-container">
      <p className="auth-loading-text">Authenticating...</p>
    </div>
  ) : (
    <LoadingScreen />
  );
}

export default App;
