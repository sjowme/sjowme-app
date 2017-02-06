
var twitter = require('./lib/twitter');
var select_options = require('../../lib/options');

module.exports = {

    name: 'twitter',

    label: 'Twitter',

    image_url: 'assets/content/modules/twitter.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        template: 'list',
        count: 5,
        search_term: '',
        text: {
            color: '',
            size: ''
        }
    },

    fields: {
        config: {
            'search_term': {
                type: 'text',
                label: 'Zoekterm',
                attrs: {'class': 'uk-form-width-medium'}
            },
            'count': {
                type: 'number',
                label: 'Aantal tweets',
                attrs: {'class': 'uk-form-width-small uk-text-right', min: 0, max: 30}
            },
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
        getTweets(config, params, cb) {
            if (!params.search_term) {
                return cb(null,  []);
            }
            twitter.search(params.search_term, params.count)
                .then(tweets => cb(null, {tweets}))
                .catch(err => cb(err));
        }
    }
};