const express = require('express');
const { send405 } = require('../controllers/errors.controller');

const {
  getPosts,
  postPost,
  getPostById,
} = require('../controllers/posts.controller');

const postsRouter = express.Router();

postsRouter.route('/').get(getPosts).post(postPost).all(send405);

postsRouter
  .route('/:post_id')
  .get(getPostById)

  .all(send405);

module.exports = { postsRouter };
