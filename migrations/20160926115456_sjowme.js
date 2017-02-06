
exports.up = function (knex, Promise) {

    return Promise.all([
        knex.schema.table('channel', function (table) {
            table.string('category');
            table.index('category');
        }),
        knex('config').insert({
            name: 'categories',
            data: {categories: [{name: 'algemeen', label: 'Algemeen'}]}
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('channel', function (table) {
            table.dropIndex('category');
            table.dropColumn('category');
        })
    ]);
};
