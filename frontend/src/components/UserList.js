import React from 'react';
import { Link } from 'react-router-dom';

// This is a sub-component that renders a single user in the list.
const UserListItem = ({ user, children }) => (
  <li className="user-list-item">
    <Link to={`/profile/${user._id}`} className="author-link">
      <img
        src={user.profilePicture || `https://placehold.co/40x40/0a0826/e0e0ff?text=${user.name.charAt(0)}`}
        alt={user.name}
        className="author-avatar"
      />
      <div className="user-info">
        <span className="author-name">{user.name}</span>
        {user.flair && <span className="user-flair">{user.flair}</span>}
      </div>
    </Link>
    {/* This will render any buttons passed to the component */}
    {children}
  </li>
);


// This is the main component that renders the full list.
export default function UserList({ users, children }) {
  return (
    <ul className="user-list">
      {users.map((user, index) => (
        // We pass the user and any potential action buttons to the list item
        <UserListItem key={user._id} user={user}>
          {children && children(user, index)}
        </UserListItem>
      ))}
    </ul>
  );
}
