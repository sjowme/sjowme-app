var _ = require('lodash');

module.exports = (knex, lib) => {

    var table = require('./table')(knex);

    function prepareSave(screen, is_new) {
        return _.assign({}, screen);
    }

    function hydrate(resultObject) {
        return resultObject;
    }

    return {
        findOrCreate(id) {
            return knex('screen').where({id}).first('*').then(screen => {
                var now = new Date();
                if (!screen) {
                    return table.create('screen', {
                        created_at: now,
                        updated_at: now,
                        active: false,
                        owner: 0,
                        channel: 0
                    }, prepareSave);
                }
                screen.updated_at = now;
                return table.save('screen', screen, prepareSave);
            });
        },
        findUnClaimed(id) {
            return knex('screen').where({id: id,  owner: 0}).first('*').then(screen => {
                if (screen) {
                    return hydrate(screen);
                }
                return false;
            });
        },
        findByOwner(member_id) {
            return knex('screen').where({owner: member_id}).select('*').map(channel => hydrate(channel));
        },
        findByChannel(channel_id) {
            return knex('screen').where({channel: channel_id}).select('*').map(channel => hydrate(channel));
        },
        save(item) {
            var now = new Date();
            if (!item.id) {
                item.created_at = now;
                item.updated_at = now;
                return table.create('screen', item, prepareSave);
            } else {
                item.updated_at = now;
                return table.save('screen', item, prepareSave);
            }
        },
        delete: (item) => table.deleteBulk('screen', item)

    };
};