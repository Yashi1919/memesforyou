import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoList from '../components/VideoList';

function VideoPage({ api }) {
  const [videos, setVideos] = useState([]);
  const location = useLocation();
  const folderId = new URLSearchParams(location.search).get('folderId');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/users/me');
        if (folderId) {
          const folder = res.data.folders.find((f) => f._id === folderId);
          setVideos(folder ? folder.videos : []);
        } else {
          setVideos(res.data.videos.filter((v) => !v.folderId));
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };
    fetchVideos();
  }, [api, folderId]);

  const pageStyles = {
    padding: '20px',
  };

  return (
    <div style={pageStyles}>
      <VideoList api={api} videos={videos} setVideos={setVideos} />
    </div>
  );
}

export default VideoPage;