const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// @route   GET /api/posts
// @desc    Get all posts (public feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'Text or image is required' });
    }

    const newPost = new Post({
      userId: req.user.userId,
      username: req.user.username,
      text: text || '',
      imageUrl: imageUrl || ''
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    if (post.likes.includes(req.user.username)) {
      // Unlike
      post.likes = post.likes.filter(username => username !== req.user.username);
    } else {
      // Like
      post.likes.push(req.user.username);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = {
      username: req.user.username,
      text: text
    };

    post.comments.push(comment);
    await post.save();

    res.json({ comments: post.comments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   DELETE /api/posts/:id
// @desc    Delete a post (only owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Check if logged-in user is the owner
    if (post.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;