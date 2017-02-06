<template>
    <div class="uk-form uk-form-horizontal">

        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/twitter"
                       :title="$trans('Meer informatie over deze module')"></info-icon>
        </div>

        <div :id="settings_id" class="uk-margin uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>
                <fields :model.sync="config" :config="module.fields.config" template="formrow"></fields>


            </div>
        </div>

    </div>
</template>
<script>

    var moduleMixin = require('../mixin-settings');

    module.exports = {

        mixins: [moduleMixin],

        data() {
            return {
                count: 0
            };
        },

        ready() {
        },

        events: {
            'module.response.twitter.getTweets': function (res) {
                this.tweets = res.tweets;
            }
        },

        watch: {
            'config.search_term + config.count': function() {
                this.$parent.moduleCommand('twitter', 'getTweets', {search_term: this.config.search_term, count: this.config.count});
            }
        }

    };

</script>