const connection = require('../../db/connection');

const selectTopics = () => {
  return connection.select('*').from('topics');
};

module.exports = {
  selectTopics,
};
