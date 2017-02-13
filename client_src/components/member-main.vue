<template>
    <div class="uk-form">
        <div class="uk-grid uk-grid-divider" data-uk-grid-margin>
            <div class="uk-width-medium-1-2">
                <div class="uk-panel uk-panel-space">
                    <div class="uk-panel-teaser">
                        <div class="uk-grid" data-uk-grid-margin>
                            <div class="uk-width-1-4">
                                <img src="/assets/images/channels.png" alt="Mijn Sjows"/>
                            </div>
                            <div class="uk-width-3-4">
                                <div class="uk-margin-top uk-flex uk-flex-middle uk-flex-space-between">
                                    <h2 class="uk-margin-remove">{{ 'Mijn Sjows' | trans }}</h2>
                                    <info-icon url="//www.sjow.me/dashboard-mijn-sjows/"
                                            :title="$trans('Meer informatie')"></info-icon>
                                </div>
                                <p>
                                    <em>{{ 'Maak een Sjow op basis van één van de templates.' | trans }}</em>
                                </p>
                            </div>
                        </div>
                    </div>

                    <p class="uk-text-right">
                        <button @click="selectTemplate" class="uk-button uk-button-primary uk-button-large uk-text-nowrap">
                            {{ 'Maak Sjow' | trans }}</button>
                    </p>

                </div>

                <ul class="uk-list uk-list-line">
                    <li v-for="channel in viewdata.channels">
                        <div class="uk-grid uk-grid-small uk-grid-width-1-5">
                            <div v-for="slide in channel.content.slides">
                                <img :src="previewImageSrc(channel, slide)" :alt="slide.background.name">
                            </div>
                        </div>
                        <div class="uk-grid uk-grid-small uk-flex-middle">
                            <div class="uk-width-2-3 uk-flex uk-flex-middle">
                                <em class="uk-margin-small-right">{{ channel.id }}</em>
                                <strong>{{ channel.name }}</strong>
                            </div>
                            <div class="uk-width-1-3 uk-text-right">
                                <div class="uk-button-group">
                                    <button @click="editChannel(channel)" class="uk-button uk-button-small"
                                            :title="$trans('Bewerk')" data-uk-tooltip="delay:300">
                                        <i class="uk-icon-edit"></i></button>
                                    <button @click="deleteChannel(channel)" class="uk-button uk-button-small"
                                            :title="$trans('Vergeet')" data-uk-tooltip="delay:300">
                                        <i class="uk-icon-trash-o"></i></button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="uk-width-medium-1-2">
                <div class="uk-panel uk-panel-space">
                    <div class="uk-panel-teaser">
                        <div class="uk-grid" data-uk-grid-margin>
                            <div class="uk-width-1-4">
                                <img src="/assets/images/screens.png" alt="Mijn Sjows"/>
                            </div>
                            <div class="uk-width-3-4">
                                <div class="uk-margin-top uk-flex uk-flex-middle uk-flex-space-between">
                                    <h2 class="uk-margin-remove">{{ 'Mijn Presentatieschermen' | trans }}</h2>
                                    <info-icon url="//www.sjow.me/dashboard-presentatieschermen/"
                                               :title="$trans('Meer informatie')"></info-icon>
                                </div>
                                <p>
                                    <em>
                                        {{ 'Ga naar ' | trans }}<a :href="viewdata.screen_url" target="_blank">{{ viewdata.screen_url }}</a>{{ ' op het weergave scherm.' | trans }}
                                    </em>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="uk-flex uk-flex-center uk-flex-middle uk-flex-wrap" data-uk-margin="">
                        <input type="text" v-model="new_screen_id" class="uk-form-large uk-flex-item-1 uk-margin-right uk-text-center"
                               placeholder="Voer het ID nummer van het scherm in" @keyup.enter="addScreen"/>
                        <button @click="addScreen" class="uk-button uk-button-large uk-button-primary uk-text-nowrap">
                            {{ 'Gebruik scherm' | trans }}</button>
                    </div>
                </div>

                <div v-if="user.subscription_expires === false" class="uk-alert uk-alert-warning">
                    {{ 'Geen actief abonnement gevonden. De schermen zullen niet getoond worden.' | trans }}<br>
                    <a href="/profiel">{{ 'Klik hier om een nieuw abonnement te activeren.' | trans }}</a>
                </div>

                <ul class="uk-list uk-list-line">
                    <li v-for="screen in viewdata.screens | orderBy 'id' 1">
                        <div class="uk-flex uk-flex-middle uk-flex-wrap" data-uk-margin>

                            <div class="uk-flex-item-1 uk-margin-small-right uk-flex uk-flex-middle">

                                <small class="uk-margin-small-right">{{ screen.id }}</small>
                                <i class="uk-icon-circle uk-icon-justify uk-margin-small-right"
                                   :class="screenActive(screen.id) ? 'uk-text-success' : 'uk-text-danger'"
                                   :title="screenActiveTitle(screen)"
                                   data-uk-tooltip="delay:200"></i>
                                <textfield-edit :model.sync="screen.name" class="uk-flex-item-1"
                                                :on-save="saveScreenName"
                                                :id="screen.id"
                                                :placeholder="$trans('Scherm %nr%', {nr: screen.id})"></textfield-edit>

                            </div>
                            <div class="uk-margin-small-right">
                                <select v-model="screen.channel" class="uk-width-1-1" @change="saveScreen(screen)">
                                    <option value="0" >{{ '- Selecteer Sjow -' | trans }}</option>
                                    <option v-for="channel in viewdata.channels" :value="channel.id" >{{channel.id}} - {{channel.name}}</option>
                                </select>
                            </div>
                            <div class="">
                                <div class="uk-button-group">
                                    <button @click="toggleActivateScreen(screen)" class="uk-button uk-button-small"
                                            :title="(screen.active ? $trans('Deactiveer') : $trans('Activeer'))" data-uk-tooltip="delay:300">
                                        <i :class="{'uk-icon-toggle-on': screen.active, 'uk-icon-toggle-off': !screen.active}"></i>
                                    </button>
                                    <button @click="forgetScreen(screen)" class="uk-button uk-button-small"
                                            :title="$trans('Vergeet')" data-uk-tooltip="delay:300">
                                        <i class="uk-icon-trash-o"></i></button>
                                    <button @click="refreshScreen(screen)" class="uk-button uk-button-small"
                                            :title="$trans('Refresh')" data-uk-tooltip="delay:300">
                                        <i class="uk-icon-refresh"></i></button>
                                </div>

                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-el:templatemodal class="uk-modal">
            <div class="uk-modal-dialog uk-modal-dialog-large">
                <a class="uk-modal-close uk-close"></a>
                <div v-if="template_modal">
                    <div class="uk-grid" data-uk-grid-margin>
                        <div class="uk-width-medium-1-3">
                            <ul class="uk-tab uk-tab-left" data-uk-tab="connect: '#template-categories'">
                                <li v-for="category in viewdata.categories | orderBy 'name'">
                                    <a class="uk-text-truncate">{{ category.label }}</a>
                                </li>
                            </ul>
                        </div>
                        <div class= uk-width-medium-2-3>
                            <ul id="template-categories" class="uk-switcher">
                                <li v-for="items in template_categories">
                                    <ul class="uk-list uk-list-space">
                                        <li v-for="template in items">
                                            <div class="uk-panel uk-panel-hover" @click="pickTemplate(template)">

                                                <div class="uk-grid uk-grid-small uk-grid-width-1-5">
                                                    <div v-for="preview in template.previews">
                                                        <img :src="preview.image_url + '?' + preview.ETag" alt="Sjowme slide" width="240" height="135"/>
                                                    </div>
                                                </div>
                                                <div class="uk-flex uk-flex-middle uk-flex-space-between">
                                                    <strong>{{ template.name }}</strong>
                                                    <em>{{ getCategoryLabel(template.category) }}</em>
                                                </div>

                                            </div>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>
