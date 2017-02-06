
var forecast = require('./lib/forecast');
var select_options = require('../../lib/options');

module.exports = {

    name: 'weather',

    label: 'Weer widget',

    image_url: 'assets/content/modules/weather.png',

    config: {
        position: '',
        title: '',
        panel: '',
        opacity: 1,
        show_text: true,
        fullwidth: false,
        location: {
            name: '',
            gid: '',
            lat: '',
            lng: ''
        },
        forecast: {
            template: 'weather-three',
            units: 'C'
        },
        text: {
            color: '',
            size: ''
        }
    },

    google_api_key: process.env.SJ_GOOGLE_JS_API_KEY,

    fields: {
        config: {
            'forecast.template': {
                type: 'select',
                label: 'Template',
                options: {
                    'Vandaag': 'weather-today', /*trans*/
                    '3 dagen': 'weather-three', /*trans*/
                    '5 dagen': 'weather-five' /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'text.color': {
                type: 'select',
                label: 'Tekstkleur',
                options: select_options.text_color,
                attrs: {'class': 'uk-form-width-medium'}
            },
            'text.size': {
                type: 'select',
                label: 'Tekstgrootte',
                options: select_options.text_size,
                attrs: {'class': 'uk-form-width-medium'}
            }
        },
        advanced_1: {
            'forecast.units': {
                type: 'select',
                label: 'Maateenheid',
                options: {
                    'Celcius': 'C', /*trans*/
                    'Fahrenheit': 'F', /*trans*/
                },
                attrs: {'class': 'uk-form-width-medium'}
            },
            'show_text': {
                type: 'checkbox',
                label: 'Toon tekst in verwachting'
            }
        }
    },

    commands: {
        getWeather(config, params, cb) {
            if (!config.location.lat || !config.location.lng) {
                return cb(null, {
                    error: 'Geen lat-lng voor locatie bekend.',
                    weather: {}
                });
            }
            forecast.getWeather(config.forecast.units, config.location.lat, config.location.lng, (params.ignore_cache || false), params.id,
                (err, weather) => {
                    if (err) {
                        //todo retry/return cache
                        return cb(err);
                    }
                    cb(null, {error: false, weather, params});
                });
        }
    }
};