import React from 'react';

function Dashboard({ api }) {
  const dashboardStyles = {
    padding: '20px',
  };

  const messageStyles = {
    fontSize: '1.5rem',
    textAlign: 'center',
  };

  return (
    <div style={dashboardStyles}>
      <h1 style={messageStyles}>Welcome to MemesForYou</h1>
      <p style={{ textAlign: 'center' }}>Use the sidebar to search, upload, or view your videos.</p>
    </div>
  );
}

export default Dashboard;