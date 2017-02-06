<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <partial :name="config.template"></partial>
    </div>
</template>
<script>

    var moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin],

        data() {
            return {
                count: 0
            };
        },

        created() {
            this.getCounter();
        },

        events: {
            'module.response.ticketcounter.getCounter': function (res) {
                this.count = res.count;
            },
            'module.response.ticketcounter.setCounter': function (res) {
                this.count = res.count;
            }
        },

        methods: {
            getCounter() {
                this.$parent.moduleCommand('ticketcounter', 'getCounter', {channel_id: this.channel.id});
            }
        },

        partials: {
            'counter': require('./templates/counter.html')
        }

    }

</script>