<template>
    <div class="uk-form uk-form-horizontal-large">
        <div class="uk-margin uk-flex uk-flex-middle uk-flex-space-between">
            <h3 class="uk-margin-remove uk-flex-item-1">{{ 'Instellingen' | trans }} {{ module.label }}</h3>
            <info-icon url="//www.sjow.me/module-weer-widget/"
                       :title="$trans('Meer informatie')"></info-icon>
            <module-advanced :settings_id="settings_id" class="uk-margin-left">
                <partial name="module-advanced"></partial>
            </module-advanced>
        </div>

        <div :id="settings_id" class="uk-margin uk-grid uk-grid-width-medium-1-2" data-uk-grid-margin>
            <div>
                <partial name="module-settings"></partial>

            </div>
            <div>
                <div class="uk-form-row">
                    <span class="uk-form-label">{{ 'Zoek locatie' | trans }}</span>
                    <div class="uk-form-controls">
                        <input type="text" v-el:search v-model="search" class="uk-form-width-medium">
                    </div>
                </div>

                <div class="uk-form-row">
                    <label class="uk-form-label">{{ 'Naam locatie' | trans }}</label>
                    <div class="uk-form-controls">
                        <input type="text" v-model="config.location.name" class="uk-form-width-medium uk-form-blank">
                        <p class="uk-form-help-block"><em class="uk-text-small">
                            lat: {{ config.location.lat }}, lng: {{ config.location.lng }}
                        </em></p>
                    </div>
                </div>

                <fields :model.sync="config" :config="module.fields.config" template="formrow"></fields>

                <p class="uk-text-center">
                    <em><a href="https://darksky.net/poweredby/" target="_blank" class="uk-link-muted">Powered by Dark Sky</a></em>
                </p>

            </div>
        </div>

    </div>
</template>
<script>

    var moduleMixin = require('../mixin-settings');

    var ModuleSettings = {

        mixins: [moduleMixin],

        data() {
            return {
                GoogleMapsLoader: window.GoogleMapsLoader,
                search: '',
                weather: {}
            };
        },

        created() {
            //catch if loaded late
            UIkit.$body.on('google-maps.loaded', (GoogleMapsLoader) => {
                this.GoogleMapsLoader = GoogleMapsLoader;
            });
        },

        ready() {
            this.GoogleMapsLoader.KEY = this.module.google_api_key;
            GoogleMapsLoader.LIBRARIES = ['places'];

            this.GoogleMapsLoader.load((google) => {
                var autocomplete = new google.maps.places.Autocomplete(this.$els.search);

                google.maps.event.addListener(autocomplete, 'place_changed', () => {

                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                        return;
                    }
                    this.setAddress(place);
                });

            });
        },

        events: {
            'module.response.weather.getWeather': function (res) {
                if (res.error) {
                    UIkit.notify(res.error, 'danger');
                } else {
                    this.weather = res.weather
                }
                console.log(res);
            }
        },

        methods: {
            clearAddress() {},
            setAddress(place) {
                this.config.location.name = _.intersection(place.types, ['street_address']).length === 0 ? place.name : '';
                this.config.location.gid = place.id;
                this.config.location.lat = place.geometry.location.lat();
                this.config.location.lng = place.geometry.location.lng();
            },
            getWeather() {
                this.$parent.moduleCommand('weather', 'getWeather', {ignore_cache: false});
            }
        }

    };

    module.exports = (() => {
        var script = UIkit.$('<script>');
        script.on('load', () => {
            UIkit.$('body').trigger('google-maps.loaded', window.GoogleMapsLoader);
        });
        script.appendTo(UIkit.$('head')).attr('src', '/assets/google-maps/lib/Google.min.js');
        return ModuleSettings;
    })();
</script>