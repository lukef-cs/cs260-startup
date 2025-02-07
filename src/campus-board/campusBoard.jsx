import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


export function CampusBoard() {
  return (
    <main className='container-fluid bg-body text-center'>
       <h1 className="text-center mb-4">Campus Board</h1>

        <div className="row w-100 justify-content-center mb-4"

        style={{ maxWidth: '1200px' }}>
        <div className="col-md-8">
            <div className="card mb-4">
            <div className="card-header">
                <h2 className="h5 mb-0">Latest Posts</h2>
            </div>
            <div className="card-body">
                {/* <!-- Database data placeholder --> */}
                <div className="list-group">
                <a href="#" className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">Post Title</h5>
                    <small>3 days ago</small>
                    </div>
                    <p className="mb-1">Post content preview...</p>
                </a>
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
                src="public/byu.png"
                alt="BYU Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '150px' }}
                />
                <div id="footballStats" className="mt-3">
                <h3 className="h6">Football Stats</h3>
                <p className="text-muted">API data will appear here</p>
                </div>
            </div>
            </div>
        </div>
        </div>
    </main>
  );
}