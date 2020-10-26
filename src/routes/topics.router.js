const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const { getTopics } = require('../controllers/topics.controller');

const topicsRouter = express.Router();

topicsRouter.route('/').get(getTopics).all(send405);

module.exports = { topicsRouter };
