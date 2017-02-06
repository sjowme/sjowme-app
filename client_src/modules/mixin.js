
module.exports = {

    watch: {
        'module.active': function (active) {
            this.$parent.toggleModule(active);
        }
    },

    partials: {
        'module-settings': require('../partials/module-settings.html')
    },

    components: {
        'module-position': require('../components/ui/module-position.vue')
    }

};