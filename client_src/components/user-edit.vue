<template>
    <div>

        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <img v-if="viewdata.user.image_url" class="uk-border-circle uk-margin-right"
                     :src="viewdata.user.image_url" alt="">
                <h2 class="uk-margin-remove">
                    {{$trans('Gebruiker %name% bewerken', {name: (viewdata.user.name || $trans('Onbekend'))}) }}
                </h2>

            </div>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <a class="uk-button uk-button-danger uk-margin-right" @click="cancel">{{ 'Annuleren' | trans }}</a>
                <a class="uk-button uk-button-success uk-margin-right" @click="save(false)">{{ 'Opslaan' | trans }}</a>
                <a class="uk-button uk-button-primary" @click="save(true)">{{ 'Opslaan en sluiten' | trans }}</a>

            </div>
        </div>


        <div class="uk-margin uk-panel uk-panel-box uk-form">

            <div class="uk-grid" data-uk-grid-margin>
                <div class="uk-width-medium-3-4 uk-form-horizontal">

                    <h3>Gegevens</h3>

                    <div class="uk-form-row">
                        <label for="user_name" class="uk-form-label">{{ 'Naam' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="user_name" class="uk-form-width-large"
                                   v-model="viewdata.user.name"/>
                        </div>
                    </div>
                    <div class="uk-form-row">
                        <label for="user_email" class="uk-form-label">{{ 'Email' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="email" id="user_email" class="uk-form-width-large"
                                   v-model="viewdata.user.email"/>
                        </div>
                    </div>
                    <div class="uk-form-row">
                        <label for="user_company" class="uk-form-label">{{ 'Bedrijf' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" id="user_company" class="uk-form-width-large"
                                   v-model="viewdata.user.company"/>
                        </div>
                    </div>

                </div>
                <div class="uk-width-medium-1-4 uk-form-stacked">

                    <h3>Instellingen</h3>

                    <div class="uk-form-row">
                        <label for="user_active" class="uk-form-label">{{ 'Status' | trans }}</label>
                        <div class="uk-form-controls">
                            <select v-model="viewdata.user.active" id="user_active" class="uk-width-1-1">
                                <option value="1">{{ 'Actief' | trans }}</option>
                                <option value="0">{{ 'Inactief' | trans }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="uk-form-row">
                        <label for="user_user_group" class="uk-form-label">{{ 'Groep' | trans }}</label>
                        <div class="uk-form-controls">
                            <select v-model="viewdata.user.user_group" id="user_user_group" class="uk-width-1-1">
                                <option value="member">{{ 'Member' | trans }}</option>
                                <option value="admin">{{ 'Admin' | trans }}</option>
                            </select>
                        </div>
                    </div>

                    <dl>
                        <dt>{{ 'Actief sinds' | trans }}:</dt>
                        <dd>{{ viewdata.user.created_at | datetime }}</dd>
                        <dt>{{ 'Laatst actief' | trans }}:</dt>
                        <dd>{{ viewdata.user.updated_at | datetime }}</dd>
                    </dl>
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
                config: {filter: {search: '', active: '', order: 'name asc', limit: 20}, page: 0},
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
                this.$root.command((close ? 'user-list' : 'user-edit'), 'user.save', _.assign({
                    user: this.viewdata.user
                }, this.config));
            },
            cancel() {
                this.$root.command('user-list', 'user.edit.cancel', _.assign({
                    user: this.viewdata.user
                }, this.config));
            }
        }

    };

</script>