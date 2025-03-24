import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/navBar';
import { Home } from './home/home';
import { CampusBoard } from './campus-board/campusBoard';
import { MakePost } from './make-post/makePost';
import { ProtectedRoute } from './components/protectedRoute';

export default function App() {
  return (
    <BrowserRouter>
        <div className="d-flex flex-column vh-100">
        <NavBar />
        <Routes>
                <Route path="/" element={<Home />} />

                {/* Protected routes */}
                <Route
                path="/campus-board"
                element={
                <ProtectedRoute>
                <CampusBoard />
                </ProtectedRoute>
                }
                />
                <Route
                path="/make-post"
                element={
                <ProtectedRoute>
                <MakePost />
                </ProtectedRoute>
                }
                />
        </Routes>
        <footer className="bg-light py-3 mt-auto">
                        <div className="container text-center">
                        <span className="text-muted">Luke Fairbanks</span>
                        <br />
                        <a href="https://github.com/lukef-cs/cs260-startup">GitHub</a>
                        </div>
                </footer>
        </div>
    </BrowserRouter>
  );
}
