<template>
    <div class="uk-form">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

            <h2 class="uk-margin-remove">{{ 'Facturen' | trans }}</h2>

            <div class="uk-margin-left" v-show="selected.length">
                <ul class="uk-grid uk-grid-small uk-flex uk-flex-middle">
                    <li><a class="uk-icon-trash-o uk-icon-hover" title="Delete"
                           data-uk-tooltip="{delay: 500}" @click="removeInvoices"></a>
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
                        <th class="uk-table-width-minimum">{{ 'PDF' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:number="config.filter.order">{{ 'Nummer' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:reference="config.filter.order">{{ 'Referentie' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:created_at="config.filter.order">{{ 'Datum' | trans }}</th>
                        <th class="uk-table-width-200">{{ 'Gebruiker' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:transaction_id="config.filter.order">{{ 'Transactie' | trans }}</th>
                        <th class="uk-table-min-width-100" v-order:total_price="config.filter.order">{{ 'Prijs' | trans }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="check-item" v-for="invoice in viewdata.invoices" :class="{'uk-active': active(invoice)}">
                        <td><input type="checkbox" name="id" value="{{ invoice.id }}" number></td>
                        <td class="uk-text-center">{{ invoice.id }}</td>
                        <td class="uk-text-center">
                            <a class="uk-icon-download" target="_blank" :href="invoice.invoice_download" download=""></a>
                        </td>
                        <td>
                            <a @click="editInvoice(invoice)">{{ invoice.number }}</a>
                        </td>
                        <td>
                            {{ invoice.reference }}
                        </td>
                        <td>
                            {{ invoice.created_at | date }}
                        </td>
                        <td>
                            {{ invoice.user_name || invoice.user_email }}
                        </td>
                        <td>
                            {{ invoice.transaction_id }}
                        </td>
                        <td>
                            {{{ invoice.total_price | formatprice }}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 v-if="(!viewdata.invoices || !viewdata.invoices.length)" class="uk-text-center">{{ 'Geen facturen gevonden' | trans }}</h3>

            <v-pagination :page.sync="config.page" :pages="viewdata.pages" v-show="viewdata.pages > 1"></v-pagination>

        </div>

    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                selected: [],
                config: {filter: {search: '', order: 'number desc', limit: 20}, page: 0}
            }
        },

        created() {
            if (this.filter) {
                this.config.filter = this.filter;
            }
            this.$watch('config.page', this.load, {iminvoicete: false});
            this.$watch('config.filter', (filter) => {
                if (this.config.page) {
                    this.config.page = 0;
                } else {
                    this.load();
                }
                this.$root.saveState(['invoice-list', 'invoice-edit'], filter);
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
                this.$root.command('invoice-list', 'invoice.list', this.config);
            },

            getSelected() {
                return this.viewdata.invoices.filter(function(invoice) { return this.selected.indexOf(invoice.id) !== -1; }, this);
            },

            active(invoice) {
                return this.selected.indexOf(invoice.id) !== -1;
            },

            removeInvoices() {
                UIkit.modal.confirm(this.$trans('Wilt u deze facturen echt definitief verwijderen? Dit kan gevolgen hebben voor de boekhouding en factuurnummering'), () => {
                    this.$root.command('invoice-list', 'invoice.delete.bulk', _.assign({invoices: this.getSelected()}, this.config));
                });
            },

            editInvoice(invoice) {
                this.$root.command('invoice-edit', 'invoice.edit', _.assign({invoice}, this.config));
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }
    };

</script>