import React, { useState } from 'react';

function UploadForm({ api, folders, setFolders }) {
  const [uploadData, setUploadData] = useState({ movieName: '', tags: '', video: null, folderId: '', isPublic: true });
  const [newFolderName, setNewFolderName] = useState('');
  const [message, setMessage] = useState('');

  const createFolder = async () => {
    try {
      const res = await api.post('/folders', { name: newFolderName });
      setFolders((prev) => [...prev, res.data]);
      setNewFolderName('');
      setMessage('Folder created!');
    } catch (error) {
      setMessage('Failed to create folder');
    }
  };

  const upload = async () => {
    const formData = new FormData();
    formData.append('movieName', uploadData.movieName);
    formData.append('tags', uploadData.tags);
    formData.append('video', uploadData.video);
    if (uploadData.folderId) formData.append('folderId', uploadData.folderId);
    formData.append('isPublic', uploadData.isPublic);

    try {
      await api.post('/memes/upload', formData);
      setMessage('Video uploaded!');
      setUploadData({ movieName: '', tags: '', video: null, folderId: '', isPublic: true });
    } catch (error) {
      setMessage(error.response?.data.msg || 'Upload failed');
    }
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
    <div>
      <h2 style={{ marginTop: 0 }}>Upload Video</h2>
      <input
        type="text"
        placeholder="Movie Name"
        value={uploadData.movieName}
        onChange={(e) => setUploadData({ ...uploadData, movieName: e.target.value })}
        style={inputStyles}
      />
      <input
        type="text"
        placeholder="Tags (e.g., funny,action)"
        value={uploadData.tags}
        onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
        style={inputStyles}
      />
      <select
        value={uploadData.folderId}
        onChange={(e) => setUploadData({ ...uploadData, folderId: e.target.value })}
        style={inputStyles}
      >
        <option value="">No Folder</option>
        {folders.map((folder) => (
          <option key={folder._id} value={folder._id}>{folder.name}</option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          checked={uploadData.isPublic}
          onChange={(e) => setUploadData({ ...uploadData, isPublic: e.target.checked })}
        />
        Public Video
      </label>
      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => setUploadData({ ...uploadData, video: e.target.files[0] })}
        style={inputStyles}
      />
      <button onClick={upload} style={buttonStyles}>Upload Video</button>
      <h3>Create New Folder</h3>
      <input
        type="text"
        placeholder="Folder Name"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        style={inputStyles}
      />
      <button onClick={createFolder} style={buttonStyles}>Create Folder</button>
      <p style={messageStyles}>{message}</p>
    </div>
  );
}

export default UploadForm;