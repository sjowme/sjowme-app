var _ = require('lodash');
var SocketIOFile = require('socket.io-file');
var path = require('path');

var config = require('../config');
var payment = require('../includes/payment')(config);

var lib;
var database;
var subscriptions;
var modules;

/**
 * Set responses on active socket
 * @param socket
 */
function setResponses(socket) {

    socket.on('member.submit.token', function (socket_token, component, data) {

        var member_id = lib.events.getToken(socket_token);

        if (!member_id) {
            console.log(`Invalid token! Socket ID: ${socket.id}`);
            return;
        }
        console.log(`Member identified ${member_id}, Socket ID: ${socket.id}`);

        lib.events.subscribe('member.broadcast', broadcastListener);

        getViewdata(component, data, member_id, (err, viewdata) => {
            if (err) {
                return socket.emit('member.error', err);
            }
            console.log('submit: member.response initial');
            socket.emit('member.response', 'initial', (component || 'member-main'), viewdata);
        }, err => {
            socket.emit('member.error', err);
        });

        socket.on('member.command', data => {
            try {
                doCommand(socket, data.component, data.command, data.data, member_id);
            } catch (err) {
                console.log(err);
                socket.emit('member.error', err.message);
            }
        });

        var uploader = new SocketIOFile(socket, {
            uploadDir: {
                user: path.join(config.media(), 'user', `u${member_id}`),
                user_collection: path.join(config.media(), 'user', `u${member_id}`, 'collection')
            }
        });
        var current_file;

        uploader.on('start', (fileInfo) => {
            current_file = fileInfo;
            current_file.data.media.collection = '';
            current_file.data.media.owner = member_id;
            console.log('Upload started', fileInfo);
        });
        uploader.on('stream', (data) => {
            console.log(`Streaming... ${data.uploaded} / ${data.size}`);
        });
        uploader.on('complete', () => {
            console.log('Completed!');
            lib.media.storeFile(
                config.remote_media,
                current_file.data.media,
                (err, data) => {
                    if (err) {
                        return socket.emit('member.error', err);
                    }
                    current_file.data.media.provider = config.remote_media;
                    current_file.data.media.data[config.remote_media] = data;
                    if (current_file.data.saveMedia === true) {
                        database.media.save(current_file.data.media).then(media => {
                            console.log('submit: member.response upload');
                            socket.emit('member.response', 'media.file.upload', current_file.data.component, {media}, {
                                message: 'Bestand geüpload en opgeslagen',
                                status: 'success'
                            });
                        }, err => {
                            socket.emit('member.error', err.message);
                        });
                    } else {
                        console.log('submit: member.response upload');
                        current_file.data.media.image_url = lib.media.getUrl(current_file.data.media);
                        socket.emit('member.response', 'media.file.upload', current_file.data.component, {media: current_file.data.media}, {
                            message: 'Bestand geüpload en opgeslagen',
                            status: 'success'
                        });
                    }

                }
            );
        });
        socket.on('module.command', (module, command, module_config, data) => {
            modules.doCommand(module, command, module_config, data, (err, result) => {
                if (err) {
                    return socket.emit('member.error', (err.message || err));
                }
                if (result.broadcast) {
                    var channel_id = result.broadcast;
                    console.log(`Broadcast ${module}:${command} to screens of channel ${channel_id}`);
                    database.screen.findByChannel(channel_id).then(screens => {
                        screens.forEach(screen => lib.events.trigger(`module.response.${screen.id}`, screen, module, command, result));
                    }, err => {
                        console.log(err);
                    });
                }
                console.log(`submit: module.response ${module}, ${command}`);
                socket.emit('module.response', module, command, result);
            });
        });

        lib.events.trigger('admin.broadcast', {stats: lib.events.getStats()});

        socket.on('disconnect', () => {
            lib.events.unSubscribe('member.broadcast', broadcastListener);
            lib.events.trigger('admin.broadcast', {stats: lib.events.getStats()});
        });

        function broadcastListener(data) {
            //reply with default data is no data is given
            if (!data) {
                getViewdata('member-main', {}, member_id, (err, viewdata) => {
                    if (err) {
                        return socket.emit('member.error', err.message);
                    }
                    viewdata.lastupdate = new Date();
                    socket.emit('member.broadcast', viewdata);
                    console.log('Member broadcast');
                });
            } else {
                socket.emit('member.broadcast', data);
                console.log('Member broadcast');
            }
        }

    });
}

