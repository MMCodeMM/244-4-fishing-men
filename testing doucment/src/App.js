import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FishIdentification from './pages/FishIdentification';
import Map from './pages/Map';
import Search from './pages/Search';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const MainContent = styled.main`
  padding-top: 70px;
  min-height: calc(100vh - 70px);
`;

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-3">載入中...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/identify" element={<FishIdentification />} />
      <Route path="/map" element={<Map />} />
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Navbar />
          <MainContent>
            <AppRoutes />
          </MainContent>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
