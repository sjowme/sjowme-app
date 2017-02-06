<template>
    <div class="uk-form">
        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">{{ 'Sjows' | trans }}</h2>

                <div class="uk-margin-left" v-show="selected.length">
                    <ul class="uk-grid uk-grid-small uk-flex uk-flex-middle">
                        <li><a class="uk-icon-trash-o uk-icon-hover" title="Delete"
                               data-uk-tooltip="{delay: 500}" @click="removeChannels"></a>
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
            <div>

                <a class="uk-button uk-button-primary" @click="addChannel">{{ 'Nieuwe sjow' | trans }}</a>

            </div>
        </div>

        <div class="uk-panel uk-panel-box">

            <div class="uk-margin uk-overflow-container">
                <table class="uk-table uk-table-hover uk-table-middle uk-form">
                    <thead>
                    <tr>
                        <th class="pk-table-width-minimum"><input type="checkbox" v-check-all:selected.literal="input[name=id]" number></th>
                        <th class="pk-table-width-minimum">{{ 'ID' | trans }}</th>
                        <th class="pk-table-min-width-200" v-order:name="config.filter.order">{{ 'Naam' | trans }}</th>
                        <th class="pk-table-width-200"></th>
                        <th class="uk-table-width-150">
                            <input-filter :title="$trans('Categorie')" :value.sync="config.filter.category" :options="categoryOptions"></input-filter>
                        </th>
                        <th class="pk-table-width-200">{{ 'Eigenaar' | trans }}</th>
                        <th class="pk-table-min-width-150" v-order:updated_at="config.filter.order">{{ 'Laatst gewijzigd' | trans }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="check-item" v-for="channel in viewdata.channels" :class="{'uk-active': active(channel)}">
                        <td><input type="checkbox" name="id" :value="channel.id" number></td>
                        <td class="uk-text-center">{{ channel.id }}</td>
                        <td>
                            <a @click="editChannel(channel)">{{ channel.name || $trans('Naamloos') }}</a>
                        </td>
                        <td>
                        </td>
                        <td>
                            {{ getCategoryLabel(channel.category) }}
                        </td>
                        <td>
                            <a :href="$root.member_url + '/demo/' + channel.id" target="_blank"><i class="uk-icon-tv"></i></a>
                            {{ channel.owner ? channel.user_name || `Gebruiker ${channel.owner}` : 'Standaard sjow' | trans }}
                        </td>
                        <td>
                            {{ channel.updated_at | datetime }}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 v-if="(!viewdata.channels || !viewdata.channels.length)" class="uk-text-center">{{ 'Geen sjows gevonden' | trans }}</h3>

            <v-pagination :page.sync="config.page" :pages="viewdata.pages" v-show="viewdata.pages > 1"></v-pagination>

        </div>

    </div>
</template>
<script>


    var default_channel = require('../../app/database/defaults').channel;

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                selected: [],
                config: {filter: {search: '', category: '', owner: 0, order: 'name asc', limit: 20}, page: 0},
                list_component: ''
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
                this.$root.saveState(['channel-list', 'channel-edit'], filter);
            }, {deep: true});
        },

        computed: {
            categoryOptions() {
                if (!this.viewdata.categories) {
                    return [];
                }
                var options = this.viewdata.categories.map(item => {
                    return {value: item.name, text: item.label};
                });
                return [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: options}]
            }
        },

        methods: {
            load() {
                this.selected = [];
                this.$root.command('channel-list', 'channel.list', this.config);
            },

            getSelected() {
                return this.viewdata.channels.filter(function(channel) { return this.selected.indexOf(channel.id) !== -1; }, this);
            },

            active(channel) {
                return this.selected.indexOf(channel.id) !== -1;
            },

            removeChannels() {
                UIkit.modal.confirm(this.$trans('Wilt u deze sjows definitief verwijderen?'), () => {
                    this.$root.command('channel-list', 'channel.delete.bulk', _.assign({channels: this.getSelected()}, this.config));
                });
            },
            addChannel() {
                this.editChannel(_.assign({}, default_channel))
            },
            editChannel(channel) {
                this.$root.command('channel-edit', 'channel.edit', _.assign({channel}, this.config));
            },
            getCategoryLabel(category_name) {
                if (!category_name) {
                    return 'Gebruiker sjow';
                }
                var item = _.find(this.viewdata.categories, {name: category_name});
                return item ? item.label : category_name;
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }

    };

</script>