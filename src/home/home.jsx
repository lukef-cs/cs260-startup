import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a simple user object
    const user = {
      email: email,
      authenticated: true,
      loginTime: new Date().toISOString()
    };

    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Clear form
    setEmail('');
    setPassword('');

    // Redirect to campus board (or wherever you want after login)
    navigate('/campus-board');
  };

  return (
    <main className='container-fluid bg-body text-center'>
      {/* <!-- Hero Section --> */}
      <div className="py-5">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="">
              <h1 className="display-4 fw-bold">Welcome to Campus Connect</h1>
              <p className="lead">Stay connected with your campus community. Share updates, events, and more!</p>
            </div>
            <div className="col-md-6 align-items-center justify-content-center">
              {/* <!-- Login Card --> */}
              <div className="card shadow">
                <div className="card-body p-4">
                  <h2 className="card-title h4 mb-4">Sign In</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Sign In</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Features Section --> */}
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card text-center p-3">
              <i className="bi bi-people-fill display-4 text-primary"></i>
              <h3 className="h5 mt-3">Connect with Peers</h3>
              <p className="text-muted">Join discussions and meet fellow students</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-3">
              <i className="bi bi-calendar-event display-4 text-primary"></i>
              <h3 className="h5 mt-3">Campus Events</h3>
              <p className="text-muted">Stay updated with latest campus activities</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-3">
              <i className="bi bi-chat-dots display-4 text-primary"></i>
              <h3 className="h5 mt-3">Share Updates</h3>
              <p className="text-muted">Post and interact with campus community</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}