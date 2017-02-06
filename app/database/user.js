var _ = require('lodash');

module.exports = (knex, lib) => {

    var table = require('./table')(knex);

    function prepareSave(user, is_new) {
        return _.assign({}, user);
    }
    
    function hydrate(resultObject) {
        var item = _.assign({}, resultObject);
        if (item.data.logo && item.data.logo.path) {
            item.data.logo.image_url = lib.media.getUrl(item.data.logo);
        }
        return item;
    }
    
    return {
        findById(id) {
            return knex('user').where({id}).first('*').then(user => {
                if (!user) {
                    return false;
                }
                return hydrate(user);
            });
        },
        findByRemember(user) {
            return knex('user').where({remember: user.remember, active: 1}).first('*').then(user => {
                if (user) {
                    return hydrate(user);
                }
                return false;
            });
        },
        findByAuth(user) {
            return knex('user').where({
                oauth_provider: user.oauth_provider,
                oauth_id: user.oauth_id
            }).first('*').then(res => {
                if (res) {
                    console.log("user found in findByAuth");
                    return _.assign(user, hydrate(res));
                } else {
                    console.log("user not found in findByAuth");
                    return user;
                }
            });
        },
        selectOptions(filter) {
            filter = _.defaults(filter, {active: 1});
            return knex('user').where(filter).orderBy('name', 'asc').select('id', 'name', 'email');
        },
        list(filter, page) {

            filter = _.defaults(filter, {search: '', active: '', order: '', limit: 20});
            var order = /^(name|email|company|user_group|active|updated_at|created_at)\s(asc|desc)$/.exec(filter.order) ||
                {1: 'name', 2: 'asc'};

            return table.list('user', filter, order, page, query => {
                if (_.isNumber(filter.active)) {
                    query.where('active', filter.active);
                } else if (filter.active !== 'all') {
                    query.where('active', true);
                }
                if (filter.user_group) {
                    query.where({user_group: filter.user_group});
                }
                if (filter.search) {
                    var search = `%${filter.search}%`.toLowerCase();
                    query.where(function() {
                        this.whereRaw('lower("name") like ?', search)
                            .orWhereRaw('lower("company") like ?', search)
                            .orWhereRaw('lower("email") like ?', search);
                    });
                }
                return query;
            }, hydrate);

        },
        save(item) {
            if (!item.id) {
                var now = new Date();
                item.created_at = now;
                item.updated_at = now;
                return table.create('user', item, prepareSave);
            } else {
                return table.save('user', item, prepareSave);
            }
        },
        saveBulk: (items) => table.saveBulk('user', items, prepareSave),
        delete: (item) => table.deleteBulk('user', item)
    };
};