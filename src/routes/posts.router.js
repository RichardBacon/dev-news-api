const express = require('express');
const { send405 } = require('../controllers/errors.controller');

const { getPosts } = require('../controllers/posts.controller');

const postsRouter = express.Router();

postsRouter.route('/').get(getPosts).all(send405);

module.exports = { postsRouter };
