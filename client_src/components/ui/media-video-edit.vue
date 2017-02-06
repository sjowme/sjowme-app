<template>

    <div class="uk-form">

        <div class="uk-form-row">
            <label class="uk-form-label">{{ 'Videolink' | trans }}</label>
            <div class="uk-form-controls">
                <input type="text" class="uk-form-width-large" v-model="media.data.url" debounce="500"/>
                <p class="uk-form-help-block">
                    <i class="uk-icon-vimeo uk-margin-small-right"></i>
                    <i class="uk-icon-youtube uk-margin-small-right"></i>
                    {{ 'Plak de link van een Vimeo of Youtube video in bovenstaand invulveld' | trans }}
                </p>
            </div>
        </div>

        <div v-if="media.data.poster" class="uk-margin uk-text-center">
            <img :src="media.data.poster" :alt="media.name"/>
        </div>
    </div>

</template>
<script>

    var video = require('../../lib/video')(UIkit);

    module.exports = {

        props: {
            media: Object
        },

        data() {
            return {
            }
        },

        created() {
        },

        methods: {
        },

        watch: {
            'media.data.url': function (value) {

                video.getInfo(this.media, value).then(media => {
                    console.log(media)
                });
            }
        }

    };
</script>