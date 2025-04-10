import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import VideoList from '../components/VideoList';

function SearchPage({ api }) {
  const [results, setResults] = useState({ folders: [], videos: [] });

  const pageStyles = {
    padding: '20px',
  };

  const folderStyles = {
    margin: '10px 0',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  };

  const linkStyles = {
    textDecoration: 'none',
    color: '#4CAF50',
  };

  return (
    <div style={pageStyles}>
      <SearchForm api={api} setResults={setResults} />
      <h3>Folders</h3>
      {results.folders.map((folder) => (
        <div key={folder._id} style={folderStyles}>
          <Link to={`/videos?folderId=${folder._id}`} style={linkStyles}>{folder.name}</Link>
          <p>{folder.videos.length} videos</p>
        </div>
      ))}
      <h3>Videos</h3>
      <VideoList api={api} videos={results.videos} setVideos={(videos) => setResults({ ...results, videos })} />
    </div>
  );
}

export default SearchPage;