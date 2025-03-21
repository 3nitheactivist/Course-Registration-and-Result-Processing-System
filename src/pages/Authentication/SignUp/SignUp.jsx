import "./SignUp.css";
import { useState } from "react";
import { SyncLoader } from "react-spinners";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useToast } from "../../../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c-7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toast = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.addToast("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      toast.addToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: email.split("@")[0] });
      await setDoc(doc(db, "users", user.uid), { role: "admin", email });

      toast.addToast("Admin account created successfully", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      let errorMessage = "An error occurred during signup";

      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email is already in use";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters";
          break;
        default:
          errorMessage = err.message;
      }

      toast.addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="form-header">
          <h2 className="form-title">Admin Sign Up</h2>
        </div>

        <div className="form-group">
          <input
            className="form-input"
            type="email"
            placeholder="Admin Email"
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
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn" disabled={loading}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <div className="form-group password-input-wrapper">
          <input
            className="form-input"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn" disabled={loading}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="login-button" onClick={handleSignUp} disabled={loading}>
            {loading ? <SyncLoader size={10} color="White" /> : "Sign Up"}
          </button>
        </div>
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;