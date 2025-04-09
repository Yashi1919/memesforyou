import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

function VideoList({ api, videos, setVideos }) {
  const [videoUrls, setVideoUrls] = useState({});

  useEffect(() => {
    const fetchVideos = async () => {
      for (const video of videos) {
        if (!videoUrls[video._id]) {
          try {
            const res = await api.get(`/memes/download/${video._id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            setVideoUrls((prev) => ({ ...prev, [video._id]: url }));
          } catch (error) {
            console.error('Failed to fetch video blob:', error);
          }
        }
      }
    };
    fetchVideos();
  }, [videos, api, videoUrls]);

  const downloadVideo = async (videoId, movieName) => {
    try {
      const res = await api.get(`/memes/download/${videoId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${movieName}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const likeVideo = async (videoId) => {
    try {
      await api.post(`/memes/${videoId}/like`);
      const res = await api.get('/users/me');
      setVideos(res.data.videos);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const commentVideo = async (videoId, text) => {
    try {
      await api.post(`/memes/${videoId}/comment`, { text });
      const res = await api.get('/users/me');
      setVideos(res.data.videos);
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  const listStyles = {
    listStyle: 'none',
    padding: 0,
  };

  const itemStyles = {
    margin: '10px 0',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const videoStyles = {
    width: '100%',
    maxWidth: '400px',
  };

  const actionsStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  };

  const buttonStyles = {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  };

  const inputStyles = {
    padding: '10px',
    flex: 1,
    minWidth: '150px',
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Your Videos</h2>
      <ul style={listStyles}>
        {videos.map((video) => (
          <li key={video._id} style={itemStyles}>
            <strong>{video.movieName}</strong> (Tags: {video.tags.join(', ')})<br />
            {videoUrls[video._id] ? (
              <ReactPlayer
                url={videoUrls[video._id]}
                controls={true}
                width="100%"
                height="auto"
                style={videoStyles}
                onError={(e) => console.error('Video playback error:', e, 'URL:', videoUrls[video._id])}
              />
            ) : (
              <p>Loading video...</p>
            )}
            <div style={actionsStyles}>
              <button onClick={() => downloadVideo(video._id, video.movieName)} style={buttonStyles}>Download</button>
              <button onClick={() => likeVideo(video._id)} style={buttonStyles}>Like ({video.likes.length})</button>
              <input type="text" id={`comment-${video._id}`} placeholder="Add comment" style={inputStyles} />
              <button
                onClick={() => commentVideo(video._id, document.getElementById(`comment-${video._id}`).value)}
                style={buttonStyles}
              >
                Comment
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VideoList;