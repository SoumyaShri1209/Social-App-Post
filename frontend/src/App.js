import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Listen to storage changes (when token is set in another tab)
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Also check token on every route change (optional but safe)
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token !== null && !isAuthenticated) {
      setIsAuthenticated(true);
    } else if (token === null && isAuthenticated) {
      setIsAuthenticated(false);
    }
  };

  // Run check on each render
  checkAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Feed /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;