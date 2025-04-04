import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Card, Button, Spinner } from 'react-bootstrap';
import webSocketService from '../websocketService';
import { CommentSection } from '../components/commentSection';
import './campus-board.css';

export function CampusBoard() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [newPost, setNewPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastPostCount, setLastPostCount] = useState(0);
  const navigate = useNavigate();

  // Function to format dates in a user-friendly way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
    fetchStats();

    // Connect to WebSocket when component mounts
    webSocketService.connect();

    // Register handler for WebSocket messages
    const unregister = webSocketService.registerHandler('campusBoard', handleWebSocketMessage);

    // Clean up WebSocket connection and handler when component unmounts
    return () => {
      unregister();
    };
  }, []);

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    console.log('WebSocket message received:', data);

    switch (data.type) {
      case 'new-post':
        // Add new post to the state and show toast
        setPosts(prevPosts => [data.post, ...prevPosts]);
        setNewPost(data.post);
        setShowToast(true);
        break;

      case 'new-comment':
        // Update the post with the new comment
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === data.postId
              ? { ...post, comments: [...(post.comments || []), data.comment] }
              : post
          )
        );
        break;

      case 'vote-update':
        // Update the likes count for a post
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === data.postId
              ? { ...post, likes: data.likes }
              : post
          )
        );
        break;

      case 'delete-post':
        // Remove the deleted post from the state
        setPosts(prevPosts => prevPosts.filter(post => post._id !== data.postId));
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  // Fetch posts from the API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to home/login if unauthorized
          navigate('/');
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const posts = await response.json();
      setPosts(posts);
      setLastPostCount(posts.length);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch campus stats (e.g., football stats) from API
  const fetchStats = async () => {
    try {
      // Mock data for now - replace with actual API call later
      const mockStats = {
        team: 'BYU Cougars',
        record: '8-2',
        nextGame: 'vs Utah State, Saturday 7:30 PM'
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Handle voting on a post
  const handleVote = async (postId, increment) => {
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ increment }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the post locally (WebSocket will handle the broadcast)
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, likes: data.likes } : post
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Navigate to the make post page
  const goToMakePost = () => {
    navigate('/make-post');
  };

  return (
    <main className="container mt-4">
      <h1 className="text-center mb-4">Campus Board</h1>

      {/* Toast notification for new posts */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">New Post</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {newPost ? `New post from ${newPost.authorEmail}: ${newPost.title}` : 'New post added!'}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="row">
        {/* Campus Info - will appear first on mobile */}
        <div className="col-md-4 order-md-2 order-first mb-4">
          <Card>
            <Card.Header>
              <h2 className="h5 mb-0">Campus Info</h2>
            </Card.Header>
            <Card.Body className="text-center">
              <img
                src="/byu.png"
                alt="BYU Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '200px' }}
              />
              <div id="footballStats" className="mt-3">
                <h3 className="h6">Football Stats</h3>
                {stats ? (
                  <div>
                    <p className="mb-1"><strong>{stats.team}</strong></p>
                    <p className="mb-1">Record: {stats.record}</p>
                    <p className="mb-0">Next Game: {stats.nextGame}</p>
                  </div>
                ) : (
                  <p className="text-muted">Loading stats...</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Posts - will appear second on mobile */}
        <div className="col-md-8 order-md-1 order-last">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Latest Posts</h2>
            <Button variant="primary" onClick={goToMakePost}>Create Post</Button>
          </div>

          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : posts.length === 0 ? (
            <div className="alert alert-info">No posts yet. Be the first to post!</div>
          ) : (
            <div className="post-list">
              {posts.map(post => (
                <Card key={post._id} className="mb-3">
                  <Card.Header className="d-flex justify-content-between">
                    <h5 className="mb-0">{post.title}</h5>
                    <small>{formatDate(post.date)}</small>
                  </Card.Header>
                  <Card.Body>
                    <Card.Text>{post.content}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="vote-buttons">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleVote(post._id, 1)}
                        >
                          👍 Upvote ({post.likes})
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleVote(post._id, -1)}
                          className="ms-2"
                        >
                          👎 Downvote
                        </Button>
                      </div>
                      <small>Posted by: {post.authorEmail.split('@')[0]}</small>
                    </div>
                  </Card.Body>
                  {post.comments && post.comments.length > 0 && (
                    <div className="list-group list-group-flush">
                      <div className="list-group-item bg-light">
                        <h6>Comments</h6>
                        {post.comments.map((comment, index) => (
                          <div key={comment.id || index} className="comment mb-2 pb-2 border-bottom">
                            <p className="mb-1">{comment.content}</p>
                            <div className="d-flex justify-content-between">
                              <small>By: {(comment.authorEmail || '').split('@')[0]}</small>
                              <small>{formatDate(comment.date)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Card.Footer className="bg-white">
                    <CommentSection postId={post._id} />
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}