
exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTable('config', function (table) {
            table.increments();
            table.string('name');
            table.json('data');
            table.unique('name');
            table.index('name');
        }).then(res => knex('config').insert({
            name: 'collections',
            data: {collections: [{name: 'algemeen', label: 'Algemeen'}]}
        })),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('config'),
    ]);
};
