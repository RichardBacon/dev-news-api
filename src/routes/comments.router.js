const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const { patchCommentById } = require('../controllers/comments.controller');

const commentsRouter = express.Router();

commentsRouter.route('/:comment_id').patch(patchCommentById).all(send405);

module.exports = { commentsRouter };
