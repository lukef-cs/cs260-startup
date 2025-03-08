import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export function CampusBoard() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [newPost, setNewPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastPostCount, setLastPostCount] = useState(0); // Add this line to define lastPostCount
  const navigate = useNavigate();

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts', {
        credentials: 'include', // Important: Include cookies for auth
      });

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      // Process posts to format dates
      const formattedPosts = data.map(post => ({
        ...post,
        formattedDate: formatDate(post.date)
      }));

      setPosts(formattedPosts);
      setError('');
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();

    // Fetch BYU football stats
    fetch('https://apinext.collegefootballdata.com/games/teams?year=2024&team=BYU&id=401677099', {
      headers: {
        "Authorization": "Bearer ffySbi+tmhEB5ZOijyaApsJ2pHnYewJ8jIExKuAzhH4seUfQsTVqrYinujMNO3dG"
      }
    }).then(response => response.json())
      .then(data => {
        const BYU = data[0].teams[0];
        const away = data[0].teams[1];
        const stats = {
          awayName: away.team,
          awayScore: away.points,
          homeName: BYU.team,
          homeScore: BYU.points,
        };
        setStats(stats);
      })
      .catch(error => console.error('Error fetching football stats:', error));

    // Set up polling for new posts (every 30 seconds)
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  // WebSocket simulation effect
  useEffect(() => {
    // Setup WebSocket simulation
    const websocketSimulation = setInterval(() => {
        // Simulate receiving a new post from the server
        const newPost = {
            id: Date.now(),
            title: 'New Campus Event',
            content: 'Join us for a fun event this Friday at the stadium!',
            date: new Date(),
            formattedDate: 'Just now'
        };

        // Update state with new post
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowToast(true);
        setNewPost(newPost);

        // Update last post count
        setLastPostCount(prevCount => prevCount + 1);
    }, 60000); // Changed to every minute instead of 10 seconds for less frequent simulation

    // Clean up on unmount
    return () => clearInterval(websocketSimulation);
  }, [lastPostCount]);


  // Handle when new posts are detected
  useEffect(() => {
    if (posts.length > 0 && newPost === null) {
      // Initialize newPost with the first fetch
      setNewPost(null);
    } else if (posts.length > 0 && newPost !== null && posts[0].id !== newPost.id) {
      // If we have a new post at the top of the list
      setNewPost(posts[0]);
      setShowToast(true);
    }
  }, [posts, newPost]);

  return (
    <main className='container-fluid bg-body text-center'>
      {/* Real-time notification toast */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 11 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg="white"
        >
          <Toast.Header closeButton>
            <strong className="me-auto">New Campus Post</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body className="text-dark">
            {newPost && (
              <>
                <div><strong>{newPost.title}</strong></div>
                <div className="small">
                  <em>{newPost.content}</em>
                </div>
              </>
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <h1 className="text-center mb-4">Campus Board</h1>

      <div className="row w-100 justify-content-center mb-4 mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Latest Posts</h2>
              <span className="badge bg-primary rounded-pill">{posts.length} posts</span>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="list-group">
                {loading ? (
                  <p className="text-center text-muted">Loading posts...</p>
                ) : posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{post.title}</h5>
                        <small>{post.formattedDate || formatDate(post.date)}</small>
                      </div>
                      <p className="mb-1">{post.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted">No posts yet. Be the first to post!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h2 className="h5 mb-0">Campus Info</h2>
            </div>
            <div className="card-body text-center">
              <img
                src="/byu.png"
                alt="BYU Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '150px' }}
              />
              <div id="footballStats" className="mt-3">
                <h3 className="h6">Most Recent Game</h3>
                {stats ? (
                  <div className="mt-3">
                    <p className="mb-1"><strong>{stats.homeName} {stats.homeScore} - {stats.awayScore} {stats.awayName}</strong></p>
                  </div>
                ) : (
                  <p className="text-muted">Loading stats...</p>
                )}
              </div>

              <div className="mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/make-post')}
                >
                  Create New Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}