import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import VideoPage from './pages/VideoPage';
import ProfilePage from './pages/ProfilePage'; // New page

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Persist token
  const navigate = useNavigate();
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setToken(null);
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const appStyles = {
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  };

  const layoutStyles = {
    display: 'flex',
  };

  return (
    <div style={appStyles}>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/signup" element={<SignupPage setToken={setToken} />} />
        {token && (
          <Route
            path="/*"
            element={
              <div style={layoutStyles}>
                <Sidebar logout={logout} />
                <div style={{ marginLeft: '250px', padding: '20px', flex: 1 }}>
                  <Routes>
                    <Route path="/upload" element={<UploadPage api={api} />} />
                    <Route path="/search" element={<SearchPage api={api} />} />
                    <Route path="/videos" element={<VideoPage api={api} />} />
                    <Route path="/profile" element={<ProfilePage api={api} />} />
                  </Routes>
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </div>
  );
}

function Sidebar({ logout }) {
  const sidebarStyles = {
    width: '250px',
    background: '#1a1a1a',
    color: 'white',
    padding: '20px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  const titleStyles = {
    margin: '0 0 20px',
    fontSize: '1.5rem',
  };

  const linkStyles = {
    textDecoration: 'none',
    color: 'white',
  };

  const navStyles = {
    listStyle: 'none',
    padding: 0,
  };

  const navLinkStyles = {
    display: 'block',
    color: 'white',
    textDecoration: 'none',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '5px',
  };

  const logoutButtonStyles = {
    width: '100%',
    background: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
  };

  return (
    <div style={sidebarStyles}>
      <h2 style={titleStyles}>
        <Link to="/search" style={linkStyles}>MemesForYou</Link>
      </h2>
      <nav>
        <ul style={navStyles}>
          <li><Link to="/search" style={navLinkStyles}>Search</Link></li>
          <li><Link to="/upload" style={navLinkStyles}>Upload</Link></li>
          <li><Link to="/videos" style={navLinkStyles}>My Videos</Link></li>
          <li><Link to="/profile" style={navLinkStyles}>Profile</Link></li>
          <li><button onClick={logout} style={logoutButtonStyles}>Logout</button></li>
        </ul>
      </nav>
    </div>
  );
}

export default App;