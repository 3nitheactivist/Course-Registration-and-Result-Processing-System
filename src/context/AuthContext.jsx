
// import { createContext, useContext, useState, useEffect } from "react";
// import { auth } from "../firebase/firebaseConfig";
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { ScaleLoader } from "react-spinners";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false); // Set loading to false once Firebase resolves
//     });

//     return () => unsubscribe();
//   }, []);

//   const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
//   const logout = () => signOut(auth);

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {loading ? (
//         <div style={{alignItems: "center"}}>
//           <ScaleLoader color="#000" style={{margin: "auto", textAlign: "center"}}/>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// };


// import { createContext, useContext, useState, useEffect } from "react";
// import { auth } from "../firebase/firebaseConfig";
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { ScaleLoader } from "react-spinners";
// import "./AuthProvider.css";


// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
//   const logout = () => signOut(auth);

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {loading ? (
//         <div className="auth-loading-container">
//           <div className="auth-loading-content">
//             <div className="auth-loader-wrapper">
//               <ScaleLoader color="#000" />
//             </div>
//             <p className="auth-loading-text">Authenticating...</p>
//           </div>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ScaleLoader } from "react-spinners";
import { useToast } from "./ToastContext";
import "./AuthProvider.css";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.addToast("Successfully logged in!", "success");
    } catch (error) {
      toast.addToast(error.message, "error");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.addToast("Successfully logged out!", "success");
    } catch (error) {
      toast.addToast(error.message, "error");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? (
        <div className="auth-loading-container">
          <div className="auth-loading-content">
            <div className="auth-loader-wrapper">
              <ScaleLoader color="#000" />
            </div>
            <p className="auth-loading-text">Authenticating...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};