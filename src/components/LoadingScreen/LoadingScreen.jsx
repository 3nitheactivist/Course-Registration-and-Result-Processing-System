import React, { useEffect } from "react";
import "./LoadingScreen.css";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import yabalogo from '../../assets/Img/white 1.png'

const LoadingScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate("/admin/dashboard");
      } else {
        navigate("/login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="loading-container">
      <div className="logo-container">
        <img 
          // src="/api/placeholder/120/120"
          src={yabalogo}
          alt="Yaba College of Technology Logo"
          className="logo-image"
        />
      </div>
      <div className="loader-content">
        <ScaleLoader color="#000" />
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;