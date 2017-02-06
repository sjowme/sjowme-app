var _ = require('lodash');

var events= {};

var socket_tokens = {};

function setToken(token, member_id) {
    socket_tokens[token] = member_id;
}

function getToken(token) {
    return socket_tokens[token] || 0;
}

function subscribe(event_name, listener) {

    if (!events[event_name]) {
        events[event_name] = [];
    }

    // add the listener
    events[event_name].push(listener);
    console.log(`New event listener ---> ${event_name}`);
}

function unSubscribe(event_name, listener) {
    var idx = events[event_name].indexOf(listener);
    if (idx > -1) {
        events[event_name].splice(idx, 1);
        console.log(`Listener removed for ${event_name}`);
    }
}

function subscribeSingle(event_name, listener) {

    events[event_name] = [];
    // add the listener
    events[event_name].push(listener);
    console.log(`New single event listener ${event_name}`);
}

function unSubscribeSingle(event_name) {

    delete events[event_name];
    console.log(`Unsubscribed single listener ${event_name}`);
}

function trigger() {
    var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
    var event_name = args.shift();

    // return if the event doesn't exist, or there are no events
    if(!events[event_name] || !events[event_name].length) {
        return false;
    }
    console.log(`Event ${event_name} triggered.`);
    events[event_name].forEach((listener) => {
        listener.apply(null, args);
    });
    return true;
}

module.exports = {
    subscribe,
    unSubscribe,
    subscribeSingle,
    unSubscribeSingle,
    trigger,
    setToken,
    getToken,
    nrScreens() {
        var count = 0;
        _.forIn(events, (evts, name) => {
            if (_.startsWith(name, 'screen.update')) {
                count += 1;
            }
        });
        return count;
    },
    activeScreens(screens) {
        var active_screens = [];
        screens.forEach(screen => {
            if (events[`screen.update.${screen.id}`] !== undefined) {
                active_screens.push(screen.id);
            }
        });
        return active_screens;
    },
    nrMembers() {
        return (events['member.broadcast'] || []).length;
    },
    getStats() {
        return {
            screens: this.nrScreens(),
            members: this.nrMembers(),
            server: {
                env: process.env.SJ_ENV,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                platform: process.platform,
            }
        };
    }
};