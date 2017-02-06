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
                interval: 0,
                tweets: []
            };
        },

        ready() {
            if (config.search_term) {
                this.interval = setInterval(this.getTweets, (15 * 60 * 1000));
                this.getTweets();
            }
        },

        destroyed() {
            clearInterval(this.interval);
        },

        events: {
            'module.response.twitter.getTweets': function (res) {
                this.tweets = res.tweets;
            }
        },

        watch: {
            'config.search_term + config.count': function() {
                this.getWeather();
            }
        },

        methods: {
            getTweets() {
                this.$parent.moduleCommand('twitter', 'getTweets', {search_term: this.config.search_term, count: this.config.count});
            }
        },

        partials: {
            'list': require('./templates/list.html')
        }

    }

</script>