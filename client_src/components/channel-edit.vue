<template>
    <div class="uk-form uk-form-stacked">

        <div class="uk-margin uk-panel uk-panel-box uk-panel-box-primary uk-flex uk-flex-middle uk-flex-center uk-flex-wrap" data-uk-margin>
                <div class="uk-flex-item-1 uk-flex uk-flex-middle uk-flex-space-between uk-flex-wrap" data-uk-margin>
                    <label for="channel_name" class="uk-form-label uk-text-nowrap">{{ 'Naam sjow' | trans }}:</label>
                    <input id="channel_name" type="text" v-model="viewdata.channel.name"
                           class="uk-form-large uk-flex-item-1 uk-margin-right uk-margin-left"
                           placeholder="Voer een naam in voor deze sjow"/>

                </div>
                <div class="uk-flex uk-flex-center">
                    <button type="button" @click="cancel" class="uk-button uk-button-large uk-margin-right">{{ 'Sluiten' | trans }}</button>
                    <button type="button" @click="saveChannel(false)" class="uk-button uk-button-large uk-button-primary">{{ 'Opslaan' | trans }}</button>
                </div>
        </div>

        <ul class="uk-grid uk-grid-small uk-grid-width-small-1-2 uk-grid-width-medium-1-3 uk-grid-width-large-1-6 uk-text-center" data-uk-grid-margin="">
            <li v-for="slide in viewdata.channel.content.slides">
                <div class="uk-overlay uk-overlay-hover">
                    <img :src="previewImageSrc(viewdata.channel, slide)" :alt="slide.background.name">
                    <figcaption class="uk-overlay-panel uk-overlay-background uk-text-center">
                        <h3 class="uk-margin-remove">{{ $trans('Dia %nr%', {nr: ($index + 1)}) }}</h3>
                        <i class="uk-icon-edit"></i>
                    </figcaption>
                    <div v-if="!slide.active" class="uk-position-cover uk-flex uk-flex-center uk-flex-middle">
                        <i class="uk-icon-ban uk-icon-large uk-text-danger" :title="$trans('Inactief')"
                           data-uk-tooltip="pos: 'bottom-center'"></i>
                    </div>
                    <a @click="editSlide(slide)" class="uk-position-cover"></a>
                </div>
            </li>
        </ul>

        <div class="uk-margin uk-panel uk-panel-box uk-form">

            <div class="uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
                <div class="uk-form-horizontal">
                    <div class="uk-margin-top uk-flex uk-flex-middle uk-flex-space-between">
                        <h3 class="uk-margin-remove">{{ 'Algemene instellingen' | trans }}</h3>
                        <info-icon url="//www.sjow.me/standaardscherm-instellingen/"
                                   :title="$trans('Meer informatie')"></info-icon>
                    </div>
                   <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Tijdsduur dia' | trans }}</label>
                        <div class="uk-form-controls">
                            <time-duration :model.sync="viewdata.channel.config.player.duration"></time-duration>
                        </div>
                    </div>
                    <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Animatie overgang' | trans }}</label>
                        <div class="uk-form-controls">
                            <select-default :model.sync="viewdata.channel.config.player.animation"
                                            option-type="animations"></select-default>
                        </div>
                    </div>
                </div>
                <div>
                    <div v-if="$root.$options.name === 'admin'" class="uk-form-horizontal">

                        <h3>{{ 'Administratie' | trans }}</h3>

                        <div class="uk-form-row">
                            <label class="uk-form-label">{{ 'Gebruiker' | trans }}</label>
                            <div class="uk-form-controls">
                                <div id="channel-owner-ac">
                                    <user-autocomplete :model.sync="viewdata.channel.owner"
                                                       inputclass="uk-width-1-1"
                                                       justify="#channel-owner-ac"
                                                       :placeholder="$trans('Standaard sjow')"></user-autocomplete>
                                </div>
                                <p class="uk-form-help-block">{{ 'Laat leeg voor standaard sjow' | trans }}</p>
                            </div>
                        </div>

                        <div v-if="viewdata.channel.owner === 0" class="uk-form-row">
                            <label class="uk-form-label">{{ 'Categorie' | trans }}</label>
                            <div class="uk-form-controls">
                                <select v-model="viewdata.channel.category" class="uk-form-width-medium">
                                    <option v-for="category in viewdata.categories" :value="category.name">
                                        {{ category.label }}
                                    </option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div class="uk-margin-top uk-flex uk-flex-middle uk-flex-space-between">
                        <h3 class="uk-margin-remove">{{ 'Modules' | trans }}</h3>
                        <info-icon url="//www.sjow.me/standaardscherm-module/"
                                   :title="$trans('Meer informatie')"></info-icon>
                    </div>

                    <ul v-if="channelModules.length" class="uk-list uk-list-space">
                        <li v-for="module in channelModules">
                            <div class="uk-panel uk-panel-box uk-panel-box-primary">
                                <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                                    <div class="uk-width-1-4">
                                        <img :src="module.image_url" :alt="module.name"/>
                                    </div>
                                    <div class="uk-width-3-4 uk-flex uk-flex-middle">
                                        <module class="uk-width-1-1" :is="module.channel" :module="module" :channel="viewdata.channel"></module>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <p v-else><em>{{ 'Geen actieve Sjow-modules' | trans }}</em></p>

                </div>
            </div>

        </div>

        <div v-el:editmodal class="uk-modal">
            <div class="uk-modal-dialog uk-modal-dialog-blank uk-height-viewport">
                <a class="uk-modal-close uk-close"></a>
                <div v-if="edit_slide">
                    <slide-edit :slide.sync="edit_slide"
                                :channel="viewdata.channel"
                                :collections="viewdata.collections"
                                :member_media_tags="viewdata.member_media_tags"
                                :modules="viewdata.modules"></slide-edit>
                </div>

            </div>
        </div>
    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata', 'user', 'filter'],

        data() {
            return {
                edit_slide: false,
                edit_modal: null,
                list_component: this.$root.$options.name === 'admin' ? 'channel-list' : 'member-main',
                config: {filter: {search: '', active: '', order: 'name asc', limit: 20}, page: 0},
            };
        },

        created() {
            //filter for list view
            if (this.filter) {
                this.config.filter = this.filter;
            }
        },

        events: {
            'global.broadcast': function (data) {
                if (data.previews && data.channel.id === this.viewdata.channel.id) {
                    console.log('Refresh previews');
                    this.viewdata.channel.previews = data.previews;
                }
            },
            'socket.data': function (command, component, viewdata) {
                if (command === 'channel.save' && component === 'channel-edit' && this.edit_slide) {
                    //reattach edit slide
                    var slide = _.find(this.viewdata.channel.content.slides, {number: this.edit_slide.number});
                    if (slide) {
                        this.edit_slide = slide;
                    }
                }
                return true;
            }
        },

        watch: {
            'viewdata.channel.owner': {handler: function (value) {
                this.viewdata.channel.category = value === 0 ? (this.viewdata.channel.category || 'algemeen') : '';
            }, immediate: true}
        },

        computed: {
            activeModules() {
                var modules = [];
                this.viewdata.channel.content.slides.forEach(slide => {
                    slide.modules.forEach(module => modules.push(module.name));
                });
                return modules;
            },
            channelModules() {
                return this.viewdata.modules.filter(module => (module.channel && this.activeModules.indexOf(module.name) > -1));
            }
        },

        methods: {
            editSlide(slide) {
                if (this.edit_slide) {
                    //reset modal
                    this.edit_slide = false;
                    this.$nextTick(function () {
                        this.edit_slide = slide;
                        this.getModal().show();
                    });
                } else {
                    this.edit_slide = slide;
                    this.getModal().show();
                }
            },
            saveChannel(close) {
                this.$root.command((close ? this.list_component : 'channel-edit'), 'channel.save', _.assign({
                    channel: this.viewdata.channel
                }, this.config));
            },
            cancel() {
                this.$root.command(this.list_component, 'channel.edit.cancel', _.assign({
                    channel: this.viewdata.channel
                }, this.config));
            },
            setPreview(slide) {
                this.viewdata.channel.previews[`slide${slide.number}`].ETag = '';
                this.viewdata.channel.previews[`slide${slide.number}`].provider = '';
                if (slide.background.src) {
                    this.viewdata.channel.previews[`slide${slide.number}`].image_url = slide.background.src;
                    this.viewdata.channel.previews[`slide${slide.number}`].path = slide.background.path;
                } else {
                    this.viewdata.channel.previews[`slide${slide.number}`].image_url = '/assets/images/noimage.png';
                    this.viewdata.channel.previews[`slide${slide.number}`].path = 'assets:images/noimage.png';
                }
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
                if (!this.edit_modal) {
                    this.edit_modal = UIkit.modal(this.$els.editmodal, {bgclose: false});
                    this.edit_modal.on('hide.uk.modal', () => this.edit_slide = false);
                }
                return this.edit_modal;
            },
            moduleCommand(module, command, data) {
				var dt = Date();
                console.log(`module.command: send ${command} for ${(module)} at(channel-edit.vue) ` + dt);
                var moduleObj = _.find(this.viewdata.modules, {name: module});
                this.$root.socket.emit('module.command', module, command, moduleObj.config, data);
            }
        },

        components: {
            'user-autocomplete': require('./ui/user-autocomplete.vue'),
            'time-duration': require('./ui/time-duration.vue'),
            'select-default': require('./ui/select-default.vue'),
            'slide-edit': require('./slide-edit.vue'),
            'module-ticketcounter-channel': require('../modules/ticketcounter/channel.vue')
        }

    };

</script>