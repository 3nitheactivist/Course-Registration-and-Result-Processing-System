import "./Login.css";
import { useState, useEffect } from "react";
import { SyncLoader } from "react-spinners";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useToast } from "../../../context/ToastContext";

// SVG icons as components
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const toast = useToast();
  const { login } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Load remembered email and role
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedRole = localStorage.getItem("rememberedRole");
    if (rememberedEmail && rememberedRole) {
      setEmail(rememberedEmail);
      setRole(rememberedRole);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!role || !email || !password) {
      toast.addToast("Please fill in all fields", "error");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      await login(email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedRole", role);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedRole");
      }

      toast.addToast("Login successful", "success");

      // Navigate based on role
      if (role === "admin") {
        navigate("/admin/dashboard"); // Replace with your admin route
      } else if (role === "student") {
        navigate("/studentDashboard"); // Replace with your student route
      }
    } catch (err) {
      let errorMessage = "An error occurred during login";

      switch (err.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        default:
          errorMessage = err.message;
      }

      toast.addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.addToast("Please enter your email address", "warning");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.addToast("Password reset email sent! Check your inbox.", "success");
    } catch (error) {
      toast.addToast("Failed to send reset email. Please try again.", "error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <h2 className="form-title">Log in to your account</h2>
          <div className="text">
            <h1>Select your role</h1>
          </div>
        </div>

        <div className="form-group">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role && (
          <>
            <div className="form-group">
              <input
                className="form-input"
                
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group password-input-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="forgot-password"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}

        <div className="form-actions">
          <button
            className="login-button"
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <SyncLoader size={10} color="White" /> : "Login"}
          </button>
        </div>
        <div className="login-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
