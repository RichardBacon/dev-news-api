exports.up = function (knex) {
  return knex.schema.createTable('users', (usersTable) => {
    usersTable.string('username').primary();
    usersTable.string('first_name').notNullable();
    usersTable.string('last_name').notNullable();
    usersTable.string('email').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
