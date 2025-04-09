import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginCard from '../components/LoginCard';

function LoginPage({ setToken }) {
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    setToken(token);
    navigate('/search'); // Redirect to search after login
  };

  const pageStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  };

  const linkStyles = {
    textAlign: 'center',
    marginTop: '10px',
  };

  return (
    <div style={pageStyles}>
      <LoginCard setToken={handleLoginSuccess} />
      <p style={linkStyles}>
        No account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default LoginPage;