<template>
    <div class="uk-form">
        <div class="uk-margin uk-flex uk-flex-space-between uk-flex-wrap" data-uk-margin>
            <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                <h2 class="uk-margin-remove">{{ 'Sjowme gebruikers' | trans }}</h2>

                <div class="uk-margin-left" v-show="selected.length">
                    <ul class="uk-grid uk-grid-small uk-flex uk-flex-middle">
                        <li><a class="uk-icon-trash-o uk-icon-hover" title="Delete"
                               data-uk-tooltip="{delay: 500}" @click="removeUsers"></a>
                        </li>
                        <li><a class="uk-icon-ban uk-icon-hover" title="{{ 'Inactive' }}"
                               data-uk-tooltip="{delay: 500}" @click.prevent="status(0)"></a>
                        </li>
                        <li><a class="uk-icon-check uk-icon-hover" title="{{ 'Active' }}"
                               data-uk-tooltip="{delay: 500}" @click.prevent="status(1)"></a>
                        </li>
                    </ul>
                </div>
                <div class="uk-form-icon uk-margin-left">
                    <i class="uk-icon-search"></i>
                    <input type="text" v-model="config.filter.search" class="uk-form-width-medium uk-form-blank" debounce="300">
                </div>

            </div>
            <div class="uk-flex" data-uk-margin>

                <a v-if="false" class="uk-button uk-margin-right" @click="addUser">{{ 'Nieuwe gebruiker' | trans }}</a>

            </div>
        </div>

        <div class="uk-panel uk-panel-box">

            <div class="uk-margin uk-overflow-container">
                <table class="uk-table uk-table-hover uk-table-middle uk-form">
                    <thead>
                    <tr>
                        <th class="pk-table-width-minimum"><input type="checkbox" v-check-all:selected.literal="input[name=id]" number></th>
                        <th class="pk-table-width-minimum">{{ 'ID' | trans }}</th>
                        <th class="pk-table-min-width-100"></th>
                        <th class="pk-table-min-width-200" v-order:name="config.filter.order">{{ 'Naam' | trans }}</th>
                        <th class="pk-table-min-width-150" v-order:email="config.filter.order">{{ 'Email' | trans }}</th>
                        <th class="pk-table-min-width-150" v-order:company="config.filter.order">{{ 'Bedrijf' | trans }}</th>
                        <th class="pk-table-width-100">
                            <input-filter :title="$trans('Status')" :value.sync="config.filter.active" :options="activeOptions"></input-filter>
                        </th>
                        <th class="pk-table-width-100">
                            <input-filter :title="$trans('Groep')" :value.sync="config.filter.user_group" :options="userGroupOptions"></input-filter>
                        </th>
                        <th class="pk-table-min-width-150" v-order:updated_at="config.filter.order">{{ 'Laatst actief' | trans }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="check-item" v-for="user in viewdata.users" :class="{'uk-active': active(user)}">
                        <td><input type="checkbox" name="id" value="{{ user.id }}" number></td>
                        <td class="uk-text-center">{{ user.id }}</td>
                        <td class="uk-text-center">
                            <img class="uk-border-circle" style="height: 30px" :src="user.image_url" alt="">
                        </td>
                        <td>
                            <a @click="editUser(user)">{{ user.name || $trans('Onbekend')  }}</a>
                        </td>
                        <td>
                            {{ user.email  }}
                        </td>
                        <td>
                            {{ user.company  }}
                        </td>
                        <td class="uk-text-center">
                            <a @click="toggleStatus(user)" :title="statusText(user.active)" data-uk-tooltip="delay: 200"
                               :class="{
                        'uk-icon-check': user.active == 1,
                        'uk-icon-ban': user.active == 0,
                        'uk-text-success': user.active == 1,
                        'uk-text-danger': user.active == 0,
                        }"></a>
                        </td>
                        <td>
                            {{ user.user_group  }}
                        </td>
                        <td>
                            {{ user.updated_at | datetime }}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h3 v-if="(!viewdata.users || !viewdata.users.length)" class="uk-text-center">{{ 'Geen gebruikers gevonden' | trans }}</h3>

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
                config: {filter: {search: '', active: '', order: 'name asc', limit: 20}, page: 0},
                activeOptions: [{text: 'Toon alles', value: 'all'}, {label: 'Filter op', options: [
                    {value: 0, text: 'Inactief'},
                    {value: 1, text: 'Actief'}
                ] }],
                userGroupOptions: [{text: 'Toon alles', value: ''}, {label: 'Filter op', options: [
                    {value: 'member', text: 'Members'},
                    {value: 'admin', text: 'Admins'}
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
                this.$root.saveState(['user-list', 'user-edit'], filter);
            }, {deep: true});
        },

        methods: {
            load() {
                this.selected = [];
                this.$root.command('user-list', 'user.list', this.config);
            },

            getSelected() {
                return this.viewdata.users.filter(function(user) { return this.selected.indexOf(user.id) !== -1; }, this);
            },

            statusText(status) {
                return {0: 'Inactief', 1: 'Actief'}[status]
            },
            active(user) {
                return this.selected.indexOf(user.id) !== -1;
            },

            status(status, users) {
                users = users || this.getSelected();
                users.forEach(user => {
                    user.active = status;
                });
                this.$root.command('user-list', 'user.save.bulk', _.assign({users}, this.config));
            },

            toggleStatus(user) {
                user.active = !user.active;
                this.$root.command('user-list', 'user.save', _.assign({user}, this.config));
            },

            removeUsers() {
                UIkit.modal.confirm(this.$trans('Wilt u deze gebruikers definitief verwijderen?'), () => {
                    this.$root.command('user-list', 'user.delete.bulk', _.assign({users: this.getSelected()}, this.config));
                });
            },
            editUser(user) {
                this.$root.command('user-edit', 'user.edit', _.assign({user}, this.config));
            }
        }

    };

</script>