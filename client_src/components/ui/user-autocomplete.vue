<template>

    <div class="uk-position-relative" v-el:dropdown>
        <div class="uk-form-password uk-width-1-1">
            <a v-show="search != ''" @click="unselect" class="uk-form-password-toggle uk-icon-close uk-icon-hover"></a>
            <input v-el:input type="text" v-model="search" :class="inputclass" :placeholder="placeholder"
                   autocomplete="off">
        </div>

        <div class="uk-dropdown uk-margin-top-remove">
            <ul class="uk-nav uk-nav-autocomplete uk-dropdown-scrollable">
                <li v-for="item in users | search | count | orderBy 'name' | limit 10">
                    <a @click.prevent="pick(item)">
                        {{ item.name || 'Onbekend' }}
                        <div class="uk-text-small">{{ item.email }}</div>
                    </a>
                </li>
                <li v-show="search && !count"><a class="uk-link-muted">{{ 'Geen gebruikers gevonden' | trans }}</a></li>
            </ul>
        </div>

    </div>

</template>
<script>
    var valueSet = false;

    module.exports = {

        props: {
            user_group: {type: String, default: ''},
            model: Number,
            inputclass: {type: String, default: ''},
            placeholder: {type: String, default: ''},
            justify: {type: String, default: ''}
        },

        data() {
            return {
                users: [],
                search: '',
                picked: '',
                opened: false,
                count: 0,
                dropdown: {}
            }
        },

        created() {
            this.$watch('model', function (new_value, old_value) {
                console.log(new_value, old_value);
            });
        },

        events: {
            'socket.data': function (command, component, data) {
                if (data.usersOptions) {
                    this.users = data.usersOptions;
                }
                if (!valueSet && this.model) {
                    var user = _.find(this.users, {id: this.model});
                    this.picked = user.name || user.email;
                    this.search = user.name || user.email;
                    valueSet = true;
                }
                return true;
            }
        },

        ready: function () {
            var vm = this;
            this.dropdown = UIkit.dropdown(this.$els.dropdown, {justify: this.justify, preventflip: 'y'});
            this.dropdown.off('mouseenter').off('mouseleave').off('click').on('show.uk.dropdown', function () {
                vm.opened = true;
            }).on('hide.uk.dropdown', function () {
                vm.opened = false;
            });
            this.$nextTick(function () {
                UIkit.$(this.$els.input).on('focus', function () {
                    vm.open();
                });
            });
        },

        methods: {
            pick: function (item) {
                this.picked = item.name || item.email;
                this.search = item.name || item.email;
                this.model = item.id;
                this.$dispatch('pick.user', item, this.user_group);
                this.close();
            },
            unselect: function () {
                this.search = '';
                this.model = 0;
                this.$dispatch('pick.user', null, this.user_group);
            },
            open: function () {
                if (!this.opened) {
                    this.dropdown.show();
                }
            },
            close: function () {
                if (this.opened) {
                    this.dropdown.hide();
                }
            },
            reset: function () {
                this.$nextTick(function () {
                    UIkit.$(this.$els.input).removeClass('uk-animation-shake uk-form-danger');
                });
            },
            invalid: function () {
                this.$nextTick(function () {
                    UIkit.$(this.$els.input).addClass('uk-animation-shake uk-form-danger');
                });
            }
        },

        watch: {
            'search': function (value) {
                this.reset();
                if (value !== this.picked) {
                    this.open();
                }
                if (!value) {
                    this.model = 0;
                    this.close();
                }
                this.picked = '';
            }
        },

        filters: {
            search: function (users) {
                var user_group = this.user_group, search = this.search.toLowerCase();
                return users.filter(function (item) {
                    return (user_group === '' || item.user_group === user_group) && (!search || (
                                    (item.name.toLowerCase().indexOf(search) > -1)
                                    || (item.email.toLowerCase().indexOf(search) > -1)
                                    || (String(item.company).toLowerCase().indexOf(search) > -1)
                            ));
                });
            },
            count: function (users) {
                this.count = users.length;
                return users;
            },
            limit: function (users, limit) {
                return users;//.slice(users, limit);
            }
        }

    };
</script>