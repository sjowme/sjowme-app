<template>
    <div>

        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">
                    {{$trans('Factuur %number% bewerken', {number: viewdata.invoice.number}) }}
                </h2>

            </div>

            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <a class="uk-button uk-margin-right" target="_blank" :href="viewdata.invoice.invoice_download" download="">
                    {{ 'Downloaden' | trans }}</a>
                <a class="uk-button uk-button-danger uk-margin-right" @click="cancel">{{ 'Annuleren' | trans }}</a>
                <a class="uk-button uk-button-success uk-margin-right" @click="save(false)">{{ 'Opslaan' | trans }}</a>
                <a class="uk-button uk-button-primary" @click="save(true)">{{ 'Opslaan en sluiten' | trans }}</a>

            </div>
        </div>

        <div class="uk-panel uk-panel-box uk-form">

            <div class="uk-grid" data-uk-grid-margin>
                <div class="uk-width-medium-2-3 uk-form-horizontal">

                    <h3>{{ 'Gegevens' | trans }}</h3>

                    <div class="uk-form-row">
                        <label for="invoice_number" class="uk-form-label">{{ 'Nummer' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="invoice_number" class="uk-form-width-large uk-form-blank"
                                   v-model="viewdata.invoice.number"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_reference" class="uk-form-label">{{ 'Referentie' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="invoice_reference" class="uk-form-width-large"
                                   v-model="viewdata.invoice.reference"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Gebruiker' | trans }}</label>
                        <div class="uk-form-controls">
                            <div id="user-ac">
                                <user-autocomplete :model.sync="viewdata.invoice.user_id"
                                                   inputclass="uk-width-1-1 uk-form-blank"
                                                   justify="#user-ac"
                                                   :placeholder="$trans('Selecteer gebruiker')"></user-autocomplete>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_created_at" class="uk-form-label">{{ 'Datum' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="invoice_created_at" class="uk-form-width-large  uk-form-blank"
                                   v-model="viewdata.invoice.created_at"/>
                        </div>
                    </div>


                    <div>
                        <iframe :src="viewdata.invoice.invoice_url" class="uk-responsive-width uk-width-1-1" style="min-height: 600px"></iframe>
                    </div>

                </div>
                <div class="uk-width-medium-1-3 uk-form-stacked">

                    <h3>{{ 'Detail' | trans }}</h3>

                    <div class="uk-form-row">
                        <label for="invoice_vat_perc" class="uk-form-label">{{ 'BTW percentage' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-icon">
                                <i class="uk-icon-euro"></i>
                                <input type="number" id="invoice_vat_perc" class="uk-form-width-small uk-form-blank uk-text-right"
                                       v-model="viewdata.invoice.vat_perc" min="1" step="0.01" number/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_net_price" class="uk-form-label">{{ 'Netto' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-icon">
                                <i class="uk-icon-euro"></i>
                                <input type="number" id="invoice_net_price" class="uk-form-width-small uk-form-blank uk-text-right"
                                       v-model="viewdata.invoice.net_price" min="1" step="0.01" number/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_vat_amount" class="uk-form-label">{{ 'BTW bedrag' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-icon">
                                <i class="uk-icon-euro"></i>
                                <input type="number" id="invoice_vat_amount" class="uk-form-width-small uk-form-blank uk-text-right"
                                       v-model="viewdata.invoice.vat_amount" min="1" step="0.01" number/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_total_price" class="uk-form-label">{{ 'Totaal' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-icon">
                                <i class="uk-icon-euro"></i>
                                <input type="number" id="invoice_total_price" class="uk-form-width-small uk-form-blank uk-text-right"
                                       v-model="viewdata.invoice.total_price" min="1" step="0.01" number/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="invoice_transaction_id" class="uk-form-label">{{ 'Transactie ID' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="invoice_transaction_id" class="uk-form-width-small uk-form-blank"
                                   v-model="viewdata.invoice.transaction_id"/>
                        </div>
                    </div>

                    <div v-if="viewdata.invoice.transaction_id" class="uk-margin uk-panel uk-panel-box uk-panel-box-primary">
                        <h3 class="uk-panel-title">{{ 'Transactie' | trans }}</h3>

                        <dl>
                            <dt>{{ 'ID' | trans }}</dt>
                            <dd>{{ viewdata.invoice.transaction.id }}</dd>
                            <dt>{{ 'status' | trans }}</dt>
                            <dd>{{ viewdata.invoice.transaction.status }}</dd>
                            <dt>{{ 'Methode' | trans }}</dt>
                            <dd>{{ viewdata.invoice.transaction.method }}</dd>
                            <dt>{{ 'Datum' | trans }}</dt>
                            <dd>{{ viewdata.invoice.transaction.datetime | datetime }}</dd>
                        </dl>
                    </div>


                </div>
            </div>

        </div>

    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata', 'filter'],

        data() {
            return {
                config: {filter: {search: '', order: 'number desc', limit: 20}, page: 0}
            }
        },

        created() {
            //filter for list view
            if (this.filter) {
                this.config.filter = this.filter;
            }
        },

        methods: {
            save(close) {
                this.$root.command((close ? 'invoice-list' : 'invoice-edit'), 'invoice.save', _.assign({
                    invoice: this.viewdata.invoice
                }, this.config));
            },
            cancel() {
                this.$root.command('invoice-list', 'invoice.edit.cancel', _.assign({
                    invoice: this.viewdata.invoice
                }, this.config));
            }
        },

        computed: {
            invoiceStatus() {
                var now = new Date();
                if (new Date(this.viewdata.invoice.starts_at) > now) {
                    return {text: this.$trans('Toekomstig'), cls: 'warning'};
                }
                if (new Date(this.viewdata.invoice.expires_at) < now) {
                    return {text: this.$trans('Verlopen'), cls: 'danger'};
                }
                return {text: this.$trans('Actief'), cls: 'success'};
            },
            invoiceDuration() {
                var periods = {
                    day: ['dag', 'dagen'],
                    week: ['week', 'weken'],
                    month: ['maand', 'maanden'],
                    year: ['jaar', 'jaren']
                }, period = this.viewdata.invoice.data.period;
                return this.$transChoice(
                        `{1} %duration% ${periods[period][0]}|]1,Inf[ %duration% ${periods[period][1]}`,
                        this.viewdata.invoice.data.duration, {duration: this.viewdata.invoice.data.duration}
                );
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }


    };

</script>