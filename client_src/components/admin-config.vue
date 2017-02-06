<template>
    <div class="uk-form">

        <h2>{{ 'Configuratie' | trans }}</h2>

        <div class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <div class="ukpanel uk-panel-box">
                    <h3 class="uk-panel-title">{{ 'Collecties' | trans }}</h3>

                    <config-collecties v-if="loaded" :items.sync="viewdata.configs.collections.collections"
                                       key="collections"
                                       :label="$trans('Collectie bewerken')"></config-collecties>

                </div>
                <div class="ukpanel uk-margin uk-panel-box">

                    <h3 class="uk-panel-title">{{ 'Sjow categorieën' | trans }}</h3>

                    <config-collecties v-if="loaded" :items.sync="viewdata.configs.categories.categories"
                                       key="categories"
                                       :label="$trans('Categorie bewerken')"></config-collecties>

                </div>
            </div>
            <div>
                <div class="ukpanel uk-panel-box uk-form-horizontal">
                    <div class="uk-flex uk-flex-middle uk-flex-space-between">
                        <h3 class="uk-panel-title uk-margin-remove uk-flex-item-1">{{ 'Algemeen' | trans }}</h3>
                        <button type="button" class="uk-button uk-button-primary uk-button-small" @click="save('general')">
                            <i class="uk-icon-save"></i>
                        </button>
                    </div>

                    <div v-if="loaded" class="uk-form-row uk-margin">
                        <label class="uk-form-label">{{ 'Standaard Sjow' | trans }}</label>
                        <div class="uk-form-controls">
                            <select v-model="viewdata.configs.general.default_channel" class="uk-form-width-large">
                                <option v-for="channel in viewdata.default_channels" :value="channel.id">
                                    {{ channel.category }} - {{ channel.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div v-if="loaded" class="uk-form-row uk-margin">
                        <label class="uk-form-label">{{ 'Demo Sjow' | trans }}</label>
                        <div class="uk-form-controls">
                            <select v-model="viewdata.configs.general.demo_channel" class="uk-form-width-large">
                                <option v-for="channel in viewdata.default_channels" :value="channel.id">
                                    {{ channel.category }} - {{ channel.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <fields v-if="loaded" :model.sync="viewdata.configs.general" :config="$options.fields.general" template="formrow"></fields>

                </div>

                <div class="ukpanel uk-margin uk-panel-box">
                    <h3 class="uk-panel-title">{{ 'Abonnementen' | trans }}</h3>

                    <config-abonnementen v-if="loaded" :data.sync="viewdata.configs.abonnementen"></config-abonnementen>

                </div>
            </div>
        </div>

    </div>
</template>
<script>

    var default_general = {
        default_channel: 0,
        vat_perc: 21
    };

    module.exports = {

        props: ['viewdata', 'filter'],

        events: {
            'socket.data': function (command, component, data) {
                if (command === 'initial') {
                    this.viewdata.configs.collections = this.viewdata.configs.collections || {collections: []};
                    this.viewdata.configs.categories = this.viewdata.configs.categories || {categories: []};
                    this.viewdata.configs.abonnementen = this.viewdata.configs.abonnementen || {abonnementen: []};
                    this.viewdata.configs.general = _.defaultsDeep(this.viewdata.configs.general, default_general);
                    this.loaded = true;
                }
                return true;
            }
        },

        data() {
            return {
                loaded: false
            };
        },

        methods: {
            save(name) {
                this.$root.command('admin-config', 'config.save', {name, data: this.viewdata.configs[name]});
            }
        },

        components: {
            'config-collecties': require('./ui/config-collecties.vue'),
            'config-abonnementen': require('./ui/config-abonnementen.vue')
        },

        fields: {
            general: {
                'vat_perc': {
                    type: 'number',
                    label: 'BTW percentage (%)',
                    attrs: {class: 'uk-form-width-small uk-text-right', min: '0', step: '0.01'}
                }
            }
        }

    };

</script>