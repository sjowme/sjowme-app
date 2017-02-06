var rss_feed = require('./lib/rss_feed');
var select_options = require('../../lib/options');

module.exports = {

    name: 'rss',

    label: 'Nieuws',

    image_url: 'assets/content/modules/rss.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        template: 'list',
        count: 5,
        max_length: 0,
        providers: {
            nunl: {
                active: true,
                name: 'Nu.nl',
                url: 'http://www.nu.nl/rss'
            },
            nosnl: {
                active: true,
                name: 'Nos.nl',
                url: 'http://feeds.nos.nl/nosnieuwsalgemeen'
            },
            telegraaf: {
                active: true,
                name: 'Telegraaf',
                url: 'http://www.telegraaf.nl/rss/'
            },
            fd: {
                active: true,
                name: 'Financieel Dagblad',
                url: 'https://fd.nl/?rss'
            },
            custom: {
                active: false,
                name: 'Aangepaste RSS feed',
                url: ''
            }
        },
        text: {
            color: '',
            size: ''
        }
    },

    fields: {
        config: {
            'template': {
                type: 'select',
                label: 'Template',
                options: {
                    'Lijst': 'list', /*trans*/
                    'Grid': 'grid' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'count': {
                type: 'number',
                label: 'Aantal',
                attrs: {'class': 'uk-form-width-small uk-text-right', min: 0, max: 20}
            },
            'max_length': {
                type: 'number',
                label: 'Maximale tekstlengte',
                attrs: {'class': 'uk-form-width-small uk-text-right', min: 0}
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
        }
    },

    commands: {
        getFeeds(config, params, cb) {
            rss_feed.getFeeds(config.providers, params).then(articles => cb(null, {articles}), err => cb(err));
        }
    }

};