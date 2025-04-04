const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');
const http = require('http');
const app = express();
const DB = require('./database.js');
const { setupWebSocketServer, sendToAll } = require('./webSocketServer.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.get('/auth/verify', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    console.log('Verifying auth with token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).send({ msg: 'Authentication required' });
    }

    const user = await DB.getUserByToken(token);

    if (user && user.token && user.token === token) {
      console.log('User authenticated:', user.email);
      res.send({ email: user.email });
    } else {
      console.log('Invalid token or token mismatch');
      res.status(401).send({ msg: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send({ msg: 'Authentication error' });
  }
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    user.token = null;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authenticated
const verifyAuth = async (req, res, next) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Get posts
apiRouter.get('/posts', verifyAuth, async (req, res) => {
  const posts = await DB.getPosts();
  res.send(posts);
});

// Get posts for a specific user
apiRouter.get('/posts/user/:email', verifyAuth, async (req, res) => {
  const posts = await DB.getUserPosts(req.params.email);
  res.send(posts);
});

// Create new post
apiRouter.post('/posts', verifyAuth, async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  const post = {
    authorEmail: user.email,
    date: new Date(),
    title: req.body.title,
    content: req.body.content,
    likes: 0,
    comments: []
  };

  const result = await DB.addPost(post);
  post._id = result.insertedId;

  // Notify all clients about the new post
  sendToAll({
    type: 'new-post',
    post: {
      ...post,
      authorEmail: user.email.split('@')[0] // Only send username part for privacy
    }
  });

  res.send(post);
});

// Add comment to a post
apiRouter.post('/posts/:id/comments', verifyAuth, async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  const comment = {
    id: uuid.v4(),
    authorEmail: user.email,
    content: req.body.content,
    date: new Date()
  };

  const post = await DB.addComment(req.params.id, comment);

  if (post) {
    // Notify all clients about the new comment
    sendToAll({
      type: 'new-comment',
      postId: req.params.id,
      comment: {
        ...comment,
        authorEmail: user.email.split('@')[0] // Only send username part for privacy
      }
    });

    res.send(comment);
  } else {
    res.status(404).send({ msg: 'Post not found' });
  }
});

// Update post votes/likes
apiRouter.put('/posts/:id/vote', verifyAuth, async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  const post = await DB.updateVote(req.params.id, req.body.increment);

  if (post) {
    // Notify all clients about the vote update
    sendToAll({
      type: 'vote-update',
      postId: req.params.id,
      likes: post.likes
    });

    res.send({ likes: post.likes });
  } else {
    res.status(404).send({ msg: 'Post not found' });
  }
});

// Delete post
apiRouter.delete('/posts/:id', verifyAuth, async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  // Implement authorization check if needed

  await DB.deletePost(req.params.id);

  // Notify all clients about the deleted post
  sendToAll({
    type: 'delete-post',
    postId: req.params.id
  });

  res.status(204).end();
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Create a new user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await DB.addUser(user);
  return user;
}

// Set the cookie with authentication token
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Create HTTP server and setup WebSockets
const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`Listening on port ${port} with WebSocket support`);
});