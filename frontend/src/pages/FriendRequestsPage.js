import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import toast from 'react-hot-toast';

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed unused 'dbUser' variable
  const { currentUser, setDbUser } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        const res = await axios.get('http://localhost:5001/api/friends/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (error) {
        toast.error('Could not load friend requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [currentUser]);

  const handleRequest = async (userId, action) => {
    try {
      const token = await currentUser.getIdToken();
      const url = `http://localhost:5001/api/friends/${action}/${userId}`;
      const res = await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'declined'}.`);
      
      setDbUser(res.data.user);
      setRequests(prevRequests => prevRequests.filter(req => req._id !== userId));

    } catch (error) {
      toast.error('Failed to process request.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading requests...</p>;

  return (
    <Card>
      <h2>Friend Requests</h2>
      {!loading && requests.length === 0 ? (
        <p>You have no pending friend requests.</p>
      ) : (
        <ul className="user-list">
          {requests.map((user) => (
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
              <div className="request-actions">
                <button className="btn" onClick={() => handleRequest(user._id, 'accept')}>Accept</button>
                <button className="btn btn-secondary" onClick={() => handleRequest(user._id, 'decline')}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
