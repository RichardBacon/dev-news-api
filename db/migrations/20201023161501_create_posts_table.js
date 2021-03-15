exports.up = function (knex) {
  return knex.schema.createTable('posts', (postsTable) => {
    postsTable.increments('post_id');
    postsTable.string('title').notNullable();
    postsTable.text('body').notNullable();
    postsTable.integer('likes').defaultTo(0).notNullable();
    postsTable.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    postsTable
      .string('created_by')
      .references('users.username')
      .onDelete('CASCADE');
    postsTable.string('topic').references('topics.title').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('posts');
};
