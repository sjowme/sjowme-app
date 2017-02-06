
exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('invoice', function (table) {
            table.increments();
            table.integer('user_id');
            table.string('number');
            table.string('reference');
            table.decimal('vat_perc');
            table.decimal('net_price');
            table.decimal('vat_amount');
            table.decimal('total_price');
            table.string('transaction_id');
            table.json('address');
            table.json('transaction');
            table.json('data');
            table.timestamps();
            table.index('user_id');
            table.index('number');
            table.index('transaction_id');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('invoice'),
    ]);
};
