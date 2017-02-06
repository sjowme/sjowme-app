<template>
    <div class="uk-form uk-form-horizontal-large">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/module-klok/"
                       :title="$trans('Meer informatie over deze module')"></info-icon>
        </div>

        <div :id="settings_id" class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>
                <fields :model.sync="config" :config="module.fields.config" template="formrow"></fields>

                <fields v-if="config.type === 'analogue'"
                        :model.sync="config" :config="module.fields.analogue_config" template="formrow"></fields>

                <fields v-if="config.type === 'digital'"
                        :model.sync="config" :config="module.fields.digital_config" template="formrow"></fields>

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