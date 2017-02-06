
var select_options = require('../../lib/options');
var counters = {};

module.exports = {

    name: 'ticketcounter',

    label: 'Volgnummer',

    image_url: 'assets/content/modules/ticketcounter.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        template: 'counter',
        text: {
            color: '',
            size: ''
        }
    },

    channel: 'module-ticketcounter-channel',

    fields: {
        config: {
            'text.color': {
                type: 'select',
                label: 'Tekstkleur',
                options: select_options.text_color,
                attrs: {'class': 'uk-form-width-medium'}
            },
            'text.size': {
                type: 'select',
                label: 'Tekstgrootte',
                options: select_options.text_size,
                attrs: {'class': 'uk-form-width-medium'}
            }
        },
        advanced_1: {
        }
    },

    commands: {
        getCounter(config, params, cb) {
            return cb(null, {count: counters[params.channel_id] || 1});
        },
        setCounter(config, params, cb) {
            counters[params.channel_id] = params.count;
            return cb(null, {count: params.count, broadcast: params.channel_id});
        }
    }
};