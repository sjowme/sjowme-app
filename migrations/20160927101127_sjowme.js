
exports.up = function (knex, Promise) {
    var default_channel = require('../app/database/defaults').channel;
    return Promise.all([
        knex.schema.table('channel', function (table) {
            table.json('previews');
        }),
        knex('channel').update({previews: default_channel.previews})
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('channel', function (table) {
            table.dropColumn('previews');
        })
    ]);
};
