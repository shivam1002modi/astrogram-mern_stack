import { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from './ConfirmationModal';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const { currentUser, dbUser } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // This function is now defined once, making the JSX cleaner.
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  const getNavLinkClass = ({ isActive }) => (isActive ? 'active' : '');
  const requestCount = dbUser?.friendRequests?.received?.length || 0;

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="logo">ASTROGRAM</NavLink>
        <div className="nav-links">
          {!currentUser ? (
            <>
              <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
              <NavLink to="/register" className={getNavLinkClass}>Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
              <NavLink to="/explore" className={getNavLinkClass}>Explore</NavLink>
              <NavLink to="/friends" className={getNavLinkClass}>My Friends</NavLink>
              <NavLink to="/create-post" className={getNavLinkClass}>Create Post</NavLink>
              {dbUser && (
                <NavLink to={`/profile/${dbUser._id}`} className={getNavLinkClass}>
                  My Profile
                </NavLink>
              )}
              <NavLink to="/find-friends" className={getNavLinkClass}>Find Friends</NavLink>
              <NavLink to="/friend-requests" className="nav-link-requests">
                Requests
                {requestCount > 0 && (
                  <span className="notification-badge">{requestCount}</span>
                )}
              </NavLink>
              <button 
                onClick={() => setIsLogoutModalOpen(true)} 
                className="nav-button"
              >
                Logout
              </button> 
            </>
          )}
        </div>
        <ThemeSwitcher />
      </nav>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout} // <-- Cleaner prop
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </>
  );
}
