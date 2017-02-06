var select_options = require('../../lib/options');

module.exports = {

    name: 'iframe',

    label: 'Embed site',

    image_url: 'assets/content/modules/iframe.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        fullwidth: false,
        iframe_width: 'uk-width-1-1',
        src: '',
        text: {
            color: '',
            size: ''
        }
    },

    fields: {
        config: {
            'src': {
                type: 'text',
                label: 'Adres webpagina',
                attrs: {'class': 'uk-form-width-large'}
            },
            'iframe_width': {
                type: 'select',
                label: 'Breedte iframe',
                options: {
                    'Volledig': 'uk-width-1-1', /*trans*/
                    '50%': 'uk-width-1-2', /*trans*/
                    '33%': 'uk-width-1-3', /*trans*/
                    '25%': 'uk-width-1-4' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            }
        }
    }
};