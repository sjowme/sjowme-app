<template>
    <div class="uk-form uk-form-horizontal-large">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/module-lijst-met-teksten/"
                       :title="$trans('Meer informatie')"></info-icon>
            <module-advanced :settings_id="settings_id" class="uk-margin-left">

                <div class="uk-grid" dat-uk-observe>
                    <div class="uk-width-medium-1-3">
                        <ul class="uk-tab uk-tab-left" v-el:tabs>
                            <li v-for="item in config.items">
                                <a class="uk-text-truncate">{{ item.title || 'Item ' + ($index + 1) }}</a>
                            </li>
                        </ul>
                        <p>
                            <button type="button" class="uk-button uk-button-small" @click="add"><i
                                    class="uk-icon-plus uk-margin-small-right"></i>{{ 'Item toevoegen' | trans }}</button>
                        </p>
                    </div>
                    <div class="uk-width-medium-2-3">
                        <ul :id="'tabs-' + settings_id" class="uk-switcher">
                            <li v-for="item in config.items">

                                <div class="uk-form-row">
                                    <span class="uk-form-label">{{ 'Titel' | trans }}</span>
                                    <div class="uk-form-controls uk-flex uk-flex-middle">
                                        <input type="text" v-model="item.title" class="uk-form-width-large">
                                        <a v-if="config.items.length > 1" class="uk-margin-left" @click="remove(item)">
                                            <i class="uk-icon-trash-o"></i>
                                        </a>
                                    </div>
                                </div>

                                <div class="uk-form-row">
                                    <span class="uk-form-label">{{ 'Inhoud' | trans }}</span>
                                    <div class="uk-form-controls">
                                        <textarea v-model="item.content" class="uk-form-width-large" cols="30" rows="8"></textarea>
                                    </div>
                                </div>

                            </li>
                        </ul>
                    </div>
                </div>

            </module-advanced>
        </div>

        <div :id="settings_id" class="uk-margin uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>
                <p><em>{{ 'Klik op "meer opties" om de teksten in te voeren.' | trans }}</em></p>
                <fields :model.sync="config" :config="module.fields.config" template="formrow"></fields>

            </div>
        </div>

    </div>
</template>
<script>

    var moduleMixin = require('../mixin-settings');

    module.exports = {

        mixins: [moduleMixin],

        ready() {
            this.tabs = UIkit.tab(this.$els.tabs, {connect: `#tabs-${this.settings_id}`});
            if (this.config.items.length === 0) {
                this.add();
            }
        },

        methods: {
            add() {
                this.config.items.push({
                    title: '',
                    content: ''
                });
                this.$nextTick(() => {
                    this.tabs.switcher.show((this.config.items.length - 1));
                });
            },
            remove(item) {
                this.config.items.$remove(item)
            }
        }

    }

</script>