import "./Login.css";
import { useState, useEffect } from "react";
import { SyncLoader } from "react-spinners";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const toast = useToast();
  const { login } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  // Load remembered email from localStorage (if any)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.addToast("Please fill in all fields", "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.addToast("Please enter a valid email address", "error");
      return;
    }

    // Validate password (example: at least 6 characters)
    if (password.length < 6) {
      toast.addToast("Password must be at least 6 characters long", "error");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      
      // Store admin password if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("adminPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("adminPassword");
      }

      toast.addToast("Login successful", "success");

      // Navigate to the admin dashboard since this is admin login
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.addToast(error.message, "error");
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
          <h2 className="form-title">Admin Login</h2>
        </div>

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
      </div>
    </div>
  );
};

export default Login;
