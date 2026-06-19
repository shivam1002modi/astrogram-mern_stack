import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import ExplorePage from './pages/ExplorePage';
import CreatePost from "./pages/CreatePost";
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FindFriendsPage from './pages/FindFriendsPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import FriendsPage from './pages/FriendsPage';

// We no longer need to import App.css

function AppContent() {
  return (
    <>
      <div className="starfield-bg">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <Navbar />

      <main className="main-container">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/find-friends" element={<FindFriendsPage />} />
            <Route path="/friend-requests" element={<FriendRequestsPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <AppContent />
    </Router>
  );
}
