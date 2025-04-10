import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoList from '../components/VideoList';

function VideoPage({ api }) {
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const location = useLocation();
  const folderId = new URLSearchParams(location.search).get('folderId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/users/me');
        setFolders(res.data.folders || []);
        if (folderId) {
          const folder = res.data.folders.find((f) => f._id === folderId);
          setVideos(folder ? folder.videos : []);
        } else {
          setVideos(res.data.videos.filter((v) => !v.folderId));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [api, folderId]);

  const pageStyles = {
    padding: '20px',
  };

  const buttonStyles = {
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    margin: '10px 0',
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await api.delete(`/folders/${folderId}`);
      setFolders((prev) => prev.filter((f) => f._id !== folderId));
      if (folderId === new URLSearchParams(location.search).get('folderId')) setVideos([]);
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  return (
    <div style={pageStyles}>
      {folderId ? (
        <>
          <h2>{folders.find((f) => f._id === folderId)?.name || 'Folder'}</h2>
          <button onClick={() => handleDeleteFolder(folderId)} style={buttonStyles}>Delete Folder</button>
        </>
      ) : (
        <h2>My Videos</h2>
      )}
      <VideoList api={api} videos={videos} setVideos={setVideos} />
    </div>
  );
}

export default VideoPage;