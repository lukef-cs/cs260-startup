const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');
const app = express();

const authCookieName = 'token';

// The scores and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let posts = [];

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Add this after your other auth endpoints but before the posts endpoints

// Verify if a user is authenticated
apiRouter.get('/auth/verify', async (req, res) => {
    try {
      const token = req.cookies[authCookieName];
      if (!token) {
        return res.status(401).json({ authenticated: false, msg: 'No token provided' });
      }

      const user = await findUser('token', token);
      if (!user) {
        return res.status(401).json({ authenticated: false, msg: 'Invalid token' });
      }

      // User is authenticated
      return res.status(200).json({
        authenticated: true,
        email: user.email
      });
    } catch (error) {
      console.error('Auth verification error:', error);
      return res.status(500).json({ authenticated: false, msg: 'Server error' });
    }
  });

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};


apiRouter.get('/posts', verifyAuth, async (req, res) => {
  res.send(posts);
});

apiRouter.post('/posts', verifyAuth, async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    const post = {
        id: uuid.v4(),
        userId: user.id,
        title: req.body.title,
        content: req.body.content,
        date: new Date()
    };
    posts.push(post);
    res.send(posts);
    }
);

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: uuid.v4(),
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Serve up the front-end static content hosting
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANT: This "catch-all" route MUST come after your API routes
app.get('*', function(req, res) {
  // Make sure to use the absolute path to index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});