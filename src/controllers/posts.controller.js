const { selectPosts, countPosts } = require('../models/posts.model');

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

module.exports = {
  getPosts,
};
