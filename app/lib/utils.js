exports.randomString = (len) => {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Date.prototype.toLocaleDateString = function (locale) {
    var d = this;
    return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear(); //todo translate
};

exports.formatPeriod = (start_date, end_date) => {
    return `${formatDate(start_date)} - ${formatDate(end_date)}`;
};

function formatDate(date) {
    try {
        return (new Date(date)).toLocaleDateString();
    } catch (e) {
        return date;
    }
}
