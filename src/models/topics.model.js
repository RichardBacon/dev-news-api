const connection = require('../../db/connection');

const { selectUserByUsername } = require('./users.model');

const selectTopics = () => {
  return connection.select('*').from('topics');
};

const insertTopic = ({ title, description, username }) => {
  if (!title || !description || !username) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return selectUserByUsername({ username })
    .catch(() => {
      return Promise.reject({
        status: 422,
        msg: 'user not found',
      });
    })
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
    });
};

module.exports = {
  selectTopics,
  insertTopic,
};
