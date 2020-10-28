const connection = require('../../db/connection');

const { selectTopicByTitle } = require('./topics.model');
const { selectUserByUsername } = require('./users.model');

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

const insertPost = ({ username, title, body, topic }) => {
  if (!username || !title || !body || !topic) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return selectTopicByTitle({ topic })
    .then(() => {
      return selectUserByUsername({ username });
    })
    .then(() => {
      return connection
        .insert({
          title,
          body,
          created_by: username,
          topic,
        })
        .into('posts')
        .returning(['*']);
    })
    .then((posts) => {
      return posts[0];
    })
    .catch((err) => {
      return Promise.reject({
        status: 422,
        msg: err.msg,
      });
    });
};

const selectPostById = ({ post_id }) => {
  return connection
    .select(
      'posts.post_id',
      'posts.title',
      'posts.body',
      'posts.votes',
      'posts.created_by',
      'posts.created_at',
      'posts.topic'
    )
    .count('comments.comment_id AS comment_count')
    .from('posts')
    .leftJoin('comments', 'posts.post_id', 'comments.post_id')
    .where('posts.post_id', post_id)
    .groupBy('posts.post_id')
    .then((posts) => {
      if (posts.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'post not found',
        });
      }

      return posts[0];
    });
};

const updatePostById = ({ post_id }, { inc_votes }) => {
  if (inc_votes && typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return connection('posts')
    .increment('votes', inc_votes || 0)
    .where('post_id', post_id)
    .returning(['*'])
    .then((posts) => {
      if (posts.length === 0) {
        return Promise.reject({
          status: 404,
          msg: 'post not found',
        });
      }

      return posts[0];
    });
};

const delPostById = ({ post_id }) => {
  return connection('posts')
    .del()
    .where('post_id', post_id)
    .then((deletionCount) => {
      if (deletionCount === 0) {
        return Promise.reject({ status: 404, msg: 'post not found' });
      }
    });
};

module.exports = {
  selectPosts,
  countPosts,
  insertPost,
  selectPostById,
  updatePostById,
  delPostById,
};
