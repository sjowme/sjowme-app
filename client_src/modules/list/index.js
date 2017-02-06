var select_options = require('../../lib/options');

module.exports = {

    name: 'list',

    label: 'Lijst met teksten',

    image_url: 'assets/content/modules/list.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        text: {
            color: '',
            size: ''
        },
        items: []
    },

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
            },
            'text.uppercase': {
                type: 'checkbox',
                optionlabel: 'In hoofdletters'
            },
            'text.bold': {
                type: 'checkbox',
                optionlabel: 'Dikgedrukt'
            }

        }
    }
};