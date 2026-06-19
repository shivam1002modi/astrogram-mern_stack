import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import toast from 'react-hot-toast';

export default function FindFriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser, dbUser, setDbUser } = useAuth();

  // This function is now wrapped in useCallback for stability
  const handleSendRequest = useCallback(async (userId) => {
    try {
        const token = await currentUser.getIdToken();
        const res = await axios.post(`http://localhost:5001/api/friends/send/${userId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Friend request sent!');
        setDbUser(res.data.sender);
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send request.');
    }
  }, [currentUser, setDbUser]); // Dependencies for handleSendRequest

  // This function now correctly includes its dependency
  const getButtonState = useCallback((user) => {
    if (!dbUser) return null;

    const isFriend = dbUser.friends?.includes(user._id);
    const hasSentRequest = dbUser.friendRequests?.sent?.includes(user._id);
    const hasReceivedRequest = dbUser.friendRequests?.received?.includes(user._id);

    if (isFriend) {
        return <button className="btn btn-secondary" disabled>Friends</button>;
    }
    if (hasSentRequest) {
        return <button className="btn" disabled>Pending</button>;
    }
    if (hasReceivedRequest) {
        return <Link to="/friend-requests" className="btn">Respond</Link>;
    }
    return <button className="btn" onClick={() => handleSendRequest(user._id)}>Add Friend</button>;
  }, [dbUser, handleSendRequest]); // Added handleSendRequest to the dependency array

  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || !currentUser) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`http://localhost:5001/api/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
    } catch (error) {
      toast.error('Could not perform search.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  return (
    <Card>
      <h2>Find Friends</h2>
      <div className="form-group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users by name..."
          className="form-input"
        />
      </div>
      <div className="search-results">
        {loading && <p>Searching...</p>}
        {!loading && results.length > 0 && (
          <ul className="user-list">
            {results.map((user) => (
              <li key={user._id} className="user-list-item">
                <Link to={`/profile/${user._id}`} className="author-link">
                  <img
                    src={user.profilePicture || `https://placehold.co/40x40/0a0826/e0e0ff?text=${user.name.charAt(0)}`}
                    alt={user.name}
                    className="author-avatar"
                  />
                  <div className="user-info">
                    <span className="author-name">{user.name}</span>
                  </div>
                </Link>
                {getButtonState(user)}
              </li>
            ))}
          </ul>
        )}
        {!loading && searchQuery && results.length > 0 && results.length === 0 && (
          <p>No users found.</p>
        )}
      </div>
    </Card>
  );
}
