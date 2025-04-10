import React, { useState, useEffect } from 'react';
import VideoList from '../components/VideoList';

function ProfilePage({ api }) {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '', profilePic: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setFormData({ username: res.data.username, bio: res.data.bio || '', profilePic: res.data.profilePic || '' });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [api]);

  const handleUpdate = async () => {
    try {
      const res = await api.put('/users/me', formData);
      setUser(res.data);
      setEditMode(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const pageStyles = {
    padding: '20px',
  };

  const inputStyles = {
    margin: '10px 0',
    padding: '10px',
    width: '100%',
  };

  const buttonStyles = {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  };

  return (
    <div style={pageStyles}>
      <h2>Profile</h2>
      {editMode ? (
        <>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Username"
            style={inputStyles}
          />
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Bio"
            style={inputStyles}
          />
          <input
            type="text"
            value={formData.profilePic}
            onChange={(e) => setFormData({ ...formData, profilePic: e.target.value })}
            placeholder="Profile Pic URL"
            style={inputStyles}
          />
          <button onClick={handleUpdate} style={buttonStyles}>Save</button>
          <button onClick={() => setEditMode(false)} style={{ ...buttonStyles, backgroundColor: '#f44336' }}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Bio:</strong> {user.bio || 'No bio yet'}</p>
          {user.profilePic && <img src={user.profilePic} alt="Profile" style={{ maxWidth: '200px' }} />}
          <button onClick={() => setEditMode(true)} style={buttonStyles}>Edit Profile</button>
        </>
      )}
      <h3>My Videos</h3>
      <VideoList api={api} videos={user.videos || []} setVideos={(videos) => setUser({ ...user, videos })} />
      <h3>My Folders</h3>
      {user.folders?.map((folder) => (
        <div key={folder._id}>
          <h4>{folder.name}</h4>
          <VideoList api={api} videos={folder.videos} setVideos={(videos) => { /* Update folder videos logic */ }} />
        </div>
      ))}
    </div>
  );
}

export default ProfilePage;