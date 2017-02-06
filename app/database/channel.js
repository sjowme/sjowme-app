var _ = require('lodash');

module.exports = (knex, lib, modules) => {

    var table = require('./table')(knex);
    var defaults = require('../database/defaults');

    function prepareSave(channel, is_new) {
        var copy = _.assign({}, channel);
        if (!is_new) {
            delete copy.previews; //only save via savePreviews
        }
        return copy;
    }

    function hydrate(resultObject) {
        var item = _.assign({}, resultObject);
        //make sure config has full data-set
        item.config = _.defaultsDeep(item.config, defaults.channel.config);
        //make sure stored slide has full data-set
        item.content.slides.map(slide => _.defaultsDeep(slide, defaults.slide));
        //make sure modules are complete for edit
        item.content.slides.forEach(slide => {
            slide.modules = slide.modules.map(module => {
                var default_module = modules.get(module.name);
                return _.defaultsDeep(module, default_module ? default_module.module : {});
            });
        });
        return item;
    }

    return {
        findById(id) {
            return knex('channel').where({id}).first('*').then(channel => {
                if (!channel) {
                    throw Error(`Channel ${id} not found`);
                }
                return hydrate(channel);
            });
        },
        findByOwner(member_id) {
            return knex('channel').where({owner: member_id}).select('*').map(channel => hydrate(channel));
        },
        defaultChannels() {
            return knex('channel').where({owner: 0}).whereNot({category: ''}).orderBy('name', 'asc').select('*').map(channel => hydrate(channel));
        },
        list(filter, page) {

            filter = _.defaults(filter, {search: '', category: '', owner: 0, order: '', limit: 20});
            var order = /^(name|updated_at)\s(asc|desc)$/.exec(filter.order) || {1: 'name', 2: 'asc'};

            return table.list('channel', filter, order, page, (query, isCount) => {
                query.leftJoin('user', 'channel.owner', 'user.id');
                if (!isCount) {
                    query.columns('channel.*', 'user.name as user_name');
                }
                if (filter.owner) {
                    query.where({owner: filter.owner});
                }
                if (filter.category) {
                    query.where({category: filter.category});
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
        create(item) {
            var now = new Date();
            item.created_at = now;
            item.updated_at = now;
            return table.create('channel', item, prepareSave);
        },
        savePreviews(id, previews) {
            return knex('channel').where({id}).update({previews});
        },
        save(item) {
            if (item.id === 0) {
                return this.create(item);
            }
            item.updated_at = new Date();
            return table.save('channel', item, prepareSave);
        },
        delete: (item) => table.deleteBulk('channel', item),
        removeMedia(medias, member_id) {
            var changed = [], media_pathsMap = {};
            medias.forEach(media => media_pathsMap[media.path] = media);

            var q = knex('channel');
            if (member_id) {
                q.where('owner', member_id);
            }
            return new Promise((resolve, reject) => {
                q.select('id', 'content', 'owner').then(channels => {
                    channels.forEach(channel => {
                        channel.content.slides.forEach(slide => {
                            if (media_pathsMap[slide.background.path] !== undefined) {
                                if (media_pathsMap[slide.background.path].collection === '' &&
                                        media_pathsMap[slide.background.path].owner !== channel.owner) {
                                    return; //user media from other user
                                }
                                slide.background = _.defaults({}, defaults.slide.background);
                                changed.push(table.save('channel', channel, prepareSave));
                            }
                        });
                    });
                    //save all and return count
                    Promise.all(changed).then(results => resolve(results.length), err => reject(err));
                });

            });
        }
    };
};