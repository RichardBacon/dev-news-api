const connection = require('../../db/connection');

const selectPosts = ({
  sort_by = 'created_at',
  order = 'desc',
  limit = 10,
  page = 1,
  created_by,
  topic,
}) => {
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
    .select(
      'posts.post_id',
      'posts.title',
      'posts.votes',
      'posts.created_at',
      'posts.created_by',
      'posts.topic'
    )
    .count('comments.comment_id AS comment_count')
    .from('posts')
    .leftJoin('comments', 'posts.post_id', 'comments.post_id')
    .modify((query) => {
      if (created_by) query.where('posts.created_by', created_by);
      if (topic) query.where('posts.topic', topic);
    })
    .groupBy('posts.post_id')
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(page * limit - limit)
    .then((posts) => {
      if (posts.length === 0 && !created_by && !topic) {
        return Promise.reject({
          status: 404,
          msg: 'no posts found',
        });
      }

      return posts;
    });
};

const countPosts = ({ created_by, topic }) => {
  return connection
    .count('post_id AS total_count')
    .from('posts')
    .modify((query) => {
      if (created_by) query.where('posts.created_by', created_by);
      if (topic) query.where('posts.topic', topic);
    })
    .then((rows) => {
      return rows[0];
    });
};

module.exports = {
  selectPosts,
  countPosts,
};
