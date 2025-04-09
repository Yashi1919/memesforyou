import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupCard from '../components/SignupCard';

function SignupPage({ setToken }) {
  const navigate = useNavigate();

  const handleSignupSuccess = (token) => {
    setToken(token);
    navigate('/search'); // Redirect to search after signup
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
      <SignupCard setToken={handleSignupSuccess} />
      <p style={linkStyles}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default SignupPage;