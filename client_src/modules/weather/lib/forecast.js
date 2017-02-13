
var config = require('../../../../app/config');
var Forecast = require('forecast');

var casters = {};

function getForecaster(units) {
    if (casters[units] !== undefined) {
        return casters[units];
    }
    casters[units] = new Forecast({
        service: 'forecast.io',
        key: config.darksky.api_key,
        units: units, // Only the first letter is parsed
        cache: true,      // Cache API requests?
        ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
            minutes: config.darksky.ttl
        }
    });
    return casters[units];
}

module.exports = {

    getWeather(units, lat, lng, ignore_cache, id, cb) {
        // Retrieve weather information from coordinates
        getForecaster(units).get([lat, lng], ignore_cache || false, (err, weather) => {
            if(err) {
                return cb(err);
            }
            cb(null,  weather);
        });
    }

};
