const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');
const cors = require('cors');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

app.use(cors({
  origin: true, // Allow requests from any origin during development
  credentials: true // Important for cookies
}));

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

// Verify if user is authenticated
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
  try {
    const token = req.cookies[authCookieName];
    console.log('Logout attempt with token:', token);

    if (token) {
      const user = await DB.getUserByToken(token);
      if (user) {
        console.log('Logging out user:', user.email);
        // Actually remove the token completely or set to null
        user.token = null;
        await DB.updateUser(user);
      }
    }

    // Clear cookie with matching parameters to how it was set
    res.clearCookie(authCookieName, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      path: '/'
    });

    console.log('Cookie cleared');
    res.status(204).end();
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send({ msg: 'Logout failed' });
  }
});

// Middleware to verify that the user is authenticated
// Middleware to verify that the user is authenticated
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies[authCookieName];
    console.log('Verifying auth with token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).send({ msg: 'Authentication required' });
    }

    const user = await DB.getUserByToken(token);

    // Make sure user exists AND the token is not null
    if (user && user.token && user.token === token) {
      console.log('User authenticated:', user.email);
      req.user = user;
      next();
    } else {
      console.log('Invalid token or token mismatch');
      // Clear the invalid cookie
      res.clearCookie(authCookieName, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });
      res.status(401).send({ msg: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).send({ msg: 'Authentication error' });
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

  await DB.addPost(post);
  res.send(post);
});

// Delete post
apiRouter.delete('/posts/:id', verifyAuth, async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  // Implement authorization check if needed

  await DB.deletePost(req.params.id);
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
    secure: false, // Set to false for local development
    httpOnly: true,
    sameSite: 'lax', // Use lax for development
    maxAge: 3600000, // 1 hour expiration
    path: '/'
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});