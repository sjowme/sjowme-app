
exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTable('subscription', function (table) {
            table.increments();
            table.boolean('active');
            table.string('name');
            table.dateTime('created_at');
            table.dateTime('expires_at');
            table.string('transaction_id');
            table.json('data');
            table.integer('owner');
            table.index('owner');
        }),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('subscription'),
    ]);
};
