var _ = require('lodash');
var path = require('path');

module.exports = (knex, lib) => {

    var table = require('./table')(knex);
    var default_tag = require('../database/defaults').tag;
    var tags_cache = {};

    function prepareSave(item, is_new) {
        var copy = _.assign({}, item);
        if (item.hasOwnProperty('tags')) {
            //set json array
            copy.tags = JSON.stringify(copy.tags || []);
            //break cache
            delete tags_cache[item.owner];
            if (item.collection !== '') {
                delete tags_cache.all;
            }
        }
        return copy;
    }

    function hydrate(resultObject) {
        var item = _.assign({}, resultObject);
        item.image_url = lib.media.getUrl(item);
        item.file = {
            name: path.basename(item.image_url)
        };
        return item;
    }

    function hydrateTags(results) {
        var tags = [], index = {};
        results.forEach(result => {
            result.tags.forEach(tag => {
                if (index[tag] === undefined) {
                    index[tag] = [result.id];
                    tags.push(_.defaults({name: tag}, default_tag));
                } else {
                    index[tag].push(result.id);
                }
            });
        });
        tags.forEach(tag => tag.count = index[tag.name].length);
        tags = _.orderBy(tags, 'name');
        return {tags, index};
    }

    return {
        findById(id) {
            return knex('media')
                .leftJoin('user', 'media.owner', 'user.id')
                .where('media.id', id)
                .first('media.*', 'user.name as user_name')
                .then(media => {
                    if (!media) {
                        return false;
                    }
                    return hydrate(media);
                });
        },
        allTags(target) {
            return new Promise((resolve) => {

                if (tags_cache[target]) {
                    return resolve(tags_cache[target]);
                }

                var query = knex('media');
                if (target === 'all') {
                    query.whereNot('collection', '');
                } else if (target === 'user') {
                    query.where('owner', target);
                } else {
                    query.where('collection', target);
                }
                query.select('id', 'tags').then(results => {
                    tags_cache[target] = hydrateTags(results);
                    resolve(tags_cache[target]);
                });

            });
        },
        list(filter, page) {

            filter = _.defaults(filter, {search: '', collection: '', owner: 0, order: '', ids: [], limit: 10});
            var order = /^(name|collection|type|provider)\s(asc|desc)$/.exec(filter.order) || {1: 'name', 2: 'asc'};

            return table.list('media', filter, order, page, (query, isCount) => {
                query.leftJoin('user', 'media.owner', 'user.id');
                if (!isCount) {
                    query.columns('media.*', 'user.name as user_name');
                }
                if (filter.owner) {
                    filter.collection = '';
                    query.where({owner: filter.owner, collection: ''});
                }
                if (filter.type) {
                    query.where({type: filter.type});
                }
                if (filter.collection) {
                    query.where({collection: filter.collection});
                }
                if (filter.ids.length) {
                    query.whereIn('media.id', filter.ids);
                }
                if (filter.search) {
                    var search = `%${filter.search}%`.toLowerCase();
                    query.where(function () {
                        this.whereRaw('lower(media.name) like ?', search);
                    });
                }
                return query;
            }, hydrate);
        },
        save(item) {
            if (!item.id) {
                return table.create('media', item, prepareSave);
            } else {
                return table.save('media', item, prepareSave);
            }
        },
        saveBulk: (items) => table.saveBulk('media', items, prepareSave),
        delete: (item, member_id) => {
            //break cache
            if (member_id) {
                delete tags_cache[member_id];
            } else {
                delete tags_cache.all;
            }
            return table.deleteBulk('media', item, member_id ? {owner: member_id} : null);
        }

    };
};