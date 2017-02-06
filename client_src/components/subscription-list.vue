<template>
    <div class="uk-form">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

            <h2 class="uk-margin-remove">{{ 'Abonnementen' | trans }}</h2>

            <div class="uk-margin-left" v-show="selected.length">
                <ul class="uk-grid uk-grid-small uk-flex uk-flex-middle">
                    <li><a class="uk-icon-trash-o uk-icon-hover" title="Delete"
                           data-uk-tooltip="{delay: 500}" @click="removeSubscriptions"></a>
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

        <div class="uk-panel uk-panel-box">

            <div class="uk-margin uk-overflow-container">
                <table class="uk-table uk-table-hover uk-table-middle uk-form">
                    <thead>
                    <tr>
                        <th class="uk-table-width-minimum"><input type="checkbox" v-check-all:selected.literal="input[name=id]" number></th>
                        <th class="uk-table-width-minimum">{{ 'ID' | trans }}</th>
                        <th v-order:payed="config.filter.order">{{ 'Betaald' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:name="config.filter.order">{{ 'Naam' | trans }}</th>
                        <th class="uk-table-width-200">{{ 'Gebruiker' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:starts_at="config.filter.order">{{ 'Startdatum' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:expires_at="config.filter.order">{{ 'Einddatum' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:transaction_id="config.filter.order">{{ 'Transactie' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:price="config.filter.order">{{ 'Prijs' | trans }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="check-item" v-for="subscription in viewdata.subscriptions" :class="{'uk-active': active(subscription)}">
                        <td><input type="checkbox" name="id" value="{{ subscription.id }}" number></td>
                        <td class="uk-text-center">{{ subscription.id }}</td>
                        <td class="uk-text-center">
                            <i v-if="subscription.payed" class="uk-icon-check uk-text-success"></i>
                            <i v-else class="uk-icon-ban uk-text-danger"></i>
                        </td>
                        <td>
                            <a @click="editSubscription(subscription)">{{ subscription.name }}</a>
                        </td>
                        <td>
                            {{ subscription.user_name || subscription.user_email }}
                        </td>
                        <td>
                            {{ subscription.starts_at | date }}
                        </td>
                        <td>
                            {{ subscription.expires_at | date }}
                        </td>
                        <td>
                            {{ subscription.transaction_id }}
                        </td>
                        <td>
                            {{{ subscription.price | formatprice }}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 v-if="(!viewdata.subscriptions || !viewdata.subscriptions.length)" class="uk-text-center">{{ 'Geen abonnementen gevonden' | trans }}</h3>

            <v-pagination :page.sync="config.page" :pages="viewdata.pages" v-show="viewdata.pages > 1"></v-pagination>

        </div>

    </div>
</template>
<script>

    var default_subscription = require('../../app/database/defaults').subscription;

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                selected: [],
                config: {filter: {search: '', order: 'expires_at desc', limit: 20}, page: 0}
            }
        },

        created() {
            if (this.filter) {
                this.config.filter = this.filter;
            }
            this.$watch('config.page', this.load, {imsubscriptionte: false});
            this.$watch('config.filter', (filter) => {
                if (this.config.page) {
                    this.config.page = 0;
                } else {
                    this.load();
                }
                this.$root.saveState(['subscription-list', 'subscription-edit'], filter);
            }, {deep: true});
        },

        computed: {
            collectionOptions() {
                var options = this.viewdata.collections.map(collection => {
                    return {value: collection.name, text: collection.label};
                });
                return [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: options}]
            }
        },

        methods: {
            load() {
                this.selected = [];
                this.$root.command('subscription-list', 'subscription.list', this.config);
            },

            getSelected() {
                return this.viewdata.subscriptions.filter(function(subscription) { return this.selected.indexOf(subscription.id) !== -1; }, this);
            },

            active(subscription) {
                return this.selected.indexOf(subscription.id) !== -1;
            },

            removeSubscriptions() {
                UIkit.modal.confirm('Wilt u deze subscription definitief verwijderen?', () => {
                    this.$root.command('subscription-list', 'subscription.delete.bulk', _.assign({subscriptions: this.getSelected()}, this.config));
                });
            },

            addSubscription() {
                this.editSubscription(_.assign({}, default_subscription))
            },

            editSubscription(subscription) {
                this.$root.command('subscription-edit', 'subscription.edit', _.assign({subscription}, this.config));
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }
    };

</script>