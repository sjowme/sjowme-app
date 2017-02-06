var _ = require('lodash');
var fs = require('fs');
var SocketIOFile = require('socket.io-file');
var path = require('path');

var config = require('../config');
var lib;
var database;
var subscriptions;
var modules;

var uploadDirs = {
    collection: path.join(config.media(), 'collection')
};

/**
 * Set responses on active socket
 * @param socket
 */
function setResponses(socket) {

    function broadcastListener(data) {
        socket.emit('admin.broadcast', data);
    }

    socket.on('admin.submit.token', (socket_token, component, data) => {

        var member_id = lib.events.getToken(socket_token);

        if (!member_id) {
            console.log(`Invalid token! Socket ID: ${socket.id}`);
            return;
        }
        console.log(`Admin identified ${member_id}, Socket ID: ${socket.id}`);

        lib.events.subscribe('admin.broadcast', broadcastListener);

        getViewdata(component, data, (err, viewdata) => {
            if (err) {
                return socket.emit('admin.error', err);
            }
            console.log('submit: admin.response initial');
            socket.emit('admin.response', 'initial', (component || 'admin-main'), viewdata);
        }, err => {
            socket.emit('admin.error', err);
        });

        socket.on('admin.command', data => {
            try {
                doCommand(socket, data.component, data.command, data.data, member_id);
            } catch (err) {
                console.log(err);
                socket.emit('admin.error', err.message);
            }
        });

        var uploader = new SocketIOFile(socket, {
            uploadDir: uploadDirs
        });
        var current_file;

        uploader.on('start', (fileInfo) => {
            current_file = fileInfo;
            console.log('Upload started', fileInfo.name);
        });
        uploader.on('stream', (data) => {
            console.log(`Streaming... ${data.uploaded} / ${data.size}`);
        });
        uploader.on('complete', () => {
            console.log('Completed!');
            lib.media.storeFile(
                config.remote_media,
                current_file.data.media,
                (err, file_data) => {
                    if (err) {
                        throw Error(err);
                    }
                    current_file.data.media.provider = config.remote_media;
                    current_file.data.media.data[config.remote_media] = file_data;
                    database.media.save(current_file.data.media).then(media => {
                        console.log('submit: admin.response upload');
                        socket.emit('admin.response', 'media.file.upload', current_file.data.component, {media}, {
                            message: 'Bestand geüpload en opgeslagen',
                            status: 'success'
                        });
                    }, err => {
                        throw Error(err);
                    });


                }
            );

        });

        socket.on('module.command', (module, command, module_config, data) => {
            modules.doCommand(module, command, module_config, data, (err, result) => {
                if (err) {
                    return socket.emit('admin.error', (err.message || err));
                }
                console.log(`submit: module.response ${module}, ${command}`);
                socket.emit('module.response', module, command, result);
            });
        });

        socket.on('disconnect', () => {
            lib.events.unSubscribe('admin.broadcast', broadcastListener);
        });
    });
}

/**
 * Get data for requested component
 * @param component
 * @param data
 * @param done callback
 */
