const { updateCommentById } = require('../models/comments.model');

const patchCommentById = (req, res, next) => {
  updateCommentById(req.params, req.body)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

module.exports = {
  patchCommentById,
};
