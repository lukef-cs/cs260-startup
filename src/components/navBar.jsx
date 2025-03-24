import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  // Check authentication status on component mount and when auth state might change
  useEffect(() => {
    const checkAuth = async () => {
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
          setUserEmail('');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserEmail('');
      }
    };

    checkAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear any local storage items
        localStorage.removeItem('userEmail');

        // Update auth state
        setIsAuthenticated(false);
        setUserEmail('');

        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Campus Connect</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {/* Only show these links if authenticated */}
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/campus-board">Campus Board</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/make-post">Create Post</Link>
                </li>
              </>
            )}

          </ul>

          {/* Show user info and logout button when authenticated */}
          {isAuthenticated ? (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">
                <i className="bi bi-person-circle me-1"></i>
                {userEmail}
              </span>
              <button
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/" className="btn btn-outline-light">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}