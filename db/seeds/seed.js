const {
  userData,
  topicData,
  postData,
  commentData,
} = require('../data/index.js');

const { formatDates } = require('../utils/utils');

exports.seed = function (knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      return knex('users').insert(userData);
    })
    .then(() => {
      return knex('topics').insert(formatDates(topicData, 'created_at'));
    })
    .then(() => {
      return knex('posts').insert(formatDates(postData, 'created_at'));
    })
    .then(() => {
      return knex('comments').insert(formatDates(commentData, 'created_at'));
    })
    .catch((err) => {
      console.log(err);
    });
};
