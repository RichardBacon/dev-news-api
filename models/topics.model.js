const connection = require('../db/connection');

const { selectUserByUsername } = require('./users.model');

const selectTopics = () => {
  return connection.select('*').from('topics');
};

const selectTopicByTitle = ({ topic }) => {
  return connection
    .select('*')
    .from('topics')
    .where('title', topic)
    .then((topics) => {
      if (topics.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'topic not found',
        });
      }

      return topics[0];
    });
};

const insertTopic = ({ title, description, username }) => {
  if (!title || !description || !username) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return selectUserByUsername({ username })
    .then(() => {
      return connection
        .insert({
          title,
          description,
          created_by: username,
        })
        .into('topics')
        .returning('*');
    })
    .then((topics) => {
      return topics[0];
    })
    .catch(() => {
      return Promise.reject({
        status: 422,
        msg: 'user not found',
      });
    });
};

module.exports = {
  selectTopics,
  selectTopicByTitle,
  insertTopic,
};
