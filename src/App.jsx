import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CharacterSelection from './components/CharacterSelection';
import ChatInterface from './components/ChatInterface';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import UserLogin from './components/UserLogin';
import UserSignup from './components/UserSignup';

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    if (adminToken && adminUser) {
      setAdmin(JSON.parse(adminUser));
    }

    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('user');
    if (userToken && userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch characters from API
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
      // Fallback to empty array if API fails
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
  };

  const handleBack = () => {
    setSelectedCharacter(null);
  };

  const handleAdminLogin = (adminUser) => {
    setAdmin(adminUser);
  };

  const handleAdminLogout = () => {
    setAdmin(null);
  };

  const handleUserLogin = (userData) => {
    setUser(userData);
  };

  const handleUserLogout = () => {
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setSelectedCharacter(null);
  };

  // Protected Route Component for Admin
  const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src="/book.svg" alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
          <p className="text-2xl font-black uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* User Auth Routes */}
        <Route path="/login" element={<UserLogin onLogin={handleUserLogin} />} />
        <Route path="/signup" element={<UserSignup onLogin={handleUserLogin} />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
            </AdminProtectedRoute>
          } 
        />

        {/* Main App Routes */}
        <Route 
          path="/*" 
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar user={user} onLogout={handleUserLogout} />
              <main className="flex-1">
                {!selectedCharacter ? (
                  <CharacterSelection
                    characters={characters}
                    onSelectCharacter={handleSelectCharacter}
                    user={user}
                  />
                ) : (
                  <ChatInterface
                    character={selectedCharacter}
                    onBack={handleBack}
                    user={user}
                  />
                )}
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
