const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const { usersRouter } = require('./users.router');
const { topicsRouter } = require('./topics.router');
const { postsRouter } = require('./posts.router');
const { commentsRouter } = require('./comments.router');
const endpoints = require('../endpoints.json');

const apiRouter = express.Router();

apiRouter
  .route('/')
  .get((req, res, next) => {
    res.status(200).send(endpoints);
  })
  .all(send405);

apiRouter.use('/users', usersRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/comments', commentsRouter);

module.exports = { apiRouter };
