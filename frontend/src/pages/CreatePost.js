import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/Card';

export default function CreatePost() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      return toast.error('Please fill in all fields and select an image.');
    }
    if (!currentUser) {
      return toast.error('You must be logged in to create a post.');
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);
    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:5001/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="e.g., Andromeda Galaxy" />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-textarea" placeholder="Details about your observation..." />
        </div>
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="form-input" />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </Card>
  );
}
