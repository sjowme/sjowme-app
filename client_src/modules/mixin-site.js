
module.exports = {

    props: ['config', 'module', 'slide', 'channel'],

    data() {
        return {
        };
    },

    methods: {
        textClasses(text_config) {
            var classes = [
                text_config.color
            ];
            if (text_config.uppercase) {
                classes.push('uk-text-uppercase');
            }
            if (text_config.bold) {
                classes.push('uk-text-bold');
            }
            return classes.join(' ');
        },
        panelClasses(config) {
            var classes = ['uk-panel'];
            if (config.panel) {
                classes.push(config.panel);
            }
            if (config.opacity < 1) {
                classes.push(`uk-panel-opacity-${(config.opacity * 10)}`);
            }
            return classes.join(' ');
        }

    }

};