const { selectUsers, insertUser } = require('../models/users.model');

const getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

const postUser = (req, res, next) => {
  insertUser(req.body)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  postUser,
};
