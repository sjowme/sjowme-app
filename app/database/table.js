var _ = require('lodash');
var defaults = require('./defaults');

module.exports = (knex) => {
    /**
     * check for existing table fields before saving
     * @param table_name
     * @param copy
     * @returns {*}
     */
    function sanatizeCopy (table_name, copy) {
        var keys = Object.keys(defaults[table_name]);
        _.forIn(copy, (value, key) => {
            if (keys.indexOf(key) === -1) {
                delete copy[key];
            }
        });
        delete copy.id;
        return copy;
    }

    return {
        /**
         * Create item in table
         * @param table_name
         * @param item
         * @param prepareSave callback that prepares item data
         * @returns {Promise}
         */
        create(table_name, item, prepareSave) {
            var copy = sanatizeCopy(table_name, prepareSave(item, true));
            return knex(table_name).returning('id').insert(copy).then(res => _.assign(item, {id: res[0]}));
        },

        /**
         * Save item to table
         * @param table_name
         * @param item
         * @param prepareSave callback that prepares item data
         * @returns {Promise}
         */
        save(table_name, item, prepareSave) {
            var copy = sanatizeCopy(table_name, prepareSave(item, false));
            return knex(table_name).where('id', item.id).update(copy).then(() => item);
        },

        /**
         * Delete one or more items from table
         * @param table_name
         * @param items collection of items
         * @param prepareSave callback that prepares item data
         * @returns {Promise}
         */
        saveBulk(table_name, items, prepareSave) {
            var promises = [];
            items.forEach(item => {
                promises.push(this.save(table_name, item, prepareSave));
            });
            return Promise.all(promises).then(results => results.length);
        },

        /**
         * Delete one or more items from table
         * @param table_name
         * @param item item object or collection of items
         * @param wheres
         * @returns {Promise}
         */
        deleteBulk(table_name, item, wheres) {
            var ids;
            if (_.isArray(item)) {
                ids = item.map(item => item.id);
            } else {
                ids = [item.id];
            }
            var query = knex(table_name).whereIn('id', ids);
            if (wheres) {
                query.where(wheres);
            }
            return query.del();
        },

        /**
         *
         * @param table_name
         * @param filter
         * @param order
         * @param page
         * @param select
         * @param prepare Function
         * @param hydrate Function
         * @returns {Promise}
         */
        list(table_name, filter, order, page, prepare, hydrate) {
            return new Promise(resolve => {
                //setup defaults
                prepare = prepare || (qry => qry);
                hydrate = hydrate || (itm => itm);
                //get count
                prepare(knex(table_name), true).count(`${table_name}.id`).then(res => {
                    var count = parseInt(res[0].count, 10);
                    if (count === 0) {
                        //bail out
                        resolve({items: [], pages: 1, count: 0});
                    }
                    var limit = filter.limit || 20;
                    var pages = Math.ceil(count / limit);
                    page = Math.max(0, Math.min(pages - 1, (page || 0)));
                    //get actual items
                    prepare(knex(table_name))
                        .orderBy(order[1], order[2]).offset(page * limit).limit(limit)
                        .select()
                        .map(result => hydrate(result))
                        .then(items => resolve({items, pages, count}));
                });
            });

        },

    };
};