/**
 * Get data for requested component
 * @param component
 * @param data
 * @param member_id
 * @param done callback
 */
function getViewdata(component, data, member_id, done) {
    data = data || {};

    switch (component) {
        case 'member-main':
            Promise.all([
                database.screen.findByOwner(member_id),
                database.channel.findByOwner(member_id),
                database.channel.defaultChannels(),
                database.config.load('general'),
                database.config.load('categories')
            ])
                .then((results) => {
                    data = _.assign((data || {}), {
                        screens: results[0],
                        channels: results[1]
                    });
                    data.default_channels = results[2];
                    data.default_channel = results[3].default_channel || 0;
                    data.categories = results[4].categories;
                    data.active_screens = lib.events.activeScreens(data.screens);
                    data.home_url = config.baseUrl();
                    data.member_url = config.baseUrl('member');
                    data.screen_url = config.baseUrl('screen');
                    data.admin_url = config.baseUrl('admin');
                    data.lastupdate = new Date();
                    done(null, data);

                }, err => {
                    done(`error fetch data: ${err}`);
                });
            break;

        case 'member-profile':
            database.user.findById(member_id).then((user) => {
                done(null, _.assign(data, {user}));
            }, err => {
                done(`error fetch data: ${err}`);
            });
            break;

        case 'member-subscriptions':
            Promise.all([
                database.subscription.findByOwner(member_id),
                database.config.load('general'),
                database.config.load('abonnementen')
            ])
                .then((results) => {
                    data = _.assign((data || {}), {
                        subscriptions: results[0],
                        vat_perc: results[1].vat_perc,
                        abonnementen: results[2].abonnementen
                    });
                    data.home_url = config.baseUrl();
                    data.member_url = config.baseUrl('member');
                    data.screen_url = config.baseUrl('screen');
                    data.admin_url = config.baseUrl('admin');
                    done(null, data);

                }, err => {
                    done(`error fetch data: ${err}`);
                });
            break;

        case 'media-collection':
            var tags_target = data.filter.collection, tags;
            if (data.filter.collection === 'user') {
                data.filter.collection = '';
                data.filter.owner = member_id;
                tags_target = member_id;
            }
            database.media.allTags(tags_target)
                .then(tag_result => {
                    tags = tag_result.tags;
                    if (data.filter.tags.length) {
                        data.filter.ids = data.filter.tags.reduce((ids, tag) => {
                            if (ids.length === 0 && tag_result.index[tag]) {
                                return tag_result.index[tag];
                            }
                            if (tag_result.index[tag]) {
                                return _.intersection(ids, tag_result.index[tag]);
                            }
                            return ids;
                        }, []);
                    }
                    return database.media.list(data.filter, data.page);
                }).then((results) => {
                    var viewdata = {
                        medias: results.items,
                        tags: tags,
                        count: results.count,
                        pages: results.pages,
                    };
                    done(null, viewdata);

                })
                .catch(err => done(`error fetch data: ${err}`));
            break;

        case 'channel-edit':
            Promise.all([
                database.config.load('collections'),
                database.media.allTags(member_id),
            ]).then((results) => {
                done(null, _.assign(data, {
                    modules: modules.siteData(),
                    collections: results[0].collections,
                    member_media_tags: results[1].tags
                }));
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
    console.log(`member received command ${command} from ${socket.id}`);

    switch (command) {
        case 'screen.refresh':

            lib.events.trigger(`screen.update.${data.screen.id}`, data.screen);
            lib.events.trigger(`screen.refresh.${data.screen.id}`);
            break;

        case 'screen.claim':
            console.log(`claim screen for member ${member_id}`);
            database.screen.findUnClaimed(data.screen.id).then((screen) => {
                if (screen !== false) {
                    database.screen.save(_.assign(screen, {owner: member_id, channel: 0}))
                        .then((screen) => {
                            replyToSocketWithData(data, {
                                message: `Scherm ${screen.id} toegevoegd`,
                                status: 'success'
                            });
                        }, err => {
                            console.log(err);
                            lib.events.trigger(`screen.update.${data.screen.id}`, data.screen);//??
                            replyToSocketWithData(data, {
                                message: `Fout bij claimen scherm`,
                                status: 'danger'
                            });
                        });
                } else {
                    replyToSocketWithData(data, {
                        message: `Scherm is niet beschikbaar`,
                        status: 'warning'
                    });
                }

            }, err => {
                if (err) {
                    replyToSocketWithData(data, {
                        message: `Fout bij claimen scherm`,
                        status: 'danger'
                    });
                }
            });

            break;

        case 'screen.save':
            console.log(`save screen for member ${member_id}`);

            database.screen.save(_.assign(data.screen, {owner: member_id}))
                .then((screen) => {
                    lib.events.trigger(`screen.update.${screen.id}`, screen);
                    replyToSocketWithData(data, {
                        message: `Scherm ${screen.id} opgeslagen`,
                        status: 'success'
                    });
                }, err => {
                    replyToSocketWithData(data, {message: `Fout bij opslaan scherm`, status: 'danger'});
                });

            break;

        case 'screen.delete':
            console.log(`deleting screen for member ${member_id}`);
            //does user own this screen?
            database.screen.findByOwner(member_id).then((screens) => {
                var existing = _.find(screens, {id: data.screen.id});
                if (existing) {
                    database.screen.delete(existing)
                        .then((res) => {
                            data.screen.active = false;
                            lib.events.trigger(`screen.update.${data.screen.id}`, data.screen);
                            replyToSocketWithData(data, {
                                message: `Scherm ${data.screen.id} vergeten`,
                                status: 'success'
                            });
                        }, err => {
                            replyToSocketWithData(data, {
                                message: `Fout bij verwijderen scherm`,
                                status: 'danger'
                            });
                        });

                }
            }, err => replyWithError(err));

            break;

        case 'channel.create':
            console.log(`create channel for member ${member_id}`);

            data.channel.owner = member_id;

            database.channel.create(data.channel)
                .then((channel) => {
                    replyToSocketWithData(data, {
                        message: `Sjow ${channel.id} is aangemaakt`,
                        status: 'success'
                    });
                }, err => {
                    replyToSocketWithData(data, {message: `Fout bij aanmaken sjow`, status: 'danger'});
                });

            break;

        case 'channel.edit':
            console.log(`edit channel ${data.channel.id} for member ${member_id}`);
            //does user own this screen?
            database.channel.findByOwner(member_id).then((channels) => {
                var channel = _.find(channels, {id: data.channel.id});
                if (channel) {
                    replyToSocketWithData(_.assign({channel}, data));
                } else {
                    replyToSocketWithData(data, {message: `Sjow niet gevonden`, status: 'danger'});
                }
            }, err => replyWithError(err));


            break;

        case 'channel.edit.cancel':
            console.log(`edit channel ${data.channel.id} for member ${member_id} CANCELLED`);
            replyToSocketWithData(data);
            break;

        case 'channel.save':
            console.log(`save channel ${data.channel.id} for member ${member_id}`);
            //user can only save own channels
            data.channel.owner = member_id;
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

        case 'channel.delete':
            console.log(`deleting channel for member ${member_id}`);
            //does user own this screen?
            database.channel.findByOwner(member_id).then((channels) => {
                var existing = _.find(channels, {id: data.channel.id});
                if (existing) {
                    database.channel.delete(existing)
                        .then((res) => {
                            //refresh all screens
                            database.screen.findByChannel(data.channel.id).then(screens => {
                                screens.forEach(screen => lib.events.trigger(`screen.update.${screen.id}`, screen));
                            }, err => {throw Error(err);});


                            replyToSocketWithData(data, {
                                message: `Sjow ${data.channel.name} vergeten`,
                                status: 'success'
                            });
                        }, err => {
                            replyToSocketWithData(data, {
                                message: `Fout bij verwijderen sjow`,
                                status: 'danger'
                            });
                        });

                }
            }, err => replyWithError(err));

            break;

        case 'media.list':
            replyToSocketWithData(data);
            break;

        case 'media.save':
            data.media.collection = '';
            data.media.owner = member_id;
            database.media.save(data.media).then(media => {
                replyToSocketWithData(_.assign({media}, data), {
                    message: `Media ${data.media.name} opgeslagen`,
                    status: 'success'
                });
            }, err => replyWithError(err));
            break;

        case 'media.delete.bulk':
            database.media.delete(data.medias, member_id).then(count => {
                if (count) {
                    Promise.all([
                        database.channel.removeMedia(data.medias, member_id), lib.media.removeFiles(data.medias)])
                        .then(results => {
                            console.log(`Media verwijderd uit ${results[0]} sjows`);
                            //todo reload current channel id media-edit
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
            }, err => {
                replyWithError(err);
            });
            break;

        case 'profile.save':
            if (data.user.id !== member_id) {
                replyWithError('Geen toegang');
            }
            database.user.save(data.user)
                .then(res => replyToSocketWithData(data, {
                    message: `${data.user.name || data.user.email} saved`,
                    status: 'success'
                }))
                .catch(err => replyWithError(err));

            break;

        case 'subscription.list':
            replyToSocketWithData(data);
            break;

        case 'subscription.add':
            subscriptions.addMemberSubscription(member_id, data.abonnement).then(subscription => {
                subscriptions.calculateTotal(subscription)
                    .then((price_calculation) => {
                        var payment_url = false, message, description = `Sjow.me: ${subscription.name}`;
                        payment.setupTransaction(price_calculation.total_price, description, (err, pymnt) => {
                            if (err) {
                                message = {
                                    message: `Fout in betaling: ${err.message}`,
                                    status: 'danger'
                                };
                            } else {
                                payment_url = pymnt.getPaymentUrl();
                            }
                            var transaction_id = pymnt.id;
                            database.subscription.save(_.assign(subscription, {transaction_id})).then(subscription => {
                                var default_invoice = require('../database/defaults').invoice;
                                //set callback for return/webhook
                                lib.events.subscribeSingle(`payment.pending`, cb => {
                                    console.log(`Callback triggered for ${transaction_id}`);
                                    payment.getTransaction(transaction_id, (err, transaction) => {
                                        transaction.datetime = transaction.paidDatetime;
                                        transaction.price_calculation = price_calculation;
                                        //create invoice data
                                        var invoice = _.defaultsDeep({
                                            reference: `Abonnement ${subscription.name} sjow.me`, //todo translate
                                            user_id: member_id,
                                            transaction,
                                            transaction_id
                                        }, price_calculation, default_invoice);
                                        invoice.data.specifications.push({
                                            description: `Abonnement ${subscription.name} sjow.me`, //todo translate
                                            duration: lib.utils.formatPeriod(subscription.starts_at, subscription.expires_at),
                                            price: subscription.price
                                        });
                                        //set address
                                        invoice.address.name = data.user.name;
                                        invoice.address.email = data.user.email;

                                        database.invoice.save(invoice)
                                            .then(invoice => {
                                                transaction.invoice_id = invoice.id;
                                                transaction.invoice_number = invoice.number;
                                                return subscriptions.setPaymentStatus(transaction);
                                            })
                                            .then(subscription => {
                                                lib.events.unSubscribeSingle(`payment.pending`);
                                                cb(null, subscription, invoice, data.user);
                                            })
                                            .catch(err => cb(err));

                                    });

                                });
                                replyToSocketWithData(_.assign({subscription, payment_url, transaction_id}, data), message);
                            });

                        });
                    });
            });
            break;

        case 'subscription.pay':
            subscriptions.calculateTotal(data.subscription)
                .then((price_calculation) => {
                    var payment_url = false, message, description = `Sjow.me: ${data.subscription.name}`;
                    payment.setupTransaction(price_calculation.total_price, description, (err, pymnt) => {
                        if (err && !pymnt) {
                            return replyWithError(err);
                        }
                        if (err) {
                            message = {
                                message: `Fout in betaling: ${err.message || pymnt.error.message}`,
                                status: 'danger'
                            };
                        } else {
                            payment_url = pymnt.getPaymentUrl();
                        }
                        var transaction_id = pymnt.id, subscription;
                        database.subscription.save(_.assign(data.subscription, {transaction_id}))
                            .then(subscr => {
                                subscription = subscr;
                                return database.invoice.findById(subscription.data.transaction.invoice_id || 0);
                            })
                            .then((existing_invoice) => {
                                var default_invoice = require('../database/defaults').invoice;
                                //set callback for return/webhook
                                lib.events.subscribeSingle(`payment.pending`, cb => {
                                    console.log(`Callback triggered for ${transaction_id}`);
                                    payment.getTransaction(transaction_id, (err, transaction) => {
                                        transaction.datetime = transaction.createdDatetime;
                                        transaction.price_calculation = price_calculation;
                                        //create invoice data
                                        var invoice = _.defaultsDeep({
                                            reference: `Abonnement ${subscription.name} sjow.me`, //todo translate
                                            user_id: member_id,
                                            transaction,
                                            transaction_id
                                        }, price_calculation, (existing_invoice || default_invoice));
                                        if (!invoice.id) {
                                            invoice.data.specifications.push({
                                                description: `Abonnement ${subscription.name} sjow.me`, //todo translate
                                                duration: lib.utils.formatPeriod(subscription.starts_at, subscription.expires_at),
                                                price: subscription.price
                                            });
                                        }
                                        //set address
                                        invoice.address.name = data.user.name;
                                        invoice.address.email = data.user.email;

                                        database.invoice.save(invoice)
                                            .then(invoice => {
                                                transaction.invoice_id = invoice.id;
                                                transaction.invoice_number = invoice.number;
                                                return subscriptions.setPaymentStatus(transaction);
                                            })
                                            .then(subscription => {
                                                lib.events.unSubscribeSingle(`payment.pending`);
                                                cb(null, subscription, invoice, data.user);
                                            })
                                            .catch(err => cb(err));

                                    });

                                });
                            replyToSocketWithData(_.assign({subscription, payment_url, transaction_id}, data), message);
                        });

                    });
                });
            break;

        default:
            console.log(`No valid member command given ${command}`);
            replyToSocketWithData(null, {
                message: `Functie ${command} niet bekend`,
                status: 'danger'
            });
            break;
    }

    function replyToSocketWithData(data, message) {

        getViewdata(component, data, member_id, (err, viewdata) => {
            if (err) {
                return replyWithError(err);
            }
            viewdata.lastupdate = new Date();
            console.log('submit: member.response');
            socket.emit('member.response', command, (component || 'member-main'), viewdata, message);
        });
    }

    function replyWithError(err) {
        console.error(err);
        socket.emit('member.error', err.message || err);
    }
}

module.exports = (db, library, subscr, modls) => {

    lib = library;
    database = db;
    subscriptions = subscr;
    modules = modls;

    return {getViewdata, setResponses};
};