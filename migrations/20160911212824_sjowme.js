
exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTable('screen', function (table) {
            table.increments();
            table.string('name');
            table.boolean('active');
            table.integer('owner');
            table.integer('channel');
            table.timestamps();
            table.index('owner');
        }),

        knex.schema.createTable('user', function (table) {
            table.increments();
            table.string('name');
            table.string('email');
            table.string('company');
            table.string('image_url');
            table.string('oauth_provider');
            table.string('oauth_id');
            table.json('tokens');
            table.boolean('active');
            table.string('user_group');
            table.json('data');
            table.timestamps();
            table.string('remember');
            table.index(['oauth_provider', 'oauth_id']);
            table.index('remember');
        }),

        knex.schema.createTable('channel', function (table) {
            table.increments();
            table.string('name');
            table.json('content');
            table.json('config');
            table.timestamps();
            table.integer('owner');
            table.index('owner');
        }),

        knex.schema.createTable('media', function (table) {
            table.increments();
            table.string('name');
            table.string('collection');
            table.string('provider');
            table.string('type');
            table.string('path');
            table.json('tags');
            table.json('data');
            table.timestamps();
            table.integer('owner');
            table.index('owner');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('screen'),
        knex.schema.dropTable('user'),
        knex.schema.dropTable('channel'),
        knex.schema.dropTable('media')
    ]);
};
