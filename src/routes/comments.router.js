const express = require('express');
const { send405 } = require('../controllers/errors.controller');
const {
  patchCommentById,
  deleteCommentById,
} = require('../controllers/comments.controller');

const commentsRouter = express.Router();

commentsRouter
  .route('/:comment_id')
  .patch(patchCommentById)
  .delete(deleteCommentById)
  .all(send405);

module.exports = { commentsRouter };
