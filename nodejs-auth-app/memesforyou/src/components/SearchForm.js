import React, { useState } from 'react';

function SearchForm({ api, setResults }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [message, setMessage] = useState('');

  const search = async () => {
    try {
      const res = await api.get(`/memes/search?movieName=${searchQuery}&tags=${tags}&sortBy=${sortBy}`);
      setResults(res.data);
      setMessage('Search results loaded!');
    } catch (error) {
      setMessage(error.response?.data.msg || 'Search failed');
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
      <h2 style={{ marginTop: 0 }}>Search</h2>
      <input
        type="text"
        placeholder="Movie Name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={inputStyles}
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={inputStyles}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyles}>
        <option value="">Sort By</option>
        <option value="likes">Most Likes</option>
        <option value="views">Most Views</option>
      </select>
      <button onClick={search} style={buttonStyles}>Search</button>
      <p style={messageStyles}>{message}</p>
    </div>
  );
}

export default SearchForm;