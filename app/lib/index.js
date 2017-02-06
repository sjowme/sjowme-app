
var locator = require('./locator');

module.exports = {
    locator: locator,
    exitmanager: require('./exitmanager'),
    mailer: require('./mailer'),
    pdf: require('./pdf'),
    utils: require('./utils'),
    error: require('./error'),
    events: require('./events'),
    media: require('./media')(locator)
};