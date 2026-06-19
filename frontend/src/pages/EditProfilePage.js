import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import Card from '../components/Card'; // 1. Import Card

export default function EditProfilePage() {
  const { currentUser, dbUser, setDbUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || '');
      setBio(dbUser.bio || '');
      setPreview(dbUser.profilePicture || '');
    }
  }, [dbUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !dbUser) {
      toast.error("You must be logged in to edit your profile.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await axios.put('http://localhost:5001/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      setDbUser(res.data);
      toast.success('Profile updated successfully!');
      navigate(`/profile/${res.data._id}`);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!dbUser) {
    return <h2 style={{ textAlign: 'center' }}>Loading...</h2>;
  }

  return (
    // 2. Use the Card component
    <Card title="Edit Profile">
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ textAlign: 'center' }}>
          <img 
            src={preview || `https://placehold.co/150x150/0a0826/e0e0ff?text=${name.charAt(0)}`} 
            alt="Profile preview" 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'block', margin: '1rem auto' }} />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="form-textarea" />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Card>
  );
}
