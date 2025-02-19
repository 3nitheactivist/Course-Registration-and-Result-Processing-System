import React from "react";
import AdminLayout from "../AdminLayout";
import { Typography, Card } from "antd";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import collegeStudent from "../../../assets/Img/5. College Student.png";
import backPack from "../../../assets/Img/Backpack.png";
import scholarcapScroll from "../../../assets/Img/Scholarcap scroll.png";
import { useNavigate } from "react-router-dom";


const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: "24px",
            background: "#4CAF50",
            borderRadius: "8px",
            marginBottom: "24px",
            color: "white",
            minHeight: "180px",
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
          }}
        >
          {/* Content Container */}
          <div style={{ width: "60%", height: "200px", marginLeft: "20px"}}>
            <motion.div variants={itemVariants}>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)", position: "relative", top: "25px" }}>
                {currentDate}
              </Text>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Title level={2} style={{ color: "white", margin: "16px 0", marginTop: "70px", fontSize: "32px", fontWeight: "600" }}>
                Welcome back, Mr {currentUser?.displayName}!
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Always stay updated in your student portal
              </Text>
            </motion.div>
          </div>

          {/* Images Container */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "10px",
              bottom: 0,
              display: "flex",
              alignItems: "flex-end",
              gap: "4px",
              height: "100%",
              padding: "16px",
            }}
          >
            <motion.img
              variants={imageVariants}
              src={scholarcapScroll}
              alt="scroll"
              style={{
                // height: "250px",
                height: "250px",
                objectFit: "contain",
                // marginBottom: "40px",
                position: "relative",
                left: "15rem",
                
              }}
            />

            <motion.img
              variants={imageVariants}
              src={collegeStudent}
              alt="student"
              style={{
                height: "254px",
                width: "254px",
                // width: "200px",
                objectFit: "contain",
                marginBottom: "-15px",
                position: "relative",
                left: "6rem",
                // marginLeft: "30px",
              }}
            />
            <motion.img
              variants={imageVariants}
              src={backPack}
              alt="backpack"
              style={{
                height: "183px",
                width: "183px",
                objectFit: "contain",
                marginBottom: "-10px",
                // marginTop: "30px" ,
              }}
            />
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.div variants={itemVariants}>
          <Title level={4}>Overview</Title>
        </motion.div>

        <motion.div
          variants={containerVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <motion.div variants={itemVariants}>
            <Card title="Overview of courses" style={{ height: "100%", cursor: "pointer", }} onClick={() => navigate("/admin/courses")}>
              Add or remove courses
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card title="Overview of students" style={{ height: "100%", cursor: "pointer", }} onClick={() => navigate("/admin/students")}>
              Check list of available student
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card title="Overview of results" style={{ height: "100%", cursor: "pointer", }} onClick={() => navigate("/admin/results")}>
              Update result of student
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
