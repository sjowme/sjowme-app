var default_file = require('../../lib/utils').file;
var select_options = require('../../lib/options');

module.exports = {

    name: 'logo',

    label: 'Logo',

    image_url: 'assets/content/modules/logo.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        image: default_file,
        image_size: '',
        text: {
            color: '',
            size: ''
        }
    },

    fields: {
        config: {
            'image_size': {
                type: 'select',
                label: 'Breedte logo',
                options: {
                    'Volledig': '', /*trans*/
                    '50%': 'uk-width-1-2', /*trans*/
                    '33%': 'uk-width-1-3', /*trans*/
                    '25%': 'uk-width-1-4' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
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
    }
};