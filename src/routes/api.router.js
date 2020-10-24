const express = require('express');
const { send405 } = require('../controllers/errors.controller');

const apiRouter = express.Router();

apiRouter.route('/').all(send405);

module.exports = { apiRouter };
