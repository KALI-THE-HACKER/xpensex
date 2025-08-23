import React, { useState, useEffect } from "react";
import "./index.css";
import LoginPage from "./Components/LoginPage";
import Dashboard from "./Components/Dashboard";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        // User is signed in and email is verified
        setUserData({
          email: user.email,
          name: user.displayName || user.email
        });
        setIsLoggedIn(true);
      } else {
        // User is signed out or email not verified
        setUserData(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setIsLoggedIn(false);
    } catch (error) {
      alert("Failed to log out. Please try again.");
    }
  };

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} userData={userData} />;
  }

  return <LoginPage onLogin={handleLogin} />;
}

export default App;