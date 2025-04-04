import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketContext } from '../app';

export function MakePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get WebSocket context
  const wsService = useContext(WebSocketContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
        credentials: 'include', // Important: Include cookies for auth
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();

      // If WebSocket isn't working, we won't get real-time updates
      // This sends a manual update through WebSocket to ensure real-time notification
      if (wsService && wsService.connected) {
        wsService.sendMessage({
          type: 'postUpdate',
          post: newPost
        });
      }

      // Clear form fields
      setTitle('');
      setContent('');

      // Redirect to campus board page
      navigate('/campus-board');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='container-fluid bg-body text-center'>
      <div className="row justify-content-center w-100">
        <div className="col-md-6" style={{ maxWidth: '500px' }}>
          <h1 className="text-center mb-4">Make a Post</h1>
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </button>
                </div>

                {/* WebSocket status indicator */}
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    {wsService?.connected ? (
                      <span className="text-success">
                        <i className="bi bi-lightning-charge-fill me-1"></i>
                        Your post will be delivered in real-time
                      </span>
                    ) : (
                      <span className="text-secondary">