const express = require('express');
const { send405 } = require('../controllers/errors.controller');

const { getPosts, postPost } = require('../controllers/posts.controller');

const postsRouter = express.Router();

postsRouter.route('/').get(getPosts).post(postPost).all(send405);

module.exports = { postsRouter };
