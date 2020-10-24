const connection = require('../../db/connection');

const selectUsers = () => {
  return connection
    .select('username', 'first_name', 'last_name', 'email')
    .from('users');
};

module.exports = {
  selectUsers,
};
