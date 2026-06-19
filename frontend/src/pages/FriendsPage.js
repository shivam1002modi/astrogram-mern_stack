import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import UserList from '../components/UserList'; // 1. Import the new reusable component

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const token = await currentUser.getIdToken();
        const res = await axios.get('http://localhost:5001/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (error) {
        toast.error('Could not load friends list.');
        console.error('Failed to fetch friends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [currentUser]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading friends...</p>;

  return (
    <Card>
      <h2>My Friends</h2>
      {friends.length === 0 ? (
        <p>You haven't added any friends yet. Go to the "Find Friends" page to connect with others!</p>
      ) : (
        // 2. Use the new UserList component to display the friends list
        <UserList users={friends} />
      )}
    </Card>
  );
}
