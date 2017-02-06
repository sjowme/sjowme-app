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
                articles: []
            };
        },

        created() {
            this.getFeeds()
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

        methods: {
            getFeeds() {
                this.$parent.moduleCommand('rss', 'getFeeds', {count: this.config.count, max_length: this.config.max_length});
            }
        },

        computed: {
            gridClass() {
                if (this.config.count < 11) {
                    return `uk-grid-width-1-${this.config.count}`;
                }
                return `uk-grid-width-1-10`;
            }
        },

        partials: {
            'grid': require('./templates/grid.html'),
            'list': require('./templates/list.html')
        }

    }

</script>