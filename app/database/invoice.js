var _ = require('lodash');
var path = require('path');
const config = require('../config');

module.exports = (knex, lib) => {

    var table = require('./table')(knex);

    function prepareSave(item, is_new) {
        return _.assign({}, item);
    }
    
    function hydrate(resultObject) {
        return _.assign({
            invoice_url: config.baseUrl('member') + `/pdf/factuur/${resultObject.number}/bekijk`,
            invoice_download: config.baseUrl('member') + `/pdf/factuur/${resultObject.number}/download`
        }, resultObject);
    }

    function getNextInvoiceNumber() {
        return knex('invoice')
            .orderBy('number', 'desc')
            .first().then(invoice => {
                var cur_year = (new Date()).getFullYear(),
                    prefix = `SJ${String(cur_year).substr(2,2)}-`;
                if (!invoice || invoice.created_at.getFullYear() < cur_year) {
                    return `${prefix}00001`;
                }
                var number = parseInt(invoice.number.replace(prefix, ''), 10) + 1;
                return prefix + _.padStart(number, 5, '0');
            });
    }

    return {
        findById(id) {
            return knex('invoice').where({id}).first('*').then(invoice => {
                if (!invoice) {
                    return false;
                }
                return hydrate(invoice);
            });
        },
        findByTransaction(transaction_id) {
            return knex('invoice').where({transaction_id}).first('*').then(invoice => {
                if (!invoice) {
                    return false;
                }
                return hydrate(invoice);
            });
        },
        findByNumber(number) {
            return knex('invoice').where({number}).first('*').then(invoice => {
                if (!invoice) {
                    return false;
                }
                return hydrate(invoice);
            });
        },
        findByOwner(member_id) {
            return knex('invoice')
                .leftJoin('user', 'invoice.user_id', 'user.id')
                .where({owner: member_id})
                .orderBy('number', 'desc')
                .select('invoice.*', 'user.name as user_name', 'user.email as user_email')
                .map(invoice => {
                    //unset transaction in public
                    invoice.transaction = {};
                    return hydrate(invoice);
                });
        },
        list(filter, page) {

            filter = _.defaults(filter, {search: '', owner: 0, order: '', limit: 20});
            var order = /^(name|created_at|number|net_price|vat_amount|total_price|transaction_id)\s(asc|desc)$/.exec(filter.order) ||
               {1: 'number', 2: 'desc'};

            return table.list('invoice', filter, order, page, (query, isCount) => {
                query.leftJoin('user', 'invoice.user_id', 'user.id');
                if (!isCount) {
                    query.columns('invoice.*', 'user.name as user_name', 'user.email as user_email');
                }
                if (filter.owner) {
                    query.where({owner: filter.owner, collection: ''});
                }
                if (filter.search) {
                    var search = `%${filter.search}%`.toLowerCase();
                    query.where(function () {
                        this.whereRaw('lower(invoice.number) like ?', search)
                            .orWhereRaw('lower(invoice.reference) like ?', search)
                            .orWhereRaw('lower(invoice.transaction_id) like ?', search);
                    });
                }
                return query;
            }, hydrate);
        },
        save(item) {
            var now = new Date();
            item.updated_at = now;
            if (!item.id) {
                item.created_at = now;
                return getNextInvoiceNumber().then(number => {
                    item.number = number;
                    return table.create('invoice', item, prepareSave);
                });
            } else {
                return table.save('invoice', item, prepareSave);
            }
        },
        saveBulk: (items) => table.saveBulk('invoice', items, prepareSave),
        delete: (item) => table.deleteBulk('invoice', item)

    };
};