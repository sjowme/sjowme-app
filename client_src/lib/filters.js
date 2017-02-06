//todo get moment/intl
function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

var icons = {
    'EUR': 'uk-icon-euro',
    'USD': 'uk-icon-dollar'
};
var default_currency = 'EUR';
var default_locale = 'nl-NL';

function formatprice(price, currency) {
    var icon = '<i class="' + icons[currency || default_currency] + ' uk-margin-small-right"></i>';
    return icon + Number(price || 0).toLocaleString(default_locale, {minimumFractionDigits: 2});
}

module.exports = (Vue) => {

    Vue.filter('time', date => {
        try {
            return (new Date(date)).toLocaleTimeString();
        } catch (e) {
            return date;
        }
    });

    Vue.filter('datetime', date => {
        try {
            return (new Date(date)).toLocaleString();
        } catch (e) {
            return date;
        }
    });

    Vue.filter('date', date => {
        try {
            return (new Date(date)).toLocaleString().split(' ')[0];
        } catch (e) {
            return date;
        }
    });

    Vue.filter('relTime', milliseconds => millisecondsToStr(milliseconds));

    Vue.filter('formatprice', price => formatprice(price));

    Vue.filter('filesize', size => {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    });

    Vue.filter('trans', function (id, parameters, domain, locale) {
        return this.$trans(id, parameters, domain, locale);
    });

    Vue.filter('transChoice', function (id, number, parameters, domain, locale) {
        return this.$transChoice(id, number, parameters, domain, locale);
    });

};