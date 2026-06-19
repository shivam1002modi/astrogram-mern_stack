import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import io from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function fetches the complete user profile from the server.
  const refreshDbUser = useCallback(async (user) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await axios.post("http://localhost:5001/api/users/auth", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDbUser(res.data);
    } catch (error) {
      console.error("Failed to refresh dbUser", error);
    }
  }, []);

  // Effect to handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await refreshDbUser(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshDbUser]);

  // Effect to handle real-time socket events
  useEffect(() => {
    if (dbUser) {
      const socket = io('http://localhost:5001');
      socket.emit('register', dbUser._id);

      // Listener for incoming friend requests (pushes new sender data)
      socket.on('new_friend_request', (newRequestProfile) => {
        setDbUser(prevDbUser => {
          // Create a complete, robust friendRequests object every time
          const currentSent = prevDbUser.friendRequests?.sent || [];
          const currentReceived = prevDbUser.friendRequests?.received || [];

          // Prevent adding a duplicate if the event fires multiple times
          const alreadyExists = currentReceived.some(req => req._id === newRequestProfile._id);
          if (alreadyExists) {
            return prevDbUser;
          }

          // Add the new request data directly to the state
          const updatedFriendRequests = {
            sent: currentSent,
            received: [...currentReceived, newRequestProfile],
          };

          return { ...prevDbUser, friendRequests: updatedFriendRequests };
        });
      });

      // Listener for when a sent request is accepted or declined
      socket.on('friend_update', (updatedUserProfile) => {
        // The server sends our own, updated profile. We update the central state.
        setDbUser(updatedUserProfile);
      });
      
      return () => socket.disconnect();
    }
  }, [dbUser]);

  // Expose setDbUser so components can update the central state after actions
  const value = { currentUser, dbUser, setDbUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

