<template>
    <div>

        <div class="uk-panel uk-panel-box uk-panel-box-secondary">
            <template v-if="active_subscr">
                <div v-if="!active_subscr.payed" class="uk-panel-badge uk-badge uk-badge-danger">{{ 'Nog niet betaald' | trans }}</div>
                <div v-else class="uk-panel-badge uk-badge" :class="`uk-badge-${subscriptionStatus(active_subscr).cls}`">
                    {{ subscriptionStatus(active_subscr).text }}
                </div>
                <div class="uk-margin uk-flex uk-flex-space-between uk-flex-middle">
                    <h2 class="uk-margin-remove uk-flex-item-1">{{ active_subscr.name }}</h2>
                    <span>{{ subscriptionDuration(active_subscr.data) }}</span>
                </div>
                <div v-if="!active_subscr.payed" class="uk-margin-small">
                    <a @click="paySubscription(active_subscr)"
                            class="uk-button uk-button-small">{{ 'Betaal dit abonnement nu' | trans }}</a>
                </div>
                <p>{{ active_subscr.data.description }}</p>
                <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                    <div class="uk-width-small-2-3">
                        <em>{{ 'Van' | trans }} {{ active_subscr.starts_at | date }} {{ 'tot' | trans }} {{ active_subscr.expires_at | date }}</em>
                    </div>
                    <div class="uk-width-small-1-3 uk-flex uk-flex-space-between">
                        <div v-if="active_subscr.data.transaction && active_subscr.data.transaction.invoice_number">
                            <a :href="`/pdf/factuur/${active_subscr.data.transaction.invoice_number}/download`" class="uk-icon-download uk-margin-small-right"
                               target="_blank" download :title="$trans('Factuur downloaden')" data-uk-tooltip="delay:200"></a>
                        </div>
                        <div class="uk-position-relative">
                            <div v-if="active_subscr.data.transaction" data-uk-dropdown="mode:'click'">
                                <a class="uk-icon-money uk-margin-small-right"
                                   :title="$trans('Betaalgegevens')" data-uk-tooltip="delay:200"></a>
                                <div class="uk-dropdown">
                                    <dl>
                                        <dt>{{ 'ID' | trans }}</dt>
                                        <dd>{{ active_subscr.data.transaction.id }}</dd>
                                        <dt>{{ 'status' | trans }}</dt>
                                        <dd>{{ active_subscr.data.transaction.status }}</dd>
                                        <dt>{{ 'Methode' | trans }}</dt>
                                        <dd>{{ active_subscr.data.transaction.method }}</dd>
                                        <dt>{{ 'Datum' | trans }}</dt>
                                        <dd>{{ active_subscr.data.transaction.datetime | datetime }}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <strong v-if="active_subscr.data.price">{{{ active_subscr.data.price | formatprice }}}</strong>
                        <strong v-else>{{ 'Gratis' | trans }}</strong>
                    </div>
                </div>
            </template>

        </div>

        <div v-if="payment_message" class="uk-alert" :class="active_subscr.payed ? 'uk-alert-success' : 'uk-alert-warning'" data-uk-alert>
            <a class="uk-alert-close uk-close"></a>
            {{ payment_message }}
        </div>

        <p>
            <button type="button" class="uk-button uk-button-primary" data-uk-modal="target:'#add-abo-modal'">{{ 'Abonnement toevoegen' | trans }}</button>
        </p>

        <div v-if="subscriptions.length" class="uk-margin uk-panel uk-panel-box">
            <h3 class="uk-panel-title">{{ 'Voorgaande abonnementen' | trans }}</h3>

            <ul class="uk-list uk-list-line">
                <li v-for="subscription in subscriptions">
                    <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                        <div class="uk-width-small-2-3">
                            <strong>{{ subscription.name }}</strong>
                        </div>
                        <div class="uk-width-small-1-3 uk-text-right">
                            {{ subscriptionDuration(subscription.data) }}
                        </div>
                    </div>
                    <div v-if="!subscription.payed" class="uk-margin-small uk-flex uk-flex-space-between">
                        <div><a @click="paySubscription(subscription)"
                           class="uk-button uk-button-small">{{ 'Betaal dit abonnement nu' | trans }}</a></div>
                        <div><p class="uk-badge uk-badge-danger">{{ 'Nog niet betaald' | trans }}</p></div>
                    </div>
                    <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                        <div class="uk-width-small-2-3">
                            <em>{{ 'Van' | trans }} {{ subscription.starts_at | date }} {{ 'tot' | trans }} {{ subscription.expires_at | date }}</em>
                            <em class="uk-margin-small-left" :class="`uk-text-${subscriptionStatus(subscription).cls}`">
                                {{ subscriptionStatus(subscription).text }}</em>
                        </div>
                        <div class="uk-width-small-1-3 uk-flex uk-flex-space-between">
                            <div v-if="subscription.data.transaction && subscription.data.transaction.invoice_number">
                                <a :href="`/pdf/factuur/${subscription.data.transaction.invoice_number}/download`" class="uk-icon-download uk-margin-small-right"
                                   target="_blank" download :title="$trans('Factuur downloaden')" data-uk-tooltip="delay:200"></a>
                            </div>
                            <div class="uk-position-relative">
                                <div v-if="subscription.data.transaction" data-uk-dropdown="mode:'click'">
                                    <a class="uk-icon-money uk-margin-small-right"
                                       :title="$trans('Betaalgegevens')" data-uk-tooltip="delay:200"></a>
                                    <div class="uk-dropdown">
                                        <dl>
                                            <dt>{{ 'ID' | trans }}</dt>
                                            <dd>{{ subscription.data.transaction.id }}</dd>
                                            <dt>{{ 'status' | trans }}</dt>
                                            <dd>{{ subscription.data.transaction.status }}</dd>
                                            <dt>{{ 'Methode' | trans }}</dt>
                                            <dd>{{ subscription.data.transaction.method }}</dd>
                                            <dt>{{ 'Datum' | trans }}</dt>
                                            <dd>{{ subscription.data.transaction.datetime | datetime }}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <strong v-if="subscription.data.price">{{{ subscription.data.price | formatprice }}}</strong>
                            <strong v-else>{{ 'Gratis' | trans }}</strong>
                        </div>
                    </div>
                    <div class="uk-text-right">
                    </div>
                </li>
            </ul>
        </div>

        <div id="add-abo-modal" class="uk-modal">
            <div class="uk-modal-dialog uk-modal-dialog-large">
                <a class="uk-modal-close uk-close"></a>
                <div class="uk-modal-header">
                    <h2>{{ 'Kies een nieuw abonnement' | trans }}</h2>
                </div>
                <div class="uk-grid" :class="`uk-grid-width-medium-1-${new_abos.length}`" data-uk-grid-margin>
                    <div v-for="abonnement in new_abos">
                        <div class="uk-panel" @click="pick(abonnement)"
                             :class="new_abo.name == abonnement.name ? 'uk-panel-box' : 'uk-panel-hover uk-panel-box-primary'">

                            <h3>{{ abonnement.label }}</h3>
                            <p class="uk-text-right  uk-text-primary">
                                <strong v-if="abonnement.price">{{{ abonnement.price | formatprice }}}</strong>
                                <strong v-else>{{ 'Gratis' | trans }}</strong>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="uk-margin">
                    <h4 v-if="!new_abo.name">{{ 'Selecteer één van bovenstaande abonnementen' | trans }}</h4>
                    <h4 v-else>{{ $trans('Voeg %abonnement% toe aan account. Hiervoor zal een bedrag
                        van € %price% in rekening gebracht worden.',
                        {abonnement: new_abo.label, price: total_price.toLocaleString('nl-NL',
                        {minimumFractionDigits: 2})}) }}
                    </h4>

                    <div v-if="new_abo.price" class="uk-grid uk-grid-width-1-2" data-uk-grid-margin="">
                        <div>

                            <dl class="uk-description-list-horizontal">
                                <dt>{{ 'Abonnementsprijs' | trans }}</dt>
                                <dd class="uk-text-right">{{{ new_abo.price | formatprice }}}</dd>
                                <dt>{{ 'BTW' | trans }}
                                    <small>{{ vat_perc }}%</small>
                                </dt>
                                <dd class="uk-text-right">{{{ vat_amount | formatprice }}}</dd>
                                <dt>{{ 'Totaal' | trans }}</dt>
                                <dd class="uk-text-bold uk-text-large uk-text-right">{{{ total_price | formatprice }}}</dd>
                            </dl>

                        </div>
                        <div>

                            <div v-el:agree class="uk-margin uk-form">
                                <label for="agree_terms">
                                    <input type="checkbox" id="agree_terms" v-model="agree_terms" class="uk-margin-small-right"/>
                                    {{ 'Ik ga akkoord' | trans }}<a href="http://www.sjow.me/nl/algemene-voorwaarden"
                                                          data-lightbox-type="iframe" data-uk-lightbox="">
                                    {{ 'met de algemene voorwaarden' | trans }}
                                </a>.
                                </label>
                            </div>

                            <div class="uk-margin uk-flex uk-flex-space-between" data-uk-margin>
                                <div><h4 v-if="payment_url" class="uk-text-success">{{ 'Doorlinken naar de
                                    betaalomgeving...' | trans }}</h4></div>
                                <div>
                                    <button type="button" class="uk-button uk-button-large uk-button-success uk-margin-left"
                                            @click="add">
                                        {{ 'Naar betaling' | trans }}
                                    </button>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
<script>

    module.exports = {

        props: ['user'],

        data() {
            return {
                agree_terms: false,
                active_subscr: false,
                payment_url: false,
                payment_message: false,
                subscriptions: [],
                abonnementen: [],
                new_abo: {}
            }
        },

        created() {
            this.load();
        },

        events: {
            'socket.data': function (command, component, data) {
                if (component === 'member-subscriptions') {
                    this.vat_perc = data.vat_perc;
                    this.active_subscr = data.subscriptions.shift();
                    this.subscriptions = data.subscriptions;
                    this.abonnementen = data.abonnementen;
                    if (localStorage.pending_transaction && this.active_subscr.transaction_id === localStorage.pending_transaction) {
                        if (this.active_subscr.payed) {
                            this.payment_message = this.$trans('De betaling met id %transaction_id% was succesvol!',
                                    {transaction_id: localStorage.pending_transaction});
                        } else {
                            this.payment_message = this.$trans('De betaling met id %transaction_id% is mislukt.',
                                    {transaction_id: localStorage.pending_transaction});
                        }
                        delete localStorage.pending_transaction;
                    }
                    if (['subscription.add', 'subscription.pay'].indexOf(command) > -1 && data.payment_url) {
                        this.payment_url = data.payment_url;
                        localStorage.pending_transaction = data.transaction_id;
                        setTimeout(window.location.href = data.payment_url, 4000);
                    }
                }
                return true;
            }
        },

        computed: {
            new_abos() {
                return _.orderBy(this.abonnementen.filter(abo => abo.default === false), 'ordering');
            },
            net_price() {
                return this.new_abo.price || 0;
            },
            vat_amount() {
                return Math.round((this.vat_perc / 100) * (this.net_price * 100)) / 100;
            },
            total_price() {
                return this.vat_amount + this.net_price;
            }
        },

        methods: {
            load() {
                this.$root.command('member-subscriptions', 'subscription.list', {subscription: this.edit_data});
            },
            pick(abonnement) {
                this.new_abo = abonnement;
            },
            add() {
                if (!this.agree_terms) {
                    UIkit.$(this.$els.agree).addClass('uk-animation-shake');
                    setTimeout(() => UIkit.$(this.$els.agree).removeClass('uk-animation-shake'), 500);
                    return;
                }
                this.$root.command('member-subscriptions', 'subscription.add', {abonnement:  this.new_abo, user: this.user});
            },
            paySubscription(subscription) {
                this.$root.command('member-subscriptions', 'subscription.pay', {subscription, user: this.user});
            },
            subscriptionStatus(subscription) {
                var now = new Date();
                if (new Date(subscription.starts_at) > now) {
                    return {text: this.$trans('Toekomstig'), cls: 'warning'};
                }
                if (new Date(subscription.expires_at) < now) {
                    return {text: this.$trans('Verlopen'), cls: 'danger'};
                }
                return {text: this.$trans('Actief'), cls: 'success'};
            },
            subscriptionDuration(abonnement) {
                var periods = {
                    day: ['dag', 'dagen'],
                    week: ['week', 'weken'],
                    month: ['maand', 'maanden'],
                    year: ['jaar', 'jaren']
                };
                return this.$transChoice(
                        `{1} %duration% ${periods[abonnement.period][0]}|]1,Inf[ %duration% ${periods[abonnement.period][1]}`,
                        abonnement.duration, {duration: abonnement.duration}
                );
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue')
        }
    };

</script>