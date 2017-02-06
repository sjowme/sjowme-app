//http://www.dancorman.com/knex-your-sql-best-friend/heroku pg:psql

var knex_config      = require('../knexfile.js');
var env         = 'development';
var knex        = require('knex')(knex_config[env]);

knex.migrate.latest([knex_config]);


var config = null;
var screen = null;
var user = null;
var channel = null;
var media = null;
var subscription = null;
var invoice = null;


function setupModels(lib, modules) {

    config = require('./config')(knex, lib, modules);
    screen = require('./screen')(knex, lib, modules);
    user = require('./user')(knex, lib, modules);
    channel = require('./channel')(knex, lib, modules);
    media = require('./media')(knex, lib, modules);
    subscription = require('./subscription')(knex, lib, modules);
    invoice = require('./invoice')(knex, lib, modules);

}

module.exports = {
    initialize(lib, modules) {
        setupModels(lib, modules);
    },
    config: {
        all: (name) => config.all(),
        load: (name) => config.load(name),
        save: (name, data) => config.save(name, data),
        delete: (name) => config.delete(name)
    },
    screen: {
        findOrCreate: (id) => screen.findOrCreate(id),
        findUnClaimed: (id) => screen.findUnClaimed(id),
        findByOwner: (member_id) => screen.findByOwner(member_id),
        findByChannel: (channel_id) => screen.findByChannel(channel_id),
        save: (scrn) => screen.save(scrn),
        delete: (id) => screen.delete(id)
    },
    user: {
        findById: (id) => user.findById(id),
        findByRemember: (remember) => user.findByRemember(remember),
        findByAuth: (item) => user.findByAuth(item),
        selectOptions: (filter) => user.selectOptions(filter),
        list: (filter, page) => user.list(filter, page),
        save: (item) => user.save(item),
        saveBulk: (items) => user.saveBulk(items),
        delete: (item) => user.delete(item)
    },
    channel: {
        findById: (id) => channel.findById(id),
        findByOwner: (member_id) => channel.findByOwner(member_id),
        defaultChannels: () => channel.defaultChannels(),
        list: (filter, page) => channel.list(filter, page),
        create: (chnl) => channel.create(chnl),
        savePreviews: (id, previews) => channel.savePreviews(id, previews),
        save: (chnl) => channel.save(chnl),
        delete: (id) => channel.delete(id),
        removeMedia: (media_path, member_id) => channel.removeMedia(media_path, member_id)
    },
    media: {
        findById: (id) => media.findById(id),
        allTags: (filter) => media.allTags(filter),
        list: (filter, page) => media.list(filter, page),
        save: (item) => media.save(item),
        saveBulk: (items) => media.saveBulk(items),
        delete: (item, member_id) => media.delete(item, member_id)
    },
    subscription: {
        findById: (id) => subscription.findById(id),
        findByTransaction: (trx_id) => subscription.findByTransaction(trx_id),
        findByOwner: (member_id) => subscription.findByOwner(member_id),
        getValidSubscription: (member_id) => subscription.getValidSubscription(member_id),
        getExpiringSubscriptions: (check_start, check_end) => subscription.getExpiringSubscriptions(check_start, check_end),
        getLastSubscription: (member_id) => subscription.getLastSubscription(member_id),
        list: (filter, page) => subscription.list(filter, page),
        save: (item) => subscription.save(item),
        saveBulk: (items) => subscription.saveBulk(items),
        delete: (item) => subscription.delete(item)
    },
    invoice: {
        findById: (id) => invoice.findById(id),
        findByTransaction: (trx_id) => invoice.findByTransaction(trx_id),
        findByNumber: (number) => invoice.findByNumber(number),
        findByOwner: (member_id) => invoice.findByOwner(member_id),
        list: (filter, page) => invoice.list(filter, page),
        save: (item) => invoice.save(item),
        saveBulk: (items) => invoice.saveBulk(items),
        delete: (item) => invoice.delete(item)
    }
};