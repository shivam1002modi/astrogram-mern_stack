import React from 'react';
import { Link } from 'react-router-dom';

export default function ProfileHeader({ user, postCount, isOwnProfile }) {
  if (!user) {
    return null;
  }

  const userInitial = user.name ? user.name.charAt(0) : '?';

  return (
    <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <img 
        src={user.profilePicture || `https://placehold.co/150x150/0a0826/e0e0ff?text=${userInitial}`} 
        alt={`${user.name || 'User'}'s profile`} 
        style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          border: '3px solid var(--color-accent)', 
          objectFit: 'cover' 
        }} 
      />
      <h1 style={{ fontFamily: 'var(--font-primary)', margin: '1rem 0 0.5rem 0' }}>
        {user.name}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        {user.bio || 'No bio yet.'}
      </p>
      <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
        {postCount} {postCount === 1 ? 'Post' : 'Posts'}
      </p>
      {isOwnProfile && (
        <Link to="/profile/edit" className="btn" style={{ marginTop: '1rem' }}>
          Edit Profile
        </Link>
      )}
    </div>
  );
}
