const {
  updateCommentById,
  delCommentById,
  selectCommentsByPostId,
  insertCommentByPostId,
  countComments,
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

const getCommentsByPostId = (req, res, next) => {
  const queries = [
    selectCommentsByPostId(req.params, req.query),
    countComments(req.params),
  ];

  Promise.all(queries)
    .then(([comments, total_count]) => {
      res.status(200).send({ comments, ...total_count });
    })
    .catch(next);
};

const postCommentByPostId = (req, res, next) => {
  insertCommentByPostId(req.params, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

module.exports = {
  patchCommentById,
  deleteCommentById,
  getCommentsByPostId,
  postCommentByPostId,
};
