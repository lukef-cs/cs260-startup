import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import './make-post.css';

export function MakePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and content for your post.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }

      // Post was successfully created
      setSuccess(true);

      // Reset form
      setTitle('');
      setContent('');

      // Redirect to campus board after a short delay
      setTimeout(() => {
        navigate('/campus-board');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8"
        style={{
          width: '80vw',
          maxWidth: '600px',
        }}
        >
          <Card>
            <Card.Header>
              <h1 className="h3 mb-0">Create a New Post</h1>
            </Card.Header>
            <Card.Body>
              {success && (
                <Alert variant="success">
                  Your post was created successfully! Redirecting to the Campus Board...
                </Alert>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    disabled={isSubmitting}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here..."
                    disabled={isSubmitting}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/campus-board')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Create Post'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </main>
  );
}