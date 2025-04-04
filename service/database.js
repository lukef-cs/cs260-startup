const { MongoClient, ObjectId } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('campusconnect');
const userCollection = db.collection('user');
const postsCollection = db.collection('posts');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connected to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// User related functions
function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

// Posts related functions
async function addPost(post) {
  return postsCollection.insertOne(post);
}

async function getPosts(limit = 50) {
  const query = {};
  const options = {
    sort: { date: -1 },
    limit: limit,
  };
  const cursor = postsCollection.find(query, options);
  return cursor.toArray();
}

async function getUserPosts(email, limit = 20) {
  const query = { authorEmail: email };
  const options = {
    sort: { date: -1 },
    limit: limit,
  };
  const cursor = postsCollection.find(query, options);
  return cursor.toArray();
}

// Add a comment to a post
async function addComment(postId, comment) {
  try {
    const result = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

// Update votes (likes) for a post
async function updateVote(postId, increment) {
  try {
    const result = await postsCollection.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $inc: { likes: increment } },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error('Error updating votes:', error);
    return null;
  }
}

async function deletePost(postId) {
  try {
    return postsCollection.deleteOne({ _id: new ObjectId(postId) });
  } catch (error) {
    console.error('Error deleting post:', error);
    return null;
  }
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addPost,
  getPosts,
  getUserPosts,
  deletePost,
  addComment,
  updateVote
};