const {
  updateCommentById,
  delCommentById,
} = require('../models/comments.model');

const patchCommentById = (req, res, next) => {
  updateCommentById(req.params, req.body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

const deleteCommentById = (req, res, next) => {
  delCommentById(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  patchCommentById,
  deleteCommentById,
};
