
var fs = require('fs');
var path = require('path');
var config = require('../config');

var errorLogStream;

if (config.log.errors) {
    var error_file = path.resolve(config.root(), config.log.path) + '/error.log';
    errorLogStream = fs.createWriteStream(error_file, {flags: 'a'});
}

module.exports = {
    logErrors(err, req, res, next) {
        if (errorLogStream) {
            errorLogStream.write(formatDate(new Date()) + ` ${req.ip}@${req.originalUrl}\n${err.stack}\n`);
        } else {
            if (err.status === 404) {
                console.error(`404 error on ${req.url}`);
            } else {
                console.error(err);
            }
        }
        next(err);
    },
    clientErrorHandler(err, req, res, next) {
        if (err.status === 404) {
            res.status(404);
            res.render('404', {
                error: err ,
                url: req.url,
                home_url: config.baseUrl()
            });
        } else {
            next(err);
        }
    },
    errorHandler(err, req, res, next) {
        if (res.headersSent) {
            return next(err);
        }
        res.status(500);
        res.render('error', { error: err, home_url: config.baseUrl() });
    },
};

function formatDate(dateTime) {
    var date = dateTime.getUTCDate();
    var hour = dateTime.getUTCHours();
    var mins = dateTime.getUTCMinutes();
    var secs = dateTime.getUTCSeconds();
    var year = dateTime.getUTCFullYear();
    var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

    var month = months[dateTime.getUTCMonth()];

    return pad2(date) + '-' + month + '-' + year +
        '-' + pad2(hour) + ':' + pad2(mins) + ':' + pad2(secs) +
        ' +0000';
}

function pad2(num) {
    var str = String(num);
    return (str.length === 1 ? '0' : '') + str;
}
