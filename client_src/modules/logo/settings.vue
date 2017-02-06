<template>
    <div class="uk-form uk-form-horizontal-large">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/module-logo/"
                       :title="$trans('Meer informatie')"></info-icon>
        </div>

        <div :id="settings_id" class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>

                <div class="uk-form-stacked uk-margin">
                    <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Logo' | trans }}</label>
                        <div class="uk-form-controls">
                            <file-upload :file.sync="config.image" target="user"></file-upload>
                        </div>
                    </div>
                </div>

                <fields :model.sync="config" :config="module.fields.config" template="formrow"></fields>

            </div>
        </div>

    </div>
</template>
<script>

    var moduleMixin = require('../mixin-settings');

    module.exports = {

        mixins: [moduleMixin],

        created() {
            if (!this.config.image.path) {
                this.config.image = _.assign({}, this.$root.user.data.logo);
            }
        },

        components: {
            'file-upload': require('../../components/ui/file-upload.vue')
        }

    }

</script>