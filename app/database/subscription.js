var _ = require('lodash');
var path = require('path');

module.exports = (knex, lib) => {

    var table = require('./table')(knex);

    function prepareSave(item, is_new) {
        return _.assign({}, item);
    }
    
    function hydrate(resultObject) {
        var now = new Date();
        return _.assign({
            valid: (resultObject.payed && (resultObject.starts_at < now && resultObject.expires_at > now))
        }, resultObject);
    }
    
    return {
        findById(id) {
            return knex('subscription').where({id}).first('*').then(subscription => {
                if (!subscription) {
                    return false;
                }
                return hydrate(subscription);
            });
        },
        findByTransaction(transaction_id) {
            return knex('subscription').where({transaction_id}).first('*').then(subscription => {
                if (!subscription) {
                    return false;
                }
                return hydrate(subscription);
            });
        },
        getValidSubscription(member_id) {
            var now = new Date();
            return knex('subscription')
                .where({owner: member_id, payed: true})
                .where('starts_at', '<', now)
                .where('expires_at', '>', now)
                .first().then(subscription => {
                    if (!subscription) {
                        return false;
                    }
                    return hydrate(subscription);
                });
        },
        getExpiringSubscriptions(check_start, check_end) {
            return knex('subscription')
                .leftJoin('user', 'subscription.owner', 'user.id')
                .where('payed', true)
                .where('subscription.expires_at', '>', check_start)
                .where('subscription.expires_at', '<', check_end)
                .select('subscription.*', 'user.name as user_name', 'user.email as user_email')
                .map(subscription => hydrate(subscription));
        },
        getLastSubscription(member_id) {
            return knex('subscription')
                .where('owner', member_id)
                .orderBy('starts_at', 'desc')
                .first().then(subscription => {
                    if (!subscription) {
                        return false;
                    }
                    return hydrate(subscription);
                });
        },
        findByOwner(member_id) {
            return knex('subscription')
                .leftJoin('user', 'subscription.owner', 'user.id')
                .where({owner: member_id})
                .orderBy('starts_at', 'desc')
                .select('subscription.*', 'user.name as user_name', 'user.email as user_email')
                .map(subscription => hydrate(subscription));
        },
        list(filter, page) {

            filter = _.defaults(filter, {search: '', owner: 0, order: '', limit: 20});
            var order = /^(name|starts_at|expires_at|payed|price|transaction_id)\s(asc|desc)$/.exec(filter.order) || {1: 'starts_at', 2: 'desc'};

            return table.list('subscription', filter, order, page, (query, isCount) => {
                query.leftJoin('user', 'subscription.owner', 'user.id');
                if (!isCount) {
                    query.columns('subscription.*', 'user.name as user_name', 'user.email as user_email');
                }
                if (filter.owner) {
                    query.where({owner: filter.owner});
                }
                if (filter.search) {
                    var search = `%${filter.search}%`.toLowerCase();
                    query.where(function () {
                        this.whereRaw('lower(subscription.name) like ?', search)
                            .orWhereRaw('lower(transaction_id) like ?', search);
                    });
                }
                return query;
            }, hydrate);
        },
        save(item) {
            if (!item.id) {
                return table.create('subscription', item, prepareSave);
            } else {
                return table.save('subscription', item, prepareSave);
            }
        },
        saveBulk: (items) => table.saveBulk('subscription', items, prepareSave),
        delete: (item) => table.deleteBulk('subscription', item)

    };
};