var select_options = require('../../lib/options');

module.exports = {

    name: 'clock',

    label: 'Klok',

    image_url: 'assets/content/modules/clock.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        type: 'analogue',
        analogue: {
            type: 'simple',
            theme: 'dark'
        },
        digital: {
            format: '24h',
            theme: 'dark'
        },
        text: {
            size: 'large'
        }
    },

    fields: {
        config: {
            'type': {
                type: 'select',
                label: 'Type klok',
                options: {
                    'Analoog': 'analogue', /*trans*/
                    'Digitaal': 'digital' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'text.size': {
                type: 'select',
                label: 'Grootte',
                options: select_options.text_size,
                attrs: {'class': 'uk-form-width-medium'}
            }

        },
        analogue_config: {
            'analogue.type': {
                type: 'select',
                label: 'Thema',
                options: {
                    'Eenvoudig': 'simple', /*trans*/
                    'Stationsklok': 'station', /*trans*/
                    'iOS 7 stijl': 'ios7' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'analogue.theme': {
                type: 'select',
                label: 'Thema',
                options: {
                    'Donker': 'dark', /*trans*/
                    'Licht': 'light' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
        },
        digital_config: {
            'digital.format': {
                type: 'select',
                label: 'Tijdsformaat',
                options: {
                    '24 uurs': '24h', /*trans*/
                    '12 uurs': '12h' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'digital.theme': {
                type: 'select',
                label: 'Thema',
                options: {
                    'Donker': 'dark', /*trans*/
                    'Licht': 'light' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            }
        }
    }
};