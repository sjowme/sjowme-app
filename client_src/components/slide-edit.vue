<template>
    <div class="uk-height-viewport sj-edit-container">

        <div v-el:preview class="sj-preview uk-flex uk-flex-center">

            <div class="uk-grid uk-grid-collapse sj-preview-grid uk-grid-width-medium-1-3">
                <div class="sj-preview-nav">
                    <div class="uk-panel">

                        <div class="uk-container-center">
                            <div class="uk-slidenav-position uk-width-1-1">
                                <a @click="editPrev()" class="uk-slidenav uk-slidenav-previous"></a>
                                <a @click="editNext()" class="uk-slidenav uk-slidenav-next"></a>
                            </div>

                            <ul class="uk-thumbnav">
                                <li v-for="sl in channel.content.slides" class="uk-width-1-5"
                                    :class="{'uk-active': sl.number == slide.number}">
                                    <a @click="editSlide(sl)" class="uk-position-relative">
                                        <img :src="previewImageSrc(channel, sl)" :alt="sl.background.name" width="240" height="135"/>
                                        <div v-if="!sl.active" class="uk-position-cover uk-flex uk-flex-center uk-flex-middle">
                                            <i class="uk-icon-ban uk-text-danger" :title="$trans('Inactief')"
                                               data-uk-tooltip="pos: 'bottom-center'"></i>
                                        </div>

                                    </a>
                                </li>
                            </ul>
                        </div>


                    </div>
                </div>
                <div class="sj-preview-slide">
                    <div class="uk-position-relative">
                        <ul class="uk-slideshow" v-el:slideshow>
                            <screen-slide :slide="slide" :channel="channel" :modules="modules"></screen-slide>
                        </ul>
                        <div v-if="!slide.active" class="uk-position-top-left uk-margin-left uk-margin-top">
                            <h2><i class="uk-icon-ban uk-text-danger" :title="$trans('Inactief')" data-uk-tooltip="pos: 'bottom-left'"></i></h2>
                        </div>
                    </div>
                </div>
                <div class="sj-preview-tools">
                    <div class="uk-panel uk-panel-space uk-form">
                        <div class="uk-margin-topuk-panel uk-panel-box uk-flex uk-flex-wrap uk-flex-space-around" data-uk-margin="">
                            <button type="button" class="uk-button uk-modal-close">
                                {{ 'Sluiten' | trans }}
                            </button>
                            <button type="button" @click="saveSlide()" class="uk-button uk-button-primary">
                                {{ 'Opslaan' | trans }}
                            </button>
                        </div>


                    </div>
                </div>
            </div>

        </div>

        <div v-el:controls class="sj-controls">

            <div class="uk-form uk-panel">
                <ul class="uk-tab" data-uk-tab="connect:'#slide-edit-tabs'">
                    <li>
                        <a href="#">
                            <strong>
                                <i class="uk-icon-cogs uk-margin-small-right"></i>{{ 'Configuratie' | trans }}
                            </strong><br>
                            <span>
                               {{ $trans('Instellingen dia %nr%', {nr: slide.number}) }}
                            </span>
                        </a>
                    </li>
                    <li data-sj-collection>
                        <a href="#">
                            <strong>
                                <i class="uk-icon-photo uk-margin-small-right"></i>{{ 'Achtergrond' | trans }}
                            </strong><br>
                            <span>
                               {{ getBgTypeLabel(slide.background.type) }}
                            </span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <strong>
                                <i class="uk-icon-plug uk-margin-small-right"></i>{{ 'Modules' | trans }}
                            </strong><br>
                            <span>
                                {{ '{0} %count% actieve modules|{1} %count% actieve module|]1,Inf[ %count% actieve modules' | transChoice slide.modules.length {count:slide.modules.length} }}
                            </span>
                        </a>
                    </li>
                </ul>

                <ul id="slide-edit-tabs" class="uk-switcher uk-margin">
                    <li>
                        <div class="uk-panel">
                            <div class="uk-grid " data-uk-grid-margin>
                                <div class="uk-width-medium-1-3 uk-form-horizontal-large">
                                    <div class="uk-margin-top uk-flex uk-flex-right">
                                        <info-icon url="//www.sjow.me/configuratiescherm-algemeen/"
                                                   :title="$trans('Meer informatie')"></info-icon>
                                    </div>
                                    <div class="uk-form-row">
                                        <label for="slide_active" class="uk-form-label">
                                            {{ 'Toon de dia in deze sjow' | trans }}</label>
                                        <div class="uk-form-controls uk-form-controls-condensed">
                                            <input type="checkbox" v-model="slide.active" id="slide_active"/>
                                        </div>
                                    </div>
                                    <div class="uk-form-row">
                                        <label for="slide_size" class="uk-form-label">{{ 'Tekstgrootte dia' | trans }}</label>
                                        <div class="uk-form-controls">
                                            <select v-model="slide.config.size" id="slide_size" class="uk-form-width-medium">
                                                <option value="small">{{ 'Klein' | trans }}</option>
                                                <option value="medium">{{ 'Normaal' | trans }}</option>
                                                <option value="large">{{ 'Groot' | trans }}</option>
                                                <option value="xlarge">{{ 'Extra groot' | trans }}</option>
                                                <option value="xxlarge">{{ 'Super groot' | trans }}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="uk-form-row">
                                        <label class="uk-form-label">{{ 'Tijdsduur dia' | trans
                                            }}</label>
                                        <div class="uk-form-controls">
                                            <time-duration :model.sync="slide.config.player.duration"
                                                           :default-value="channel.config.player.duration"></time-duration>
                                        </div>
                                    </div>
                                    <div class="uk-form-row">
                                        <label class="uk-form-label">
                                            {{ 'Animatie overgang' | trans }}</label>
                                        <div class="uk-form-controls">
                                            <select-default :model.sync="slide.config.player.animation"
                                                            option-type="animations"
                                                            :default-value="channel.config.player.animation"></select-default>
                                        </div>
                                    </div>
                                </div>
                                <div class="uk-width-medium-2-3 uk-form-horizontal">

                                    <div class="uk-form-row">
                                        <span class="uk-form-label"><h3>{{ 'Titel' | trans }}</h3></span>
                                        <div class="uk-form-controls">
                                            <div class="uk-margin-top uk-flex uk-flex-middle uk-flex-space-between">
                                                <input type="text" v-model="slide.title"
                                                       class="uk-form-large uk-flex-item-1"
                                                       :placeholder="$trans('Voer een titel in voor deze dia')"/>
                                                <info-icon class="uk-margin-small-left" url="//www.sjow.me/configuratie-titel/"
                                                           :title="$trans('Meer informatie')"></info-icon>
                                            </div>
                                        </div>
                                    </div>

                                    <partial name="slide-edit-title"></partial>

                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="uk-panel">
                            <div class="uk-grid" data-uk-grid-margin>
                                <div class="uk-width-medium-1-4">
                                    <div class="uk-panel uk-panel-box">
                                        <div v-if="slide.background.bg_type == 'color'"
                                             class="uk-panel-teaser uk-cover uk-flex uk-flex-middle uk-flex-center"
                                             :style="'height: 70px;background-color: ' + slide.background.color">
                                            <label class="sj-color-picker uk-flex uk-flex-middle">
                                                <div class="uk-margin-small-right">{{ 'Selecteer' | trans }}</div>
                                                <field-color :value.sync="slide.background.color"></field-color>
                                            </label>
                                        </div>
                                        <div v-else class="uk-panel-teaser uk-cover" style="max-height: 70px;">
                                            <img v-show="slide.background.src" :src="slide.background.src" alt="Background image"/>
                                            <h3 v-else>{{ 'Selecteer een achtergrond' | trans }}</h3>
                                        </div>
                                        <div class="uk-grid uk-grid-small uk-grid-width-1-2">
                                            <div>
                                                <label><input type="radio" class="uk-margin-small-right"
                                                              v-model="slide.background.bg_type"
                                                              value="media"/>{{ 'Afbeelding/Video' | trans }}</label>
                                            </div>
                                            <div>
                                                <label><input type="radio" class="uk-margin-small-right"
                                                              v-model="slide.background.bg_type"
                                                              value="color"/>{{ 'Kleur' | trans }}</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="uk-panel">
                                        <ul class="uk-nav uk-nav-side">
                                            <li v-if="$root.$options.name != 'admin'" class="uk-nav-header">
                                                <div class="uk-flex uk-flex-space-between uk-flex-middle">
                                                    <span class="uk-flex-item-1">{{ 'Upload eigen bestanden' | trans }}</span>
                                                    <button type="button"
                                                            class="uk-button uk-button-small uk-button-primary"
                                                            @click="uploadMedia()"
                                                            :title="$trans('Upload uw eigen bestanden')"
                                                            data-uk-tooltip="delay:100">
                                                        <i class="uk-icon-upload"></i>
                                                    </button>
                                                    <info-icon url="//www.sjow.me/achtergrond-upload/"
                                                               class="uk-margin-small-left" size="uk-icon-small"
                                                               :title="$trans('Meer informatie')"></info-icon>
                                                </div>

                                            </li>
                                            <li :class="{'uk-active': current_collection == 'user'}">
                                                <a @click="current_collection = 'user'">
                                                    {{ 'Eigen afbeeldingen' | trans }}</a>
                                            </li>
                                            <li class="uk-nav-header">
                                                <span class="uk-flex uk-flex-space-between uk-flex-middle">
                                                    <span class="uk-flex-item-1">Sjowme collecties</span>
                                                    <info-icon url="//www.sjow.me/achtergrond-sjowme-collectie/"
                                                               class="uk-margin-small-right" size="uk-icon-small"
                                                               :title="$trans('Meer informatie')"></info-icon>
                                                </span>

                                            </li>
                                            <li v-for="coll in collections"
                                                :class="{'uk-active': current_collection == coll.name}">
                                                <a @click="current_collection = coll.name">{{coll.label}}</a>
                                            </li>
                                        </ul>

                                    </div>
                                </div>
                                <div class="uk-width-medium-3-4">
                                    <media-collection :current_collection="current_collection"
                                                      :collections="collections"
                                                      :selected-path="slide.background.path"
                                                      :allow-edit="current_collection == 'user'"
                                                      :on-edit="uploadMedia"
                                                      :on-remove="removeMedia"
                                                      :on-pick="pickMedia"></media-collection>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="uk-panel">
                            <div class="uk-grid" data-uk-grid-margin>
                                <div class="uk-width-medium-1-4">
                                    <div>
                                        <img v-show="current_module_data.image_url"
                                             :src="current_module_data.image_url"
                                             :title="current_module_data.label"
                                             :alt="current_module_data.label"/>
                                    </div>

                                    <div class="uk-panel">
                                        <ul class="uk-nav uk-nav-side">
                                            <li v-for="mod in modules"
                                                :class="{'uk-active': current_module.name == mod.name}">
                                                <a @click="setModule(mod)">{{mod.label}}</a>
												<div :class="{'uk-active': mod.name == 'twitter' || mod.name == 'weather' || mod.name == 'rss'}">
													<exclamation-icon size="uk-icon-small"
														:title="$trans('Let op: U kunt deze module maar 1x gebruiken per sjow!')"></exclamation-icon>
												</div>
                                            </li>
                                        </ul>

                                    </div>
                                </div>
                                <div class="uk-width-medium-3-4">
                                    <slide-modules :current_module="current_module"
                                                   :model.sync="slide.modules"
                                                   :slide="slide"
                                                   :channel="channel"
                                                   :modules="modules"></slide-modules>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>

            </div>

        </div>
        <div v-el:uploadmodal class="uk-modal">
            <div class="uk-modal-dialog uk-modal-dialog-large">
                <template v-if="edit_media">
                    <media-upload v-ref:uploader
                                  target="user_collection"
                                  parent-component="slide-edit"
                                  :media.sync="edit_media"
                                  :tags="member_media_tags"
                                  :collections="[]"
                                  :after-upload="afterUpload"
                                  :width="500" :compact="true"></media-upload>
                </template>
                <div class="uk-modal-footer uk-text-right">
                    <button type="button" class="uk-button uk-margin-right" @click="closeUploader">
                        {{ 'Annuleren' | trans }}
                    </button>
                    <button type="button" class="uk-button uk-button-primary" @click="upload">{{ 'Opslaan' | trans }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>

    require('../slideshow/slideshow');
    require('../slideshow/slideshow-fx');
    var default_media = require('../../app/database/defaults').media;
    var select_options = require('../lib/options');
    var bg_cache = {};

    module.exports = {

        props: ['slide', 'channel', 'collections', 'member_media_tags', 'modules'],

        data() {
            return {
                current_collection: 'algemeen',
                current_module: {},
                edit_media: false,
                upload_modal: null,
                slideshow: null
            }
        },

        created() {
            //temp remove iframe module
            this.slide.modules = this.slide.modules.filter(module => module.name !== 'iframe');

            this.current_module = this.slide.modules.length ?
                    _.first(this.slide.modules) :
                    _.pick(_.first(this.modules), ['name', 'config']);
        },

        ready() {
            this.$broadcast('slide.show', this.slide.number);
            this.bootSlideshow();
//            if ($.fn.spectrum && $.fn.spectrum.load) {
//                $.fn.spectrum.processNativeColorInputs();
//            }
        },

        watch: {
            'mode': function () {
                UIkit.$body.trigger('resize');
            },
            'slide.background.bg_type': function (value) {
                if (value === 'media') {
                    if (bg_cache.path) {
                        delete bg_cache.bg_type;
                        this.slide.background = _.assign(this.slide.background, bg_cache);
                    } else {
                        this.slide.background.type = 'image';
                    }
                } else {
                    bg_cache = _.assign({}, this.slide.background);
                    this.slide.background.name = '';
                    this.slide.background.path = '';
                    this.slide.background.type = 'color';
                }
                this.$parent.setPreview(this.slide);
            }
        },

        computed: {
            current_positions() {
                var positions = {tl: '', tr: '', c: '', bl: '', br: ''};
                this.slide.modules.forEach(module => {
                    if (module.config.position) {
                        positions[module.config.position] = module;
                    }
                });
                //title gets prio
                if (this.slide.config.title.active) {
                    positions[this.slide.config.title.position] = {name: 'title', label: 'Titel'};
                }
                return positions;
            },
            current_module_data() {
                return _.find(this.modules, {name: this.current_module.name});
            }
        },

        methods: {
            bootSlideshow(force) {
                if (force) {
                    this.$els.slideshow.setAttribute('data-slideshowSj', '')
                }
                this.slideshow = UIkit.slideshowSj(this.$els.slideshow, {
                    animation: this.channel.config.player.animation,
                });
            },
            editPrev() {
                var slide = _.find(this.channel.content.slides, {number: (this.slide.number == 1 ? 10 : (this.slide.number - 1))});
                this.editSlide(slide);
            },
            editNext() {
                var slide = _.find(this.channel.content.slides, {number: (this.slide.number == 10 ? 1 : (this.slide.number + 1))});
                this.editSlide(slide);
            },
            editSlide(slide) {
                this.$parent.editSlide(slide);
            },
            saveSlide() {
                this.$parent.saveChannel(false);
            },
            setModule(module) {
                var active = _.find(this.slide.modules, {name: module.name});
                this.current_module = active || {name: module.name, label: module.label, config: _.defaultsDeep({}, module.config)};
            },
            pickMedia(media) {
                this.slide.background.src = media.image_url;
                this.slide.background.name = media.name;
                this.slide.background.path = media.path;
                this.slide.background.type = media.type;
                this.slide.background.width = media.data.width || 0;
                this.slide.background.height = media.data.height || 0;
                if (this.slide.background.type === 'video') {
//                    this.bootSlideshow(true)
                }
                this.$parent.setPreview(this.slide);
            },
            uploadMedia(media) {
                this.current_collection = 'user';
                this.edit_media = media || _.defaultsDeep({collection: ''}, default_media);
                this.getModal().show();
            },
            removeMedia(media) {
                UIkit.modal.confirm(this.$trans('Wilt u deze media definitief verwijderen?'), () => {
                    this.$root.command('slide-edit', 'media.delete.bulk', {medias: [media]});
                    setTimeout(() => this.$broadcast('media.collection.refesh'), 200);
                });
            },
            closeUploader() {
                this.getModal().hide();
            },
            upload() {
                this.$refs.uploader.upload();
            },
            afterUpload(saved) {
                if (!saved) {
                    this.$root.command('slide-edit', 'media.save', {media: this.edit_media});
                }
                this.$broadcast('media.collection.refesh');
                this.closeUploader();
                console.log(this.edit_media);
            },
            previewImageSrc(channel, slide) {
                return this.$parent.previewImageSrc(channel, slide);
            },
            getModal() {
                if (!this.upload_modal) {
                    this.upload_modal = UIkit.modal(this.$els.uploadmodal, {modal: false});
                    this.upload_modal.on('hide.uk.modal', () => this.edit_media = false);
                }
                return this.upload_modal;
            },
            getBgTypeLabel(type) {
                return {
                    color: this.$trans('Achtergrondkleur'),
                    image: this.$trans('Afbeelding/Video'),
                    video: this.$trans('Video')
                }[type] || type;
            },
            setTitlePosition(pos) {
                if (this.positionError(pos, 'title') !== '') {
                    return;
                }
                this.slide.config.title.position = pos;
            },
            positionError(pos, module_name) {
                var message = '';
                if (this.current_positions[pos] && this.current_positions[pos].name !== module_name) {
                    message = this.$trans('Positie is al in gebruik door module %label%.', {label: this.current_positions[pos].label})
                }
                if (pos == this.slide.config.title.position && this.slide.config.title.active && module_name !== 'title') {
                    message = this.$trans('Positie is al in gebruik door de titel.');
                }
                return message;
            }
        },

        partials: {
            'slide-edit-title': require('../partials/slide-edit-title.html'),
        },

        components: {
            'screen-slide': require('./screen-slide.vue'),
            'time-duration': require('./ui/time-duration.vue'),
            'select-default': require('./ui/select-default.vue'),
            'media-collection': require('./ui/media-collection.vue'),
            'slide-modules': require('./ui/slide-modules.vue'),
            'media-upload': require('./ui/media-upload.vue'),
            'field-color': require('./ui/field-color.vue')

        },

        form_fields: {
            title: {
                size: {
                    type: 'select',
                    label: 'Tekstgrootte',
                    options: select_options.heading_size,
                    attrs: {'class': 'uk-form-width-medium'}
                },
                color: {
                    type: 'select',
                    label: 'Tekstkleur',
                    options: select_options.text_color,
                    attrs: {'class': 'uk-form-width-medium'}
                },
                uppercase: {
                    type: 'checkbox',
                    optionlabel: 'In hoofdletters'
                },
                bold: {
                    type: 'checkbox',
                    optionlabel: 'Dikgedrukt'
                }
            }
        }

    };

</script>