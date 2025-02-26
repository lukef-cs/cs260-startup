import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function MakePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new post object
    const newPost = {
      id: Date.now(), // Use timestamp as a simple unique ID
      title: title,
      content: content,
      date: 'Just now', // You could format this better with a date library
    };

    // Get existing posts from localStorage or initialize empty array
    const existingPosts = JSON.parse(localStorage.getItem('campusPosts') || '[]');

    // Add new post to the beginning of the array (newest first)
    const updatedPosts = [newPost, ...existingPosts];

    // Save updated posts back to localStorage
    localStorage.setItem('campusPosts', JSON.stringify(updatedPosts));

    // Clear form fields
    setTitle('');
    setContent('');

    // Redirect to campus board page
    navigate('/campus-board');
  };

  return (
    <main className='container-fluid bg-body text-center'>
      <div className="row justify-content-center w-100">
        <div className="col-md-6" style={{ maxWidth: '500px' }}>
          <h1 className="text-center mb-4">Make a Post</h1>
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="postTitle" className="form-label">
                    <i className="bi bi-pencil"></i> Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="postTitle"
                    placeholder="Enter your post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="postDescription" className="form-label">
                    <i className="bi bi-file-text"></i> Description
                  </label>
                  <textarea
                    className="form-control"
                    id="postDescription"
                    rows="5"
                    placeholder="Write your post content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Create Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}