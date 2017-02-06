<template>
    <div>
        <div v-if="viewdata.channel.id" class="uk-slidenav-position" v-el:slideshow>

            <ul class="uk-slideshow uk-slideshow-fullscreen">
                <screen-slide v-for="slide in viewdata.channel.content.slides | filterBy true in 'active'"
                              :slide="slide"
                              :channel="viewdata.channel"
                              :modules="viewdata.modules"></screen-slide>
            </ul>
            <div class="uk-position-bottom-right uk-margin-small-right uk-margin-small-bottom">
                <a v-show="isFullscreen" class="uk-icon-compress uk-link-muted"
                   :title="$trans('Verlaat volledig scherm')" @click="exitFullscreen"></a>
                <a v-else class="uk-icon-expand uk-link-muted" :title="$trans('Maak volledig scherm')" @click="openFullscreen"></a>
            </div>
        </div>
        <div v-else class="uk-flex uk-flex-center uk-flex-middle uk-height-viewport">
            <div class="uk-panel uk-panel-box uk-text-center">
                <div class="uk-panel-teaser">
                    <img src="/assets/images/sjowmelogo.png" style="width: 60%;" alt="Sjowme!"/>
                </div>

                <h2 class="uk-margin-bottom-remove">{{ 'Uw scherm ID nummer' | trans }}</h2>

                <h1 class="uk-heading-large uk-margin-remove">{{ viewdata.screen.id }}</h1>

                <p class="uk-margin-top-remove">
                    <a @click="$root.refreshScreenId" class="uk-icon-refresh"></a> {{ 'Refresh indien nodig' | trans }}
                </p>
                <p>{{ 'Voer dit ID nummer in op het dashboard van SjowMe' | trans }}.</p>
            </div>

        </div>
    </div>
</template>
<script>

    require('../slideshow/slideshow');
    require('../slideshow/slideshow-fx');
    var screenfull = require('screenfull');

    module.exports = {

        props: ['viewdata'],

        data() {
            return {
                isFullscreen: false,
                autoPlay: true,
                current_slide_number: 0,
                slideshow: null,
                timeout: null,
                player_settings: {}
            }
        },

        created() {
            if (screenfull.enabled) {
                UIkit.$html.on(screenfull.raw.fullscreenchange, () => {
                    this.isFullscreen = screenfull.isFullscreen;
                });
            }
        },

        events: {
            'screen.data.init': function (data) {
                this.$nextTick(this.bootSlideshow);
            },
            'hook:destroy': function () {
                clearTimeout(this.timeout)
            }
        },

        methods: {
            bootSlideshow() {
                this.slideshow = UIkit.slideshowSj(this.$els.slideshow, {
                    animation: this.viewdata.channel.config.player.animation,
                });
                this.viewdata.channel.content.slides.filter(sl => sl.active).forEach(slide => {
                    this.player_settings[slide.number] = slide.config.player
                });
                this.show(Number(Object.keys(this.player_settings)[0]));
            },
            show(slide_nr) {
                if (this.slideshow) {
                    if (this.timeout) {
                        clearTimeout(this.timeout)
                    }
                    var direction = this.current_slide_number < slide_nr ? 1 : -1;
                    var animation = this.player_settings[slide_nr].animation || this.viewdata.channel.config.player.animation;

                    var nav = this.getNav(slide_nr);

                    this.$broadcast('slide.hide', this.current_slide_number);
                    this.current_slide_number = slide_nr;
                    this.$broadcast('slide.show', slide_nr);
                    this.slideshow.show(nav.current_idx, direction, animation);

                    if (this.autoPlay) {
                        this.timeout = setTimeout(() => {
                            this.show(nav.slide_number);
                        }, (this.player_settings[slide_nr].duration || this.viewdata.channel.config.player.duration))
                    }
                }
            },
            getNav(current_slide_nr) {
                var slide_number,
                        index,
                        current_idx = -1,
                        slide_numbers = Object.keys(this.player_settings).map(nr => Number(nr));
                slide_numbers.forEach((sl_nr, idx) => {
                    if (current_slide_nr === sl_nr) {
                        current_idx = idx;
                    }
                });
                if ((slide_numbers.length - 1) === current_idx) {
                    //first slide
                    index = 0;
                    slide_number = slide_numbers[0];
                } else {
                    index = current_idx + 1;
                    slide_number = slide_numbers[index];
                }
                return {slide_number, index, current_idx};
            },
            openFullscreen() {
                if (screenfull.enabled) {
                    screenfull.request();
                } else {
                    UIkit.notify('Fullscreen niet mogelijk.', 'warning')
                }
            },
            exitFullscreen() {
                screenfull.exit();
            }
        },

        components: {
            'screen-slide': require('./screen-slide.vue'),
        }

    };

</script>