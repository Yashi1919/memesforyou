import React, { useState, useEffect } from 'react';
import UploadForm from '../components/UploadForm';

function UploadPage({ api }) {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await api.get('/users/me');
        setFolders(res.data.folders || []);
      } catch (error) {
        console.error('Failed to fetch folders:', error);
      }
    };
    fetchFolders();
  }, [api]);

  const pageStyles = {
    padding: '20px',
  };

  return (
    <div style={pageStyles}>
      <UploadForm api={api} folders={folders} setFolders={setFolders} />
    </div>
  );
}

export default UploadPage;