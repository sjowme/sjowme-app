<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <div class="uk-flex uk-flex-bottom uk-flex-space-between">
            <h3 class="uk-margin-bottom-remove uk-flex-item-1 uk-margin-right">{{ config.location.name }}</h3>
            <h2 class="uk-margin-remove">{{ temperature }} &deg;{{ config.forecast.units }}</h2>
        </div>
        <partial v-if="weather" :name="config.forecast.template"></partial>
    </div>
</template>
<script>

    var moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin],

        data() {
            return {
                interval: 0,
                weather: false,
				id: _.uniqueId('weather'),
            };
        },

        ready() {
            if (this.config.location.gid) {
                this.interval = setInterval(this.getWeather, (15 * 60 * 1000));
                this.getWeather();
            }
        },

        destroyed() {
            clearInterval(this.interval);
        },

        computed: {
            temperature() {
                if (!this.weather) {
                    return '-';
                }
                return this.roundTemp(this.weather.currently.apparentTemperature);
            },
            threeDayWeather() {
                return this.multiDays(3);
            },
            fiveDayWeather() {
                return this.multiDays(5);
            }
        },

        events: {
            'module.response.weather.getWeather': function (res) {
                if (res.error) {
                    UIkit.notify(res.error, 'danger');
                } else {
                    this.weather = res.weather
                }
            }
        },

        watch: {
            'config.location.gid + config.forecast.units': function() {
                this.getWeather();
            }
        },

        methods: {
            getWeather() {
                this.$parent.moduleCommand('weather', 'getWeather', {ignore_cache: false, id: this.id});
            },
            roundTemp(temp, round) {
                if (!temp) {
                    return '-';
                }
                var factor = round ? 1 : 10;
                return Math.round(temp * factor) / factor;
            },
            dayFromDailyTime(timestamp) {
                try {
                    var days = ['Zon', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Zat'],
                        date = new Date(timestamp * 1000);
                    return days[date.getDay()];
                } catch (ignore) {
                    return '';
                }
            },
            multiDays(days) {
                var multi_days = [];
                if (this.weather) {
                    for (var i = 1; i < (days + 1); i++) { //start with tomorrow
                        multi_days.push(this.weather.daily.data[i])
                    }
                }
                return multi_days;
            }
        },

        partials: {
            'weather-today': require('./templates/weather-today.html'),
            'weather-three': require('./templates/weather-three.html'),
            'weather-five': require('./templates/weather-five.html')
        }

    }

</script>