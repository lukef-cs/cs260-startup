import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './home/home';
import { MakePost } from './make-post/makePost';
import { CampusBoard } from './campus-board/campusBoard';

export default function App() {
return (
    <BrowserRouter>
            <div className="d-flex flex-column vh-100">
                    <header className="bg-primary text-white p-3">
                    <div className="container">
                            <h1>Campus Connect<sup>&reg;</sup></h1>
                            <nav className="navbar navbar-expand-lg navbar-dark">
                            <div className="container-fluid">
                                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                                    <span className="navbar-toggler-icon"></span>
                                    </button>
                                    <div className="collapse navbar-collapse" id="navbarNav">
                                    <ul className="navbar-nav">
                                            <li className="nav-item"><NavLink className="nav-link" to=''>Home</NavLink></li>
                                            <li className="nav-item"><NavLink className="nav-link" to='campus-board'>Campus Board</NavLink></li>
                                            <li className="nav-item"><NavLink className="nav-link" to='make-post'>Make Post</NavLink></li>
                                    </ul>
                                    </div>
                            </div>
                            </nav>
                    </div>
                    </header>

                    <Routes>
                            <Route path='/' element={<Home />} />
                            <Route path='/campus-board' element={<CampusBoard />} />
                            <Route path='/make-post' element={<MakePost />} />
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
)
}

function NotFound() {
    return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
  }