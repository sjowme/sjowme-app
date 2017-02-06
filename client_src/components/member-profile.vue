<template>
    <div>
        <div class="uk-margin uk-flex uk-flex-middle">
            <img class="uk-border-circle uk-margin-right" :src="user.image_url" alt="">
            <h1 class="uk-margin-remove">{{ user.name }}</h1>
        </div>

        <div class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>

                <div class="uk-panel uk-panel-box uk-panel-box-primary uk-form">

                    <h2>{{ 'Gegevens' | trans }}</h2>

                    <div class="uk-form-horizontal">
                        <div class="uk-form-row">
                            <label class="uk-form-label">{{ 'Name' | trans }}</label>
                            <div class="uk-form-controls">
                                <textfield-edit :model.sync="user.name" :on-save="save"></textfield-edit>
                            </div>
                        </div>
                        <div class="uk-form-row">
                            <label class="uk-form-label">{{ 'Email' | trans }}</label>
                            <div class="uk-form-controls">
                                <div>
                                    <p class="uk-form-controls-condensed">{{ user.email }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="uk-form-row">
                            <label class="uk-form-label">{{ 'Bedrijf' | trans }}</label>
                            <div class="uk-form-controls">
                                <textfield-edit :model.sync="user.company" :on-save="save"></textfield-edit>
                            </div>
                        </div>
                    </div>

                    <div class="uk-form-stacked uk-margin">
                        <div class="uk-form-row">
                            <label class="uk-form-label">{{ 'Logo' | trans }}</label>
                            <div class="uk-form-controls">
                                <file-upload :file.sync="user.data.logo" target="user" :after-upload="save"></file-upload>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div>

                <component :is="sub_component" :user="user"></component>

            </div>
        </div>

    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata', 'user'],

        data() {
            return {
                sub_component: 'member-subscriptions'
            }
        },

        created() {
            this.user.name = this.user.name || '-';
            this.user.company = this.user.company || '-';
            this.user.data.logo = this.user.data.logo || {};
        },

        events: {
            'socket.data': function (command, component, data) {
                if (component === 'member-profile') {
                    this.user = data.user;
                }
                //make sure events bubbles down
                return true;
            }
        },

        methods: {
            save() {
                this.$root.command('member-profile', 'profile.save', {user: this.user});
            }
        },

        components: {
            'file-upload': require('./ui/file-upload.vue'),
            'member-subscriptions': require('./member-subscriptions.vue')
        }

    };

</script>