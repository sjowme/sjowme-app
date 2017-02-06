<template>
    <div>

        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">
                    {{$trans('Media %name% bewerken', {name: viewdata.media.name}) }}
                </h2>

            </div>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <a class="uk-button uk-button-danger uk-margin-right" @click="cancel">{{ 'Annuleren' | trans }}</a>
                <a class="uk-button uk-button-success uk-margin-right" @click="upload(false)">{{ 'Opslaan' | trans }}</a>
                <a class="uk-button uk-button-primary" @click="upload(true)">{{ 'Opslaan en sluiten' | trans }}</a>

            </div>
        </div>

        <div class="uk-panel uk-panel-box">

            <media-upload v-ref:uploader target="collection"
                          :media.sync="viewdata.media"
                          :tags="viewdata.tags"
                          :collections="viewdata.collections"
                          parent-component="media-edit"
                          :after-upload="afterUpload"
                          :width="500"></media-upload>

        </div>

    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                close: false,
                config: {filter: {search: '', owner: 0, collection: '', provider: '', type: '', order: 'name asc', limit: 10}, page: 0}
            }
        },

        created() {
            //filter for list view
            if (this.filter) {
                this.config.filter = this.filter;
            }
        },

        methods: {
            upload(close) {
                this.close = close;
                this.$refs.uploader.upload();
            },
            afterUpload(saved) {
                var component = (this.close ? 'media-list' : 'media-edit');
                var command = saved ? (this.close ? 'media.list' : 'media.edit') : 'media.save';

                this.$root.command(component, command, _.assign({media: this.viewdata.media}, this.config));
                this.close = false;
            },
            save() {
                this.$root.command((this.close ? 'media-list' : 'media-edit'), 'media.save', _.assign({
                    media: this.viewdata.media
                }, this.config));
                this.close = false;
            },
            cancel() {
                this.$root.command('media-list', 'media.edit.cancel', _.assign({
                    media: this.viewdata.media
                }, this.config));
            }
        },

        components: {
            'media-upload': require('./ui/media-upload.vue')
        }


    };

</script>