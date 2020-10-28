const connection = require('../../db/connection');

const updateCommentById = ({ comment_id }, { inc_votes }) => {
  if (inc_votes && typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return connection('comments')
    .increment('votes', inc_votes || 0)
    .where('comment_id', comment_id)
    .returning('*')
    .then((comments) => {
      if (comments.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'comment not found',
        });
      }

      return comments[0];
    });
};

module.exports = {
  updateCommentById,
};
