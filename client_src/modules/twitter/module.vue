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
                tweets: []
            };
        },

        created() {
            this.getTweets();
        },

        events: {
            'module.response.twitter.getTweets': function (res) {
                this.tweets = res.tweets;
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