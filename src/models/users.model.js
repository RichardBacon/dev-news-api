const connection = require('../../db/connection');

const selectUsers = () => {
  return connection
    .select('username', 'first_name', 'last_name', 'email')
    .from('users');
};

const insertUser = ({ username, first_name, last_name, email }) => {
  if (!username || !first_name || !last_name || !email) {
    return Promise.reject({
      status: 400,
      msg: 'bad request',
    });
  }

  return connection
    .insert({
      username,
      first_name: first_name,
      last_name: last_name,
      email,
    })
    .into('users')
    .returning(['username', 'first_name', 'last_name', 'email'])
    .then((users) => {
      return users[0];
    });
};

module.exports = {
  selectUsers,
  insertUser,
};
