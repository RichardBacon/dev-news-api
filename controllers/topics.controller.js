const {
  selectTopics,
  insertTopic,
  delTopicByTitle,
} = require('../models/topics.model');

const getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

const postTopic = (req, res, next) => {
  insertTopic(req.body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

const deleteTopicByTitle = (req, res, next) => {
  delTopicByTitle(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  getTopics,
  postTopic,
  deleteTopicByTitle,
};