<script>

    var default_channel = require('../../app/database/defaults').channel;

    module.exports = {

        props: ['viewdata', 'user'],

        data() {
            return {
                new_screen_id: '',
                new_channel: '',
                template_channel: false,
                template_categories: {},
                edit_channel: false,
                template_modal: null
            }
        },

        events: {
            'socket.data': function (command, component, data) {
                if (this.template_channel === false) {
                    this.template_channel = _.find(this.viewdata.default_channels, {id: this.viewdata.default_channel});
                    this.template_categories = _.groupBy(_.orderBy(this.viewdata.default_channels, 'category'), 'category');
                }
                //make sure events bubbles down
                return true;
            },
            'global.broadcast': function (data) {
                if (data.active_screens) {
                    this.viewdata.active_screens = data.active_screens;
                }
            }
        },

        methods: {
            addScreen() {
                if (!this.new_screen_id) return;
                this.$root.command('member-main', 'screen.claim', {screen: {
                    id: this.new_screen_id
                }});
                this.new_screen_id = '';
            },
            saveScreenName(id) {
                var screen = _.find(this.viewdata.screens, {id});
                if (screen) {
                    this.saveScreen(screen);
                }
            },
            saveScreen(screen) {
                this.$root.command('member-main', 'screen.save', {screen: screen});
            },
            toggleActivateScreen(screen) {
                screen.active = !screen.active;
                this.saveScreen(screen);
            },
            forgetScreen(screen) {
                UIkit.modal.confirm(`Scherm ${screen.id} vergeten?`, () => this.$root.command('member-main', 'screen.delete', {screen}));
            },
            refreshScreen(screen) {
                this.$root.command('member-main', 'screen.refresh', {screen});
            },
            screenActive(id) {
                return this.viewdata.active_screens.indexOf(id) > -1;
            },
            screenActiveTitle(screen) {
                if (this.screenActive(screen.id)) {
                    return this.$trans('Scherm online');
                } else {
                    return this.$trans('Scherm laatst actief op %date%', {date: (new Date(screen.updated_at)).toLocaleString()});
                }
            },
            selectTemplate() {
                this.getModal().show();
            },
            pickTemplate(template) {
                this.template_channel = template;
                this.copyTemplate();
                setTimeout(() => this.getModal().hide(), 300);
            },
            copyTemplate() {
                this.saveChannel(_.assign({}, this.template_channel, {
                    id: 0,
                    category: '',
                    owner: this.user.id
                }));
            },
            saveChannel(channel) {
                this.$root.command('member-main', 'channel.save', {channel: channel});
            },
            editChannel(channel) {
                this.$root.command('channel-edit', 'channel.edit', {channel: channel});
            },
            deleteChannel(channel) {
                UIkit.modal.confirm(`Sjow ${channel.name} vergeten?`, () => this.$root.command('member-main', 'channel.delete', {channel}));
            },
            getCategoryLabel(category_name) {
                var item = _.find(this.viewdata.categories, {name: category_name});
                return item ? item.label : category_name;
            },
            previewImageSrc(channel, slide) {
                if (slide.background.bg_type === 'media') {
                    var preview = channel.previews[`slide${slide.number}`];
                    return `${preview.image_url}?v=${preview.ETag}`;
                } else {
                    var canvas  = UIkit.$('<canvas></canvas>').attr({'width': 240, 'height': 135}).get(0);
                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = slide.background.color;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    return canvas.toDataURL();
                }
            },
            getModal() {
                if (!this.template_modal) {
                    this.template_modal = UIkit.modal(this.$els.templatemodal);
                    this.template_modal.on('hide.uk.modal', () => this.template_modal = false);
                }
                return this.template_modal;
            }
        }

    };

</script>