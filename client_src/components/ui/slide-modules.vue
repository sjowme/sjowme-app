<template>

    <div>
        <component :is="component"
                   :config.sync="current_module.config"
                   :active="active"
                   :module="module"
                   :channel="channel"
                   :slide="slide"></component>
    </div>

</template>
<script>


    module.exports = {

        props: {
            'current_module': {type: Object},
            'slide': Object,
            'channel': Object,
            'model': Array,
            'modules': Array
        },

        computed: {
            component() {
                return `module-${this.current_module.name}`;
            },
            module() {
                return _.find(this.modules, {name: this.current_module.name});
            },
            active() {
                var active = _.find(this.model, {name: this.current_module.name});
                return !!active;
            }
        },

        methods: {
            toggleModule(active) {
                if (active) {
                    this.model.push(this.current_module);
                } else {
                    this.model.$remove(this.current_module);
                }
            },
            moduleCommand(module, command, data) {
				var dt = Date();
                console.log(`module.command: send ${command} for ${(module)} at(slide-modules.vue) ` + dt);
                var moduleObj = _.find(this.model, {name: module}) ||  _.find(this.modules, {name: module});
                this.$root.socket.emit('module.command', module, command, moduleObj.config, data);
            }
        },

        components: {
            'module-logo': require('../../modules/logo/settings.vue'),
            'module-list': require('../../modules/list/settings.vue'),
            'module-weather': require('../../modules/weather/settings.vue'),
            'module-iframe': require('../../modules/iframe/settings.vue'),
            'module-twitter': require('../../modules/twitter/settings.vue'),
            'module-clock': require('../../modules/clock/settings.vue'),
            'module-rss': require('../../modules/rss/settings.vue'),
            'module-ticketcounter': require('../../modules/ticketcounter/settings.vue'),
        }

    };

</script>