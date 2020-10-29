const {
  selectUsers,
  insertUser,
  selectUserByUsername,
  delUserByUsername,
} = require('../models/users.model');

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

const getUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

const deleteUserByUsername = (req, res, next) => {
  delUserByUsername(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  getUsers,
  postUser,
  getUserByUsername,
  deleteUserByUsername,
};
