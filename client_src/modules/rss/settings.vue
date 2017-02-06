<template>
    <div class="uk-form uk-form-horizontal-large">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/module-nieuws/"
                       :title="$trans('Meer informatie')"></info-icon>
        </div>

        <div :id="settings_id" class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>

                <div class="uk-form-row">
                    <span class="uk-form-label">{{ 'RSS bronnen' | trans }}</span>
                    <div class="uk-form-controls">
                        <p v-for="provider in config.providers" class="uk-form-controls-condensed">
                            <label><input type="checkbox" v-model="provider.active" class="uk-margin-small-right"/>
                                {{ provider.name }}
                            </label>
                            <span v-if="$key === 'custom' && provider.active" class="uk-display-block uk-margin-small-top">
                                <input type="url" v-model="provider.url" class="uk-form-width-medium"/>
                            </span>
                        </p>
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

    }

</script>