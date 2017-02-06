<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <partial :name="config.template"></partial>
    </div>
</template>
<script>

    const moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin],

        data() {
            return {
                interval: 0,
                articles: []
            };
        },

        ready() {
            if (this.config.count) {
                this.interval = setInterval(this.getFeeds, (15 * 60 * 1000));
                this.getFeeds();
            }
        },

        destroyed() {
            clearInterval(this.interval);
        },

        computed: {
            gridClass() {
                if (this.config.count < 11) {
                    return `uk-grid-width-1-${this.config.count}`;
                }
                return `uk-grid-width-1-10`;
            }
        },

        events: {
            'module.response.rss.getFeeds': function (res) {
                if (res.error) {
                    UIkit.notify(res.error, 'danger');
                } else {
                    this.articles = res.articles
                }
            }
        },

        watch: {
            this.getFeeds();
        },

        methods: {
            getFeeds() {
                this.$parent.moduleCommand('rss', 'getFeeds', {count: this.config.count, max_length: this.config.max_length});
            }
        },

        partials: {
            'grid': require('./templates/grid.html'),
            'list': require('./templates/list.html')
        }

    }

</script>