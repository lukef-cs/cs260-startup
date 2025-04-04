import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

export function CommentSection({ postId }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
      }

      // Comment was successfully created - WebSocket will handle updating the UI
      setComment('');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-3">
      <Card.Body>
        <h6>Add a Comment</h6>
        {error && <p className="text-danger">{error}</p>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              disabled={isSubmitting}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            size="sm"
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}