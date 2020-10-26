const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const { usersRouter } = require('./users.router');
const { topicsRouter } = require('./topics.router');

const apiRouter = express.Router();

apiRouter.route('/').all(send405);

apiRouter.use('/users', usersRouter);
apiRouter.use('/topics', topicsRouter);

module.exports = { apiRouter };
