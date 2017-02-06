var _ = require('lodash');

var lib;
var database;
var subscriptions;
var modules;

function setResponses(socket) {

    socket.on('app.log', (message) => {
        console.log(`[CLIENT LOG]: ${message}`);
    });

    socket.on('screen.connect.id', (screen_id, socket_token) => {

        try {
            //regular screen
            if (!socket_token) {

                console.log(`screen.connect.id from ${screen_id}`);

                Promise.all([database.screen.findOrCreate(screen_id), database.config.load('general')])
                    .then(
                        (results) => {
                            var screen = results[0];
                            var general_config = results[1];

                            lib.events.subscribeSingle(`screen.refresh.${screen.id}`, () => {
                                socket.emit('screen.refresh');
                                console.log(`Sending refresh command to ${screen.id}`);
                            });

                            lib.events.subscribeSingle(`module.response.${screen.id}`, (screen, module, command, result) => {
                                if (!screen.active) {
                                    console.log(`screen ${screen.id} is inactive, not updated`);
                                }
                                console.log(`Event: module.response ${module}, ${command}`);
                                socket.emit('module.response', module, command, result);
                            });

                            lib.events.subscribeSingle(`screen.update.${screen.id}`, (screen) => {
                                if (!screen.active) {
                                    console.log(`screen ${screen.id} is inactive, not updated`);
                                    socket.emit('screen.response', 'screen-main', {
                                        screen: screen,
                                        channel: {}
                                    });
                                    return;
                                }
                                Promise.all([
                                    database.channel.findById(screen.channel || general_config.default_channel || 0),
                                    database.user.findById(screen.owner),
                                    database.subscription.getValidSubscription(screen.owner)
                                ]).then(results => {
                                    var channel = results[0];
                                    var user = results[1];
                                    var subscription = results[2];
                                    if (!user.active || !subscription) {
                                        console.log(`User ${user.id} or subscription is inactive, screen ${screen.id} not updated`);
                                        socket.emit('screen.response', 'screen-main', {
                                            screen: screen,
                                            channel: {}
                                        });
                                        return;
                                    }
                                    console.log(`executing screen update for ${screen.id}`);
                                    socket.emit('screen.response', 'screen-main', {
                                        screen: screen,
                                        channel: channel,
                                        modules: modules.siteData()
                                    });
                                }, (err) => {
                                    replyWithError(err);
                                });

                            });

                            if (screen.active) {
                                lib.events.trigger(`screen.update.${screen.id}`, screen);
                            }

                            socket.emit('screen.connect.screen', screen);
                            lib.events.trigger('admin.broadcast', {stats: lib.events.getStats()});
                            lib.events.trigger('member.broadcast');

                        }, (err) => {
                            replyWithError(err);
                        }
                    );

                socket.on('disconnect', () => {
                    lib.events.unSubscribeSingle(`screen.refresh.${screen_id}`);
                    lib.events.unSubscribeSingle(`screen.update.${screen_id}`);
                    lib.events.trigger('admin.broadcast', {stats: lib.events.getStats()});
                    lib.events.trigger('member.broadcast');
                });

            } else {
                //preview-screen, check socket-key
                var valid = lib.events.getToken(socket_token);

                console.log(`screen.connect.id from preview ${socket_token}`);

                if (!valid) {
                    console.log(`Invalid preview token! Socket ID: ${socket.id}`);
                    return;
                }
                socket.emit('screen.connect.screen', socket_token);
            }

            socket.on('module.command', (module, command, module_config, data) => {
                modules.doCommand(module, command, module_config, data, (err, result) => {
                    if (err) {
                        return socket.emit('screen.error', (err.message || err));
                    }
                    console.log(`submit: module.response ${module}, ${command}`);
                    socket.emit('module.response', module, command, result);
                });
            });

        } catch (err) {
            replyWithError(err);
        }

        function replyWithError(err) {
            console.error(err);
            socket.emit('screen.error', err.message || err);
        }
    });
}

module.exports = (db, library, subscr, modls) => {

    lib = library;
    database = db;
    subscriptions = subscr;
    modules = modls;

    return {setResponses};
};



