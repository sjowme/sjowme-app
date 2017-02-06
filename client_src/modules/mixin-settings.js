var select_options = require('../lib/options');

module.exports = {

    props: ['config', 'active', 'module', 'slide', 'channel'],

    data() {
        return {
            settings_id: `settings-${this.module.name}`
        };
    },

    watch: {
        'active': function (active) {
            this.$parent.toggleModule(active);
        }
    },

    basic_fields: {
        'title': {
            type: 'text',
            label: 'Titel',
            attrs: {'class': 'uk-form-width-large'}
        },
        'panel': {
            type: 'select',
            label: 'Kader',
            options: select_options.panel_style,
            attrs: {'class': 'uk-form-width-medium'}
        },
        'opacity': {
            type: 'range',
            label: 'Doorschijnend',
            attrs: {'class': 'uk-form-width-medium', 'min': 0.1, 'max': 1, 'step': 0.1}
        },
        'fullwidth': {
            type: 'checkbox',
            label: 'Volle breedte'
        }
    },

    partials: {
        'module-settings': require('../partials/module-settings.html'),
        'module-advanced': require('../partials/module-advanced.html')
    },

    components: {
        'module-advanced': require('../components/ui/module-advanced.vue'),
        'module-position': require('../components/ui/module-position.vue')
    }

};