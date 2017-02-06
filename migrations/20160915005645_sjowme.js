
exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.table('subscription', function (table) {
            table.decimal('price');
            table.renameColumn('active', 'payed');
            table.renameColumn('created_at', 'starts_at');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('subscription', function (table) {
            table.dropColumn('price');
        })
    ]);
};
