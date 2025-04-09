import React, { useState } from 'react';
import axios from 'axios';

function LoginCard({ setToken }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', loginData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setMessage('Logged in!');
    } catch (error) {
      setMessage(error.response?.data.msg || 'Login failed');
    }
  };

  const cardStyles = {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    margin: '20px auto',
  };

  const inputStyles = {
    margin: '10px 0',
    padding: '10px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const buttonStyles = {
    margin: '10px 0',
    padding: '10px',
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  };

  const messageStyles = {
    color: message.includes('failed') ? 'red' : 'green',
  };

  return (
    <div style={cardStyles}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        style={inputStyles}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        style={inputStyles}
      />
      <button onClick={login} style={buttonStyles}>Login</button>
      <p style={messageStyles}>{message}</p>
    </div>
  );
}

export default LoginCard;