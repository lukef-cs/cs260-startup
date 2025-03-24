import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserEmail(data.email);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        // Login logic - call the login API endpoint
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // Add this to ensure cookies are sent
        });
      } else {
        // Sign up logic - call the create account API endpoint
        response = await fetch('/api/auth/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
          credentials: 'include', // Add this to ensure cookies are sent
        });
      }

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.msg || 'Authentication failed');
      }

      const user = await response.json();

      // We no longer need to store in localStorage since we're using cookies
      // But we'll keep the email for UI purposes
      localStorage.setItem('userEmail', user.email);

      // Update authentication state
      setIsAuthenticated(true);
      setUserEmail(user.email);

      // Clear form
      setEmail('');
      setPassword('');
      setName('');

      // Redirect to campus board
      navigate('/campus-board');
    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear fields and errors when switching modes
    setEmail('');
    setPassword('');
    setName('');
    setErrorMessage('');
  };

  const handleStartExploring = () => {
    navigate('/campus-board');
  };

  // Loading state while checking authentication
  if (checkingAuth) {
    return (
      <main className='container-fluid bg-body text-center'>
        <div className="py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
          <div>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Checking authentication status...</p>
          </div>
        </div>
      </main>
    );
  }

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

            {isAuthenticated ? (
              // Show welcome message when logged in
              <div className="col-md-6 align-items-center justify-content-center">
                <div className="card shadow">
                  <div className="card-body p-4 text-center">
                    <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
                    <h2 className="card-title h4 mb-3">Welcome Back, {userEmail}!</h2>
                    <p>You're already signed in. Start exploring campus updates and events.</p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleStartExploring}
                    >
                      Go to Campus Board
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Show login form when not logged in
              <div className="col-md-6 align-items-center justify-content-center">
                {/* <!-- Auth Card --> */}
                <div className="card shadow">
                  <div className="card-body p-4">
                    <h2 className="card-title h4 mb-4">{isLogin ? 'Sign In' : 'Sign Up'}</h2>

                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {!isLogin && (
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                      )}
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
                      <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {isLogin ? 'Signing In...' : 'Creating Account...'}
                          </>
                        ) : (
                          isLogin ? 'Sign In' : 'Create Account'
                        )}
                      </button>
                      <div className="text-center mt-3">
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={toggleAuthMode}
                        >
                          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

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