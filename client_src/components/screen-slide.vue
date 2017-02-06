<template>

    <li class="sj-slide">
        <partial :name="'media-' + slide.background.type"></partial>
        <div class="uk-overlay-panel uk-flex uk-flex-center uk-flex-middle" :class="overlayPanelClasses" :style="overlayPanelStyle">

            <div v-if="slide.config.title.active" class="sj-module sj-module-title" :class="titleModuleClasses">
                <h1 :class="titleClasses">{{ slide.title }}</h1>
            </div>

            <div v-for="module in slide_modules" class="sj-module" :class="moduleClasses(module)">
                <component :is="'module-' + module.name"
                           :config="module.config"
                           :module="moduleData(module.name)"
                           :channel="channel"
                           :slide="slide"></component>
            </div>

        </div>
    </li>

</template>
<script>

    var VideoMixin = require('../mixins/video');

    module.exports = {

        props: ['slide', 'channel', 'modules'],

        mixins: [VideoMixin],

        data() {
            return {
                visible: false
            };
        },

        ready() {
            if (this.slide.background.type === 'video') {
                this.loadVideo();
            }
        },

        events: {
            'slide.show': function (slide_number) {
                console.log('show', slide_number);
                if (this.slide.number === slide_number) {
                    this.visible = true;
                    this.onShow();
                }
            },
            'slide.hide': function (slide_number) {
                console.log('hide', slide_number);
                if (this.slide.number === slide_number) {
                    this.visible = false;
                    this.onHide();
                }
            }
        },

        computed: {
            slide_modules() {
                return this.slide.modules.filter(module => (module.config.position));
            },
            overlayPanelStyle() {
                if (this.slide.background.bg_type == 'color') {
                    return `background-color: ${this.slide.background.color}`;
                }
                return '';
            },
            overlayPanelClasses() {
                var classes = [`sj-style-${this.slide.config.style}`];
                if (this.slide.config.style == 'dark') {
                    classes.push('uk-contrast');
                }
                return classes;
            },
            titleModuleClasses() {
                return `sj-pos-${this.slide.config.title.position} sj-slide-${this.slide.config.size}`;
            },
            titleClasses() {
                var classes = [
                    this.slide.config.title.size,
                    this.slide.config.title.color
                ];
                if (this.slide.config.title.uppercase) {
                    classes.push('uk-text-uppercase');
                }
                if (this.slide.config.title.bold) {
                    classes.push('uk-text-bold');
                }
                return classes;
            }
        },

        methods: {
            onShow() {
                if (this.slide.background.type === 'video') {
                    this.playVideo();
                }
            },
            onHide() {
                if (this.slide.background.type === 'video') {
                    this.pauseVideo();
                }
            },
            moduleClasses(module) {
                var classes = [`sj-module-${module.name}`, `sj-pos-${module.config.position}`, `sj-slide-${module.config.text.size || this.slide.config.size}`];
                if (module.config.fullwidth) {
                    classes.push('sj-module-fullwidth');
                }
                return classes;
            },
            moduleCommand(module, command, data) {
                console.log(`module.command: send ${command} for ${(module)}`);
                var moduleObj = _.find(this.slide.modules, {name: module}) ||  _.find(this.modules, {name: module});
                this.$root.socket.emit('module.command', module, command, moduleObj.config, data);
            },
            moduleData(name) {
                return _.find(this.modules, {name});
            }
        },

        partials: {
            'media-image': require('../partials/media-image.html'),
            'media-video': require('../partials/media-video.html'),
            'media-color': require('../partials/media-color.html')
        },

        components: {
            'module-logo': require('../modules/logo/module.vue'),
            'module-list': require('../modules/list/module.vue'),
            'module-weather': require('../modules/weather/module.vue'),
            'module-iframe': require('../modules/iframe/module.vue'),
            'module-twitter': require('../modules/twitter/module.vue'),
            'module-clock': require('../modules/clock/module.vue'),
            'module-rss': require('../modules/rss/module.vue'),
            'module-ticketcounter': require('../modules/ticketcounter/module.vue')
        }

    };

</script>