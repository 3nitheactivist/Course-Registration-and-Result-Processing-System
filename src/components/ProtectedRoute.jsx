import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Get the current path
  const path = window.location.pathname;
  
  // Determine if this is a student route
  const isStudentRoute = path.startsWith('/student');
  
  if (loading) return <p>Loading...</p>;
  
  // If user is not authenticated, redirect to appropriate login page
  if (!user) {
    return <Navigate to={isStudentRoute ? "/student/login" : "/login"} />;
  }
  
  return children;
};

export default ProtectedRoute;