function getViewdata(component, data, done) {
    data = data || {};

    switch (component) {
        case 'admin-main':

            done(null, _.assign({
                stats: lib.events.getStats()
            }, data));
            break;

        case 'admin-config':
            Promise.all([
                database.config.all(),
                database.channel.defaultChannels(),
            ]).then((results) => {

                var viewdata = {
                    configs: results[0],
                    default_channels: results[1]
                };
                done(null, viewdata);

            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'user-list':
            database.user.list(data.filter, data.page).then((results) => {
                var viewdata = {
                    users: results.items,
                    count: results.count,
                    pages: results.pages,
                };
                done(null, viewdata);

            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'user-edit':
            database.user.findById(data.user.id).then((user) => {
                done(null, {user});
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'channel-list':
            Promise.all([
                database.channel.list(data.filter, data.page),
                database.user.selectOptions(),
                database.config.load('categories')
            ]).then((results) => {
                var channelList = results[0];
                var usersOptions = results[1];
                var categories = results[2].categories;

                var viewdata = {
                    usersOptions,
                    categories,
                    channels: channelList.items,
                    count: channelList.count,
                    pages: channelList.pages,
                };
                done(null, viewdata);
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'channel-edit':
            var channel_fetches = [
                database.config.load('categories'),
                database.config.load('collections'),
                database.user.selectOptions(),
            ];
            if (data.channel.id) {
                channel_fetches.push(database.channel.findById(data.channel.id));
            }
            Promise.all(channel_fetches).then((results) => {
                var categories = results[0].categories;
                var collections = results[1].collections;
                var usersOptions = results[2];
                var channel = results[3] || data.channel; //new item
                done(null, {
                    categories,
                    collections,
                    usersOptions,
                    channel,
                    modules: modules.siteData(),
                });
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'media-list':
            Promise.all([
                database.config.load('collections'),
                database.media.list(data.filter, data.page),
                database.user.selectOptions()
            ]).then((results) => {
                var collections = results[0].collections;
                var mediaList = results[1];
                var usersOptions = results[2];

                var viewdata = {
                    usersOptions,
                    collections,
                    medias: mediaList.items,
                    count: mediaList.count,
                    pages: mediaList.pages,
                };
                done(null, viewdata);
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'media-collection':
            database.media.list(data.filter, data.page).then((results) => {
                var tags = [];
                var medias = results.items.map(media => {
                    media.tags.forEach(tag => {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                    return media;
                });
                var viewdata = {
                    medias: medias,
                    tags: tags,
                    count: results.count,
                    pages: results.pages,
                };
                done(null, viewdata);

            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'media-edit':
            var fetches = [
                database.config.load('collections'),
                database.media.allTags('all')
            ];
            if (data.media.id) {
                fetches.push(database.media.findById(data.media.id));
            }
            Promise.all(fetches).then((results) => {
                var collections = results[0].collections;
                var tags = results[1].tags;
                var media = results[2] || data.media; //new item
                done(null, {collections, media, tags});
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'subscription-list':
            Promise.all([
                database.config.load('abonnementen'),
                database.subscription.list(data.filter, data.page),
                database.user.selectOptions()
            ]).then((results) => {
                var abonnementen = results[0].abonnementen;
                var subscriptionList = results[1];
                var usersOptions = results[2];

                var viewdata = {
                    usersOptions,
                    abonnementen,
                    subscriptions: subscriptionList.items,
                    count: subscriptionList.count,
                    pages: subscriptionList.pages,
                };
                done(null, viewdata);
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'subscription-edit':
            var subs_fetches = [
                database.config.load('abonnementen'),
                database.user.selectOptions()
            ];
            if (data.subscription.id) {
                subs_fetches.push(database.subscription.findById(data.subscription.id));
            }
            Promise.all(subs_fetches).then((results) => {
                var abonnementen = results[0].abonnementen;
                var usersOptions = results[1];
                var subscription = results[2] || data.subscription; //new item
                done(null, {abonnementen, usersOptions, subscription});
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'invoice-list':
            Promise.all([
                database.invoice.list(data.filter, data.page),
                database.user.selectOptions()
            ]).then((results) => {
                var invoiceList = results[0];
                var usersOptions = results[1];

                var viewdata = {
                    usersOptions,
                    invoices: invoiceList.items,
                    count: invoiceList.count,
                    pages: invoiceList.pages,
                };
                done(null, viewdata);
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'invoice-edit':
            var invoice_fetches = [
                database.user.selectOptions()
            ];
            if (data.invoice.id) {
                invoice_fetches.push(database.invoice.findById(data.invoice.id));
            }
            Promise.all(invoice_fetches).then((results) => {
                var usersOptions = results[0];
                var invoice = results[1] || data.invoice; //new item
                done(null, {usersOptions, invoice});
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        default:
            done(null, data);
            break;
    }
}

/**
 * execute command and reply to socket
 * @param socket
 * @param component
 * @param command
 * @param data
 * @param member_id
 */
function doCommand(socket, component, command, data, member_id) {
    console.log(`admin received command ${command} from ${socket.id}`);

    switch (command) {

        case 'user.list':
        case 'user.edit':
        case 'user.edit.cancel':
            replyToSocketWithData(data);
            break;

        case 'config.save':
            database.config.save(data.name, data.data).then(() => {
                if (data.name === 'collections') {
                    data.data.collections.forEach(collection => {
                        lib.locator.set(collection.name, path.join(config.media(),  'collection'));
                    });
                }
                replyToSocketWithData(data, {
                    message: `Configuratie opgeslagen`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'user.save':
            //user can't change own user group
            if (data.user.id === member_id) {
                delete data.user.user_group;
            }
            database.user.save(data.user).then(user => {
                replyToSocketWithData(_.assign({user}, data), {
                    message: `Gebruiker ${user.id} opgeslagen`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'user.save.bulk':
            //user can't change own user group
            var users_save = data.users.map(user => {
                if (user.id === member_id) {
                    delete user.user_group;
                }
                return user;
            });
            database.user.saveBulk(users_save).then(count => {
                replyToSocketWithData(data, {
                    message: `${count} gebruikers opgeslagen`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'user.delete.bulk':
            //prevent removing yourself
            var users_delete = data.users.filter(user => user.id !== member_id);
            database.user.delete(users_delete).then(count => {
                replyToSocketWithData(data, {
                    message: `${count} gebruikers verwijderd`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'channel.list':
        case 'channel.edit':
        case 'channel.edit.cancel':
            replyToSocketWithData(data);
            break;

        case 'channel.save':
            console.log(`save channel ${data.channel.id} for admin ${member_id}`);

            database.channel.save(data.channel)
                .then((channel) => {

                    lib.events.trigger('channel.create.preview', channel);

                    console.log('refresh ', channel.id);
                    //refresh all screens
                    database.screen.findByChannel(channel.id).then(screens => {
                        screens.forEach(screen => lib.events.trigger(`screen.update.${screen.id}`, screen));
                    }, err => {
                        console.log(err);
                    });

                    replyToSocketWithData(data, {
                        message: `Sjow ${channel.id} opgeslagen`,
                        status: 'success'
                    }, data.component, {channel});
                }, err => {
                    replyToSocketWithData(data, {message: `Fout bij opslaan sjow`, status: 'danger'});
                });

            break;

        case 'channel.delete.bulk':
            database.channel.delete(data.channels).then(count => {
                replyToSocketWithData(data, {
                    message: `${count} sjows verwijderd`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'media.list':
        case 'media.list':
        case 'media.edit':
        case 'media.edit.cancel':
            replyToSocketWithData(data);
            break;

        case 'media.save':
            var message = {
                message: `Media ${data.media.name} opgeslagen`,
                status: 'success'
            };
            //check if image move is needed
            database.media.findById(data.media.id).then(old => {
                if (old === false || data.media.collection === old.collection) {
                    return database.media.save(data.media).then(media => {
                        replyToSocketWithData(_.assign({media}, data), message);
                    }, err => replyWithError(err));
                } else {
                    lib.media.moveFile(data.media.provider, old.path, data.media.path, (err, file_data) => {
                        if (err) {
                            return replyWithError(err);
                        }
                        data.media.data[data.media.provider] = file_data;
                        database.media.save(data.media).then(media => {
                            replyToSocketWithData(_.assign({media}, data), message);
                        }, err => {
                            return replyWithError(err);
                        });
                    });
                }
            }, err => replyWithError(err));

            break;

        case 'media.delete.bulk':
            database.media.delete(data.medias).then(count => {
                if (count) {
                    Promise.all([
                        database.channel.removeMedia(data.medias), lib.media.removeFiles(data.medias)])
                        .then(results => {
                            console.log(`Media verwijderd uit ${results[0]} sjows`);
                            replyToSocketWithData(data, {
                                message: `${count} media verwijderd uit ${results[0]} sjows`,
                                status: 'success'
                            });
                        })
                        .catch(err => replyWithError(err));
                } else {
                    replyToSocketWithData(data, {
                        message: `Geen media verwijderd`,
                        status: 'warning'
                    });
                }
            }, err => replyWithError(err));
            break;

        case 'subscription.list':
        case 'subscription.edit':
        case 'subscription.edit.cancel':
            replyToSocketWithData(data);
            break;

        case 'subscription.transaction.refresh':
            var payment = require('../includes/payment')(config);
            payment.getTransaction(data.subscription.transaction_id, (err, transaction) => {
                if (err) {
                    return replyWithError(err);
                }
                subscriptions.setPaymentStatus(transaction)
                    .then((subscription) => {
                        replyToSocketWithData(_.assign(data, {subscription}), {
                            message: `Transactiestatus ${data.subscription.transaction_id} opnieuw opgehaald`,
                            status: 'success'
                        });
                    })
                    .catch(err => replyWithError(err));
            });
            break;

        case 'subscription.save':
            database.subscription.save(data.subscription)
                .then(subscription => {
                    replyToSocketWithData(_.assign({subscription}, data), {
                        message: `Subscription ${data.subscription.name} opgeslagen`,
                        status: 'success'
                    });
                })
                .catch(err => replyWithError(err));

            break;

        case 'subscription.delete.bulk':
            database.subscription.delete(data.subscriptions).then(count => {
                replyToSocketWithData(data, {
                    message: `${count} subscription verwijderd`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'invoice.list':
        case 'invoice.edit':
        case 'invoice.edit.cancel':
            replyToSocketWithData(data);
            break;

        case 'invoice.save':
            database.invoice.save(data.invoice)
                .then(invoice => {
                    replyToSocketWithData(_.assign({invoice}, data), {
                        message: `Factuur ${data.invoice.number} opgeslagen`,
                        status: 'success'
                    });
                })
                .catch(err => replyWithError(err));


            break;

        case 'invoice.delete.bulk':
            database.invoice.delete(data.invoices).then(count => {
                replyToSocketWithData(data, {
                    message: `${count} facturen verwijderd`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        default:
            console.log(`No valid admin command given ${command}`);
            replyToSocketWithData(null, {
                message: `Functie ${command} niet bekend`,
                status: 'danger'
            });
            break;
    }

    function replyToSocketWithData(data, message) {

        getViewdata(component, data, (err, viewdata) => {
            if (err) {
                return replyWithError(err);
            }
            viewdata.lastupdate = new Date();
            console.log('submit: admin.response');
            socket.emit('admin.response', command, (component || 'admin-main'), viewdata, message);
        });
    }

    function replyWithError(err) {
        console.error(err);
        socket.emit('admin.error', err.message || err);
    }
}

module.exports = (db, library, subscr, modls) => {

    lib = library;
    database = db;
    subscriptions = subscr;
    modules = modls;

    return {getViewdata, setResponses};
};