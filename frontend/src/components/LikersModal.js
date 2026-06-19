import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Helper to safely get the first initial of a name
const getInitial = (name) => (name ? name.charAt(0) : '?');

export default function LikersModal({ isOpen, onClose, likerIds }) {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && likerIds.length > 0) {
      const fetchLikers = async () => {
        setLoading(true);
        try {
          const res = await axios.post('http://localhost:5001/api/users/profiles', {
            ids: likerIds,
          });
          setLikers(res.data);
        } catch (error) {
          console.error('Failed to fetch likers:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLikers();
    }
  }, [isOpen, likerIds]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <h2>Liked by</h2>
        {loading ? (
          <p>Loading...</p>
        ) : likers.length === 0 ? (
          <p>This post has no likes yet.</p>
        ) : (
          <ul className="likers-list">
            {likers.map((liker) => (
              <li key={liker._id} className="liker-item">
                <Link to={`/profile/${liker._id}`} onClick={onClose}>
                  <img
                    src={liker.profilePicture || `https://placehold.co/40x40/0a0826/e0e0ff?text=${getInitial(liker.name)}`}
                    alt={liker.name}
                  />
                  <span>{liker.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
