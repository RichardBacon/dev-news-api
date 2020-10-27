const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const { getTopics, postTopic } = require('../controllers/topics.controller');

const topicsRouter = express.Router();

topicsRouter.route('/').get(getTopics).post(postTopic).all(send405);

module.exports = { topicsRouter };
