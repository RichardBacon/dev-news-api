exports.up = function (knex) {
  return knex.schema.createTable('topics', (topicsTable) => {
    topicsTable.string('title').primary();
    topicsTable.string('description').notNullable();
    topicsTable.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    topicsTable
      .string('created_by')
      .references('users.username')
      .onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('topics');
};
