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

const delCommentById = ({ comment_id }) => {
  return connection('comments')
    .del()
    .where('comment_id', comment_id)
    .then((deletionCount) => {
      if (deletionCount === 0) {
        return Promise.reject({ status: 404, msg: 'comment not found' });
      }
    });
};

const selectCommentsByPostId = (
  { post_id },
  { sort_by = 'created_at', order = 'desc', limit = 10, page = 1 }
) => {
  if (
    (order !== 'asc' && order !== 'desc') ||
    !/^[1-9]\d*$/.test(limit) ||
    !/^[1-9]\d*$/.test(page)
  ) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return connection
    .select('*')
    .from('comments')
    .where('post_id', post_id)
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(page * limit - limit)
    .then((comments) => {
      if (comments.length === 0) {
        return connection
          .select('post_id')
          .from('posts')
          .where('post_id', post_id)
          .then((posts) => {
            if (posts.length === 0) {
              return Promise.reject({
                status: 404,
                msg: 'no comments found',
              });
            }

            return [];
          });
      }

      return comments;
    });
};

const countComments = ({ post_id }) => {
  return connection
    .count('comment_id AS total_count')
    .from('comments')
    .modify((query) => {
      if (post_id) query.where('post_id', post_id);
    })
    .then((rows) => {
      return rows[0];
    });
};

module.exports = {
  updateCommentById,
  delCommentById,
  selectCommentsByPostId,
  countComments,
};
