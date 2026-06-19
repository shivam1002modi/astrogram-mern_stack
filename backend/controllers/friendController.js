import User from '../models/UserModel.js';

// --- (Helper functions remain the same) ---
const findUserByUid = (uid) => User.findOne({ firebaseUid: uid });
const findUserById = (id) => User.findById(id);

// @desc    Send a friend request to a user
// @route   POST /api/friends/send/:userId
// @access  Private
export const sendFriendRequest = async (req, res) => {
  try {
    const sender = await findUserByUid(req.user.uid);
    const recipient = await findUserById(req.params.userId);

    if (!recipient || !sender) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // --- BULLETPROOF INITIALIZATION ---
    if (!recipient.friends) recipient.friends = [];
    if (!sender.friends) sender.friends = [];
    if (!recipient.friendRequests) recipient.friendRequests = {};
    if (!recipient.friendRequests.sent) recipient.friendRequests.sent = [];
    if (!recipient.friendRequests.received) recipient.friendRequests.received = [];
    if (!sender.friendRequests) sender.friendRequests = {};
    if (!sender.friendRequests.sent) sender.friendRequests.sent = [];
    if (!sender.friendRequests.received) sender.friendRequests.received = [];
    // --- END BULLETPROOF INITIALIZATION ---

    if (recipient.friends.includes(sender._id) || recipient.friendRequests.received.includes(sender._id)) {
      return res.status(400).json({ message: 'Request already sent or you are already friends.' });
    }

    recipient.friendRequests.received.push(sender._id);
    sender.friendRequests.sent.push(recipient._id);

    await recipient.save();
    const updatedSender = await sender.save();

    const recipientSocketId = req.userSockets[recipient._id.toString()];
    if (recipientSocketId) {
      const senderProfile = {
        _id: sender._id,
        name: sender.name,
        profilePicture: sender.profilePicture,
        flair: sender.flair
      };
      req.io.to(recipientSocketId).emit('new_friend_request', senderProfile);
    }

    res.status(200).json({ 
        message: 'Friend request sent successfully.',
        sender: updatedSender 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Accept a friend request
// @route   PUT /api/friends/accept/:userId
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = await findUserByUid(req.user.uid); // User B
    const requestingUser = await findUserById(req.params.userId); // User A

    if (!requestingUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Bulletproof Initialization
    if (!currentUser.friends) currentUser.friends = [];
    if (!requestingUser.friends) requestingUser.friends = [];
    if (!currentUser.friendRequests) currentUser.friendRequests = {};
    if (!currentUser.friendRequests.received) currentUser.friendRequests.received = [];
    if (!requestingUser.friendRequests) requestingUser.friendRequests = {};
    if (!requestingUser.friendRequests.sent) requestingUser.friendRequests.sent = [];

    if (!currentUser.friendRequests.received.includes(requestingUser._id)) {
      return res.status(400).json({ message: 'No friend request from this user.' });
    }

    currentUser.friends.push(requestingUser._id);
    requestingUser.friends.push(currentUser._id);

    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(id => !id.equals(requestingUser._id));
    requestingUser.friendRequests.sent = requestingUser.friendRequests.sent.filter(id => !id.equals(currentUser._id));

    // --- TRANSACTIONAL SAVE ---
    const updatedCurrentUser = await currentUser.save();
    const updatedRequestingUser = await requestingUser.save();
    // --- END TRANSACTIONAL SAVE ---

    // --- 2-WAY REAL-TIME NOTIFICATION ---
    const requestingUserSocketId = req.userSockets[requestingUser._id.toString()];
    if (requestingUserSocketId) {
      // Send the updated profile TO THE ORIGINAL SENDER (User A)
      req.io.to(requestingUserSocketId).emit('friend_update', updatedRequestingUser);
    }
    // --- END 2-WAY NOTIFICATION ---

    // Send the updated profile of the current user (User B) back in the response
    res.status(200).json({ 
        message: 'Friend request accepted.',
        user: updatedCurrentUser 
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- (The rest of the controller remains the same) ---

// @desc    Decline or cancel a friend request
// @route   PUT /api/friends/decline/:userId
// @access  Private
export const declineFriendRequest = async (req, res) => {
  try {
    const currentUser = await findUserByUid(req.user.uid);
    const otherUser = await findUserById(req.params.userId);

    if (!otherUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Bulletproof Initialization
    if (!currentUser.friendRequests) currentUser.friendRequests = {};
    if (!currentUser.friendRequests.received) currentUser.friendRequests.received = [];
    if (!otherUser.friendRequests) otherUser.friendRequests = {};
    if (!otherUser.friendRequests.sent) otherUser.friendRequests.sent = [];

    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(id => !id.equals(otherUser._id));
    otherUser.friendRequests.sent = otherUser.friendRequests.sent.filter(id => !id.equals(currentUser._id));

    await currentUser.save();
    await otherUser.save();

    res.status(200).json({ message: 'Friend request declined.' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Remove a friend
// @route   DELETE /api/friends/remove/:userId
// @access  Private
export const removeFriend = async (req, res) => {
    try {
        const currentUser = await findUserByUid(req.user.uid);
        const friendToRemove = await findUserById(req.params.userId);

        if (!friendToRemove || !currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Bulletproof Initialization
        if (!currentUser.friends) currentUser.friends = [];
        if (!friendToRemove.friends) friendToRemove.friends = [];

        currentUser.friends = currentUser.friends.filter(id => !id.equals(friendToRemove._id));
        friendToRemove.friends = friendToRemove.friends.filter(id => !id.equals(currentUser._id));

        await currentUser.save();
        await friendToRemove.save();

        res.status(200).json({ message: 'Friend removed.' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get the logged-in user's friends list
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
    try {
        const user = await findUserByUid(req.user.uid).populate('friends', 'name profilePicture flair');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.friends || []);
    } catch (error) {
        console.error('Error getting friends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get pending friend requests for the logged-in user
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.friendRequests && user.friendRequests.received && user.friendRequests.received.length > 0) {
            await user.populate({
                path: 'friendRequests.received',
                select: 'name profilePicture flair'
            });
            res.json(user.friendRequests.received);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Error getting friend requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

