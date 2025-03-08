import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function getPosts() {
  // Simulate fetching posts from a database
  return [
    { id: 1, title: 'Free Pizza in the Wilk', content: 'Come get free pizza', date: '3 days ago' },
    { id: 2, title: 'Study Group for CS 260', content: 'Strength in numbers', date: '1 day ago' },
    { id: 3, title: 'Lost Keys', content: 'Plz help me', date: '5 hours ago' },
    { id: 4, title: 'Basketball Tickets', content: 'Lmk if you can get me front row of the baskeball game', date: '2 days ago' }
  ];
}

function getFootballStats() {
  // Simulate fetching football stats from an API
  return {
    wins: 11,
    losses: 2,
    nextGame: 'vs. Utah State',
    gameDate: 'Nov 25, 2025',
    ranking: '#12'
  };
}

export function CampusBoard() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [newPost, setNewPost] = useState(null);
  const [lastPostCount, setLastPostCount] = useState(0);

  React.useEffect(() => {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data => {
        setPosts(data);
        setLastPostCount(data.length);
      })
      .catch(error => console.error('Error fetching posts:', error));
  }, []);

  React.useEffect(() => {
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

  }, []);


  // Simulate data fetching when component mounts
  useEffect(() => {

    // Setup WebSocket simulation
    const websocketSimulation = setInterval(() => {
        // Simulate receiving a new post from the server
        const newPost = {
            id: Date.now(),
            title: 'New Campus Event',
            content: 'Join us for a fun event this Friday at the stadium!',
            date: 'Just now'
        };

        // Update state with new post
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowToast(true);
        setNewPost(newPost);

        // Update localStorage
        // localStorage.setItem('campusPosts', JSON.stringify([newPost, ...posts]));

        // Update last post count
        setLastPostCount(prevPosts => prevPosts + 1);
    }, 10000); // Check every 3 seconds

    // Clean up on unmount
    return () => clearInterval(websocketSimulation);
  }, [lastPostCount]);

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
          text="white"
        >
          <Toast.Header closeButton>
            <strong className="me-auto">New Campus Post</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>
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

      <div className="row w-100 justify-content-center mb-4" style={{ maxWidth: '1200px' }}>
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Latest Posts</h2>
              <span className="badge bg-primary rounded-pill">{posts.length} posts</span>
            </div>

            <div className="card-body">
              <div className="list-group">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <a key={post.id} href="#" className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{post.title}</h5>
                        <small>{post.date}</small>
                      </div>
                      <p className="mb-1">{post.content}</p>
                    </a>
                  ))
                ) : (
                  <p className="text-center text-muted">Loading posts...</p>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}