const {
  selectPosts,
  countPosts,
  insertPost,
  selectPostById,
  updatePostById,
  delPostById,
} = require('../models/posts.model');

const { selectUserByUsername } = require('../models/users.model');

const { selectTopicByTitle } = require('../models/topics.model');

const getPosts = (req, res, next) => {
  const queries = [selectPosts(req.query), countPosts(req.query)];

  if (req.query.created_by) {
    queries.push(selectUserByUsername({ username: req.query.created_by }));
  }

  if (req.query.topic) {
    queries.push(selectTopicByTitle({ topic: req.query.topic }));
  }

  Promise.all(queries)
    .then(([posts, total_count]) => {
      res.status(200).send({ posts, ...total_count });
    })
    .catch(next);
};

const postPost = (req, res, next) => {
  insertPost(req.body)
    .then((post) => {
      res.status(201).send({ post });
    })
    .catch(next);
};

const getPostById = (req, res, next) => {
  selectPostById(req.params)
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch(next);
};

const patchPostById = (req, res, next) => {
  updatePostById(req.params, req.body)
    .then((post) => {
      res.status(200).send({ post });
    })
    .catch(next);
};

const deletePostById = (req, res, next) => {
  delPostById(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  getPosts,
  postPost,
  getPostById,
  patchPostById,
  deletePostById,
};
