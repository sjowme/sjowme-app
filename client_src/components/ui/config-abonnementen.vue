<template>

    <div>
        <ul class="uk-list uk-list-line">
            <li v-for="abonnement in data.abonnementen | orderBy 'ordering'">

                <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                    <div class="uk-width-medium-1-3">
                        <div class="uk-flex uk-flex-space-between uk-flex-middle">
                            <div class="uk-flex-item-1 uk-text-truncate"><em>{{ abonnement.name }}</em></div>
                            <a v-if="abonnement.default" class="uk-icon-star uk-text-primary"></a>
                        </div>
                    </div>
                    <div class="uk-width-medium-2-3">
                        <div class="uk-flex uk-flex-space-between uk-flex-middle">
                            <div class="uk-flex-item-1 uk-text-truncate">
                                <a @click="edit(abonnement)">{{ abonnement.label }}</a><br>
                                <small>{{ subscriptionDuration(abonnement) }} - {{{ abonnement.price | formatprice }}}</small>
                            </div>
                            <input type="number" class="uk-form-width-mini uk-form-blank uk-margin-small-left"
                                   v-model="abonnement.ordering" @change="saveAll" number/>
                            <a v-if="abonnement.name !== 'algemeen'" @click="remove(abonnement)"
                               class="uk-icon-trash-o uk-icon-hover"></a>
                        </div>
                    </div>
                </div>

            </li>
        </ul>

        <button type="button" class="uk-button uk-button-small" @click="edit()"><i
                class="uk-icon-plus uk-margin-small-right"></i>{{ 'Toevoegen' | trans }}</button>


        <div v-el:modal class="uk-modal">
            <div class="uk-modal-dialog uk-form">
                <div class="uk-modal-header">
                    <h3>{{ 'Abonnement bewerken' | trans }}</h3>
                </div>
                <div v-if="edit_data">

                    <div class="uk-form-horizontal">
                        <div class="uk-form-row">
                            <label class="uk-form-label" for="abonnement_name">{{ 'Naam' | trans }}</label>
                            <div class="uk-form-controls">
                                <input v-model="edit_data.name" id="abonnement_name" type="text"
                                       class="uk-form-width-large"
                                       @keyup.enter="save"/>
                            </div>
                        </div>

                        <div class="uk-form-row">
                            <label class="uk-form-label" for="abonnement_label">{{ 'Titel' | trans }}</label>
                            <div class="uk-form-controls">
                                <input v-model="edit_data.label" id="abonnement_label" type="text"
                                       class="uk-form-width-large"
                                       @keyup.enter="save"/>
                            </div>
                        </div>

                        <div class="uk-form-row">
                            <label class="uk-form-label" for="abonnement_default">{{ 'Standaard abonnement' | trans }}</label>
                            <div class="uk-form-controls uk-form-controls-condensed">
                                <input v-model="edit_data.default" id="abonnement_default" type="checkbox"/>
                            </div>
                        </div>

                    </div>

                    <div class="uk-form-stacked uk-margin">

                        <div class="uk-form-row">
                            <label class="uk-form-label" for="abonnement_description">{{ 'Beschrijving' | trans }}</label>
                            <div class="uk-form-controls">
                            <textarea v-model="edit_data.description" id="abonnement_description" cols="30" rows="3"
                                      class="uk-width-1-1"></textarea>
                            </div>
                        </div>

                        <div class="uk-grid uk-grid-width-medium-1-3" data-uk-grid-margin>
                            <div>

                                <div class="uk-form-row">
                                    <label class="uk-form-label" for="abonnement_duur">{{ 'Duur' | trans }}</label>
                                    <div class="uk-form-controls">
                                        <select v-model="edit_data.duration" id="abonnement_duur" class="uk-width-1-1" number>
                                            <option v-for="option in durationOptions"
                                                    :value="option.value">{{ option.text }}</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                            <div>

                                <div class="uk-form-row">
                                    <label class="uk-form-label" for="abonnement_periode">{{ 'Periode' | trans }}</label>
                                    <div class="uk-form-controls">
                                        <select v-model="edit_data.period" id="abonnement_periode" class="uk-width-1-1">
                                            <option value="day">{{ 'Dag' | trans }}</option>
                                            <option value="week">{{ 'Week' | trans }}</option>
                                            <option value="month">{{ 'Maand' | trans }}</option>
                                            <option value="year">{{ 'Jaar' | trans }}</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                            <div>

                                <div class="uk-form-row">
                                    <label class="uk-form-label" for="abonnement_prijs">{{ 'Prijs' | trans }}</label>
                                    <div class="uk-form-controls">
                                        <div class="uk-form-icon">
                                            <i class="uk-icon-euro"></i>
                                            <input v-model="edit_data.price" id="abonnement_prijs" type="number"
                                                   class="uk-width-1-1 uk-text-right"
                                                   @keyup.enter="save" min="0" step="0.01" number/>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
                <div class="uk-modal-footer uk-text-right">
                    <button type="button" class="uk-button uk-margin-right" @click="closeModal">{{ 'Annuleren' | trans }}</button>
                    <button type="button" class="uk-button uk-button-primary" @click="save">{{ 'Opslaan' | trans }}</button>
                </div>
            </div>
        </div>

    </div>


</template>

<script>
    var default_abonnement = {
        ordering: 0,
        default: false,
        name: '',
        label: '',
        description: '',
        period: 'month',
        duration: 1,
        price: 0
    };

    module.exports = {

        props: {
            'data': Object,
        },

        data() {
            return {
                edit_data: false,
                modal: null
            };
        },

        computed: {
            durationOptions() {
                var options = [];
                for (var i = 1; i <= 30; i++) {
                    options.push({value: i, text:`${i}`})
                }
                return options;
            }
        },

        methods: {

            save() {
                this.edit_data.name = _.kebabCase(this.edit_data.name || this.edit_data.label);
                if (this.edit_data.default) {
                    this.data.abonnementen.forEach(abonnement => {
                        if (abonnement !== this.edit_data) {
                            abonnement.default = false;
                        }
                    });
                }
                this.saveAll();
                setTimeout(() => this.getModal().hide(), 300);
            },
            saveAll() {
                this.$parent.save('abonnementen');
            },
            edit(abonnement) {
                if (!abonnement) {
                    abonnement = _.assign({}, default_abonnement);
                    abonnement.ordering = this.data.abonnementen.length + 1;
                    this.data.abonnementen.push(abonnement)
                }
                this.edit_data = abonnement;
                this.getModal().show();
            },
            getModal() {
                if (!this.modal) {
                    this.modal = UIkit.modal(this.$els.modal, {modal: false});
                    this.modal.on('hide.uk.modal', () => this.edit_data = false);
                }
                return this.modal;
            },
            closeModal() {
                this.getModal().hide();
            },
            remove(abonnement) {
                if (abonnement.name === 'algemeen') {
                    return;
                }
                UIkit.modal.confirm(this.$trans('Wilt u dit abonnement verwijderen?'), () => {
                    this.data.abonnementen.$remove(abonnement);
                    this.$parent.save('abonnementen');
                });
            },
            subscriptionDuration(abonnement) {
                var periods = {day: ['dag', 'dagen'], week: ['week', 'weken'], month: ['maand', 'maanden'], year: ['jaar', 'jaren']};
                return this.$transChoice(
                        `{1} %duration% ${periods[abonnement.period][0]}|]1,Inf[ %duration% ${periods[abonnement.period][1]}`,
                        abonnement.duration, {duration: abonnement.duration}
                );
            }
        }

    };

</script>
