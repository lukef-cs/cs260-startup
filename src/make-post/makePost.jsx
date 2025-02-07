import React from 'react';

export function MakePost() {
  return (
    <main className='container-fluid bg-body text-center'>
      <div className="row justify-content-center w-100">
        <div className="w-50 max-w-500"
        style={{ maxWidth: '500px' }}
        >
          <h1 className="text-center mb-4">Make a Post</h1>
          <div className="card">
            <div className="card-body">
              <form method="get" action="campus-board.html">
                <div className="mb-3">
                  <label for="postTitle" className="form-label">
                    <i className="bi bi-pencil"></i> Title
                  </label>
                  <input type="text" className="form-control" id="postTitle" placeholder="Enter your post title" required />
                </div>
                <div className="mb-3">
                  <label for="postDescription" className="form-label">
                    <i className="bi bi-file-text"></i> Description
                  </label>
                  <textarea
                    className="form-control"
                    id="postDescription"
                    rows="5"
                    placeholder="Write your post content here..."
                    required
                  ></textarea>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Create Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}