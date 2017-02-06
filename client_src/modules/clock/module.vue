<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <partial :name="config.type"></partial>
    </div>
</template>
<script>

    const digital = require('./lib/digital');
    const analogue = require('./lib/analogue');
    const moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin],

        data() {
            return {
                id: _.uniqueId('clock'),
                clockColors: {
                    'dark': {
                        dColour: '#999',
                        sColour: '#e30712',
                        mColour: '#1b1b1b',
                        hColour: '#1b1b1b',
                    },
                    'light': {
                        dColour: '#d8d8d8',
                        sColour: '#fbfbfb',
                        mColour: '#efefef',
                        hColour: '#efefef',
                    }
                }
            };
        },

        ready() {
            this.setClock();
            this.$watch('config.type', () => this.setClock());
        },

        methods: {
            setClock() {
                analogue.stopClock(this.id);
                digital.stopClock(this.id);
                if (this.config.type === 'analogue') {

                    analogue.startClock(this.id, {});
                }
                if (this.config.type === 'digital') {
                    digital.startClock(this.id, {
                        format: this.config.digital.format
                    })
                }
            }
        },

        partials: {
            'analogue': require('./templates/analogue.html'),
            'digital': require('./templates/digital.html')
        }

    }

</script>