exports.up = function (knex) {
  return knex.schema.createTable('comments', (commentsTable) => {
    commentsTable.increments('comment_id');
    commentsTable.text('body').notNullable();
    commentsTable.integer('votes').defaultTo(0).notNullable();
    commentsTable
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable();
    commentsTable
      .string('created_by')
      .references('users.username')
      .onDelete('CASCADE');
    commentsTable
      .integer('post_id')
      .references('posts.post_id')
      .onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('comments');
};
