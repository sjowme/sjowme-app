<template>
    <div>

        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">
                    {{$trans('Abonnement %name% bewerken', {name: viewdata.subscription.name}) }}
                </h2>

            </div>

            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <a class="uk-button uk-button-danger uk-margin-right" @click="cancel">{{ 'Annuleren' | trans }}</a>
                <a class="uk-button uk-button-success uk-margin-right" @click="save(false)">{{ 'Opslaan' | trans }}</a>
                <a class="uk-button uk-button-primary" @click="save(true)">{{ 'Opslaan en sluiten' | trans }}</a>

            </div>
        </div>

        <div class="uk-panel uk-panel-box uk-form">

            <div class="uk-grid" data-uk-grid-margin>
                <div class="uk-width-medium-2-3 uk-form-horizontal">

                    <h3>{{ 'Gegevens' | trans }}</h3>

                    <div class="uk-margin uk-flex uk-flex-space-around">
                        <div class="uk-h3" :class="`uk-text-${subscriptionStatus.cls}`">
                            {{ subscriptionStatus.text }}
                        </div>
                        <div class="uk-h3">{{ subscriptionDuration }}</div>
                    </div>

                    <div class="uk-form-row">
                        <label for="subscription_name" class="uk-form-label">{{ 'Naam' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="subscription_name" class="uk-form-width-large"
                                   v-model="viewdata.subscription.name"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Gebruiker' | trans }}</label>
                        <div class="uk-form-controls">
                            <div id="user-ac">
                                <user-autocomplete :model.sync="viewdata.subscription.owner"
                                                   inputclass="uk-width-1-1"
                                                   justify="#user-ac"
                                                   :placeholder="$trans('Selecteer gebruiker')"></user-autocomplete>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="subscription_starts_at" class="uk-form-label">{{ 'Begindatum' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="subscription_starts_at" class="uk-form-width-large"
                                   v-model="viewdata.subscription.starts_at"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="subscription_expires_at" class="uk-form-label">{{ 'Einddatum' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="subscription_expires_at" class="uk-form-width-large"
                                   v-model="viewdata.subscription.expires_at"/>
                        </div>
                    </div>

                </div>
                <div class="uk-width-medium-1-3 uk-form-stacked">

                    <h3>{{ 'Betaling' | trans }}</h3>

                    <div class="uk-form-row">
                        <label for="subscription_payed" class="uk-form-label">{{ 'Betaald' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-controls-condensed">
                                <input type="checkbox" id="subscription_payed" v-model="viewdata.subscription.payed"/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="subscription_price" class="uk-form-label">{{ 'Prijs' | trans }}</label>
                        <div class="uk-form-controls">
                            <div class="uk-form-icon">
                                <i class="uk-icon-euro"></i>
                                <input type="number" id="subscription_price" class="uk-form-width-small uk-form-blank uk-text-right"
                                       v-model="viewdata.subscription.price" min="1" step="0.01" number/>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label for="subscription_transaction_id" class="uk-form-label">{{ 'Transactie ID' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="subscription_transaction_id" class="uk-form-width-small uk-form-blank"
                                   v-model="viewdata.subscription.transaction_id"/>
                        </div>
                    </div>

                    <div v-if="viewdata.subscription.transaction_id" class="uk-margin uk-panel uk-panel-box uk-panel-box-primary">
                        <div class="uk-panel-badge uk-badge uk-badge-success"><a class="uk-icon-refresh"
                                :title="$trans('Ververs transactie data')" data-uk-tooltip="delay:200"
                                @click="refreshTransaction"></a></div>
                        <h3 class="uk-panel-title">{{ 'Transactie' | trans }}</h3>

                        <dl>
                            <dt>{{ 'ID' | trans }}</dt>
                            <dd>{{ viewdata.subscription.data.transaction.id }}</dd>
                            <dt>{{ 'status' | trans }}</dt>
                            <dd>{{ viewdata.subscription.data.transaction.status }}</dd>
                            <dt>{{ 'Methode' | trans }}</dt>
                            <dd>{{ viewdata.subscription.data.transaction.method }}</dd>
                            <dt>{{ 'Datum' | trans }}</dt>
                            <dd>{{ viewdata.subscription.data.transaction.datetime | datetime }}</dd>
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
                config: {filter: {search: '', order: 'expires_at desc', limit: 20}, page: 0}
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
                this.$root.command((close ? 'subscription-list' : 'subscription-edit'), 'subscription.save', _.assign({
                    subscription: this.viewdata.subscription
                }, this.config));
            },
            cancel() {
                this.$root.command('subscription-list', 'subscription.edit.cancel', _.assign({
                    subscription: this.viewdata.subscription
                }, this.config));
            },
            refreshTransaction() {
                this.$root.command('subscription-edit', 'subscription.transaction.refresh', _.assign({
                    subscription: this.viewdata.subscription
                }, this.config));
            }
        },

        computed: {
            subscriptionStatus() {
                var now = new Date();
                if (new Date(this.viewdata.subscription.starts_at) > now) {
                    return {text: this.$trans('Toekomstig'), cls: 'warning'};
                }
                if (new Date(this.viewdata.subscription.expires_at) < now) {
                    return {text: this.$trans('Verlopen'), cls: 'danger'};
                }
                return {text: this.$trans('Actief'), cls: 'success'};
            },
            subscriptionDuration() {
                var periods = {
                    day: ['dag', 'dagen'],
                    week: ['week', 'weken'],
                    month: ['maand', 'maanden'],
                    year: ['jaar', 'jaren']
                }, period = this.viewdata.subscription.data.period;
                return this.$transChoice(
                        `{1} %duration% ${periods[period][0]}|]1,Inf[ %duration% ${periods[period][1]}`,
                        this.viewdata.subscription.data.duration, {duration: this.viewdata.subscription.data.duration}
                );
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }


    };

</script>