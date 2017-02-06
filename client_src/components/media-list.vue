<template>
    <div class="uk-form">
        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">{{ 'Media' | trans }}</h2>

                <div class="uk-margin-left" v-show="selected.length">
                    <ul class="uk-grid uk-grid-small uk-flex uk-flex-middle">
                        <li><a class="uk-icon-trash-o uk-icon-hover" title="Delete"
                               data-uk-tooltip="{delay: 500}" @click="removeMedias"></a>
                        </li>
                    </ul>
                </div>
                <div id="user-ac" class="uk-margin-left">
                    <user-autocomplete :model.sync="config.filter.owner"
                                       inputclass="uk-form-blank"
                                       justify="#user-ac"
                                       :placeholder="$trans('Selecteer gebruiker')"></user-autocomplete>
                </div>
                <div class="uk-form-icon uk-margin-left">
                    <i class="uk-icon-search"></i>
                    <input type="text" v-model="config.filter.search" class="uk-form-width-medium uk-form-blank" debounce="300">
                </div>

            </div>
            <div class="uk-flex" data-uk-margin>

                <button type="button" class="uk-button uk-button-primary" @click="addMedia">{{ 'Nieuwe media' | trans }}</button>

            </div>
        </div>

        <div class="uk-panel uk-panel-box">

            <div class="uk-margin uk-overflow-container">
                <table class="uk-table uk-table-hover uk-table-middle uk-form">
                    <thead>
                    <tr>
                        <th class="uk-table-width-minimum"><input type="checkbox" v-check-all:selected.literal="input[name=id]" number></th>
                        <th class="uk-table-width-minimum">{{ 'ID' | trans }}</th>
                        <th class="uk-table-min-width-200"></th>
                        <th class="uk-table-min-width-200" v-order:name="config.filter.order">{{ 'Naam' | trans }}</th>
                        <th class="uk-table-width-150">
                            <input-filter :title="$trans('Collectie')" :value.sync="config.filter.collection" :options="collectionOptions"></input-filter>
                        </th>
                        <th class="uk-table-width-150">{{ 'Tags' | trans }}</th>
                        <th class="uk-table-width-100">
                            <input-filter :title="$trans('Type')" :value.sync="config.filter.type" :options="typeOptions"></input-filter>
                        </th>
                        <th class="uk-table-width-100">
                            <input-filter :title="$trans('Herkomst')" :value.sync="config.filter.provider" :options="providerOptions"></input-filter>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="check-item" v-for="media in viewdata.medias" :class="{'uk-active': active(media)}">
                        <td><input type="checkbox" name="id" value="{{ media.id }}" number></td>
                        <td class="uk-text-center">{{ media.id }}</td>
                        <td class="uk-text-center">
                            <a v-if="media.image_url" :href="media.image_url" data-uk-lightbox="group:'adminlist'">
                                <img style="height: 50px" :src="media.image_url" :alt="media.name">
                            </a>
                        </td>
                        <td>
                            <a @click="editMedia(media)">{{ media.name || 'Onbekend' }}</a>
                        </td>
                        <td>
                            {{ getCollectionLabel(media.collection) || media.user_name || `Gebruiker ${media.owner}` }}
                        </td>
                        <td>
                            <div v-if="media.tags.length" class="uk-flex uk-flex-wrap" data-uk-margin="">
                                <div v-for="tag in media.tags" class="uk-badge uk-margin-small-right">{{ tag }}</div>
                            </div>
                        </td>
                        <td>
                            {{ media.type  }}
                        </td>
                        <td>
                            {{ media.provider }}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 v-if="(!viewdata.medias || !viewdata.medias.length)" class="uk-text-center">{{ 'Geen media gevonden' | trans }}</h3>

            <v-pagination :page.sync="config.page" :pages="viewdata.pages" v-show="viewdata.pages > 1"></v-pagination>

        </div>

    </div>
</template>
<script>

    var default_media = require('../../app/database/defaults').media;

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                selected: [],
                config: {filter: {search: '', owner: 0, collection: '', provider: '', type: '', order: 'name asc', limit: 10}, page: 0},
                providerOptions: [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: [
                    {value: 'local', text: 'Lokaal'}
                ] }],
                typeOptions: [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: [
                    {value: 'image', text: 'Afbeelding'},
                    {value: 'video', text: 'Video'}
                ] }]
            }
        },

        created() {
            if (this.filter) {
                this.config.filter = this.filter;
            }
            this.$watch('config.page', this.load, {immediate: false});
            this.$watch('config.filter', (filter) => {
                if (this.config.page) {
                    this.config.page = 0;
                } else {
                    this.load();
                }
                this.$root.saveState(['media-list', 'media-edit'], filter);
            }, {deep: true});
        },

        computed: {
            collectionOptions() {
                if (!this.viewdata.collections) {
                    return [];
                }
                var options = this.viewdata.collections.map(collection => {
                    return {value: collection.name, text: collection.label};
                });
                return [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: options}]
            }
        },

        methods: {
            load() {
                this.selected = [];
                this.$root.command('media-list', 'media.list', this.config);
            },

            getSelected() {
                return this.viewdata.medias.filter(function(media) { return this.selected.indexOf(media.id) !== -1; }, this);
            },

            active(media) {
                return this.selected.indexOf(media.id) !== -1;
            },

            removeMedias() {
                UIkit.modal.confirm(this.$trans('Wilt u deze media definitief verwijderen?'), () => {
                    this.$root.command('media-list', 'media.delete.bulk', _.assign({medias: this.getSelected()}, this.config));
                });
            },

            addMedia() {
                this.editMedia(_.assign({}, default_media))
            },

            editMedia(media) {
                this.$root.command('media-edit', 'media.edit', _.assign({media}, this.config));
            },
            getCollectionLabel(collection_name) {
                if (!collection_name) {
                    return false;
                }
                var item = _.find(this.viewdata.collections, {name: collection_name});
                return item ? item.label : collection_name;
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }
    };

</script>