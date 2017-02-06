
"use strict";

const nodemailer = require('nodemailer');
const config = require('../config');
const transporter = nodemailer.createTransport(config.mailer.connection);

var sendErrorMail = config.log.sendErrorMail || false;
var sendExitMail = config.log.sendExitMail || false;


function exitManager() {


    process.on('uncaughtException', function (err) {

        if (sendErrorMail) {
            transporter.sendMail({
                from: 'info@sjow.me',
                to: sendErrorMail,
                subject: `SjowMe server error: ${err.message}`,
                html: '<b>' + (new Date()).toUTCString() + ' uncaught exception:<br>' + err.message + '<br><pre>' + err.stack + '</pre></b>',
                text: err.message
            });
            transporter.close();
        }

        console.error((new Date()).toUTCString() + ' uncaught exception:', err.message);
        console.error(err.stack);
        process.nextTick(() => {
            process.exit(1);
        });

    });

    function exitHandler(options, err) {
        if (options.cleanup) {
            console.log('clean');
        }
        if (err) {
            console.log(err.stack);
        }
        if (options.exit) {
            process.exit();
        }
    }

    //do something when app is closing
    process.on('exit', function () {
        if (sendExitMail) {
            transporter.sendMail({
                from: 'info@sjow.me',
                to: sendExitMail,
                subject: 'SjowMe server down !',
                html: '<b>' + (new Date()).toUTCString() + '<br>Sjow.me is shutting down !! </b>',
                text: 'Sjow.me is shutting down'
            });
            transporter.close();
        }
        console.log("exiting");
        exitHandler({cleanup: true});
    });

    //catches ctrl+c event
    process.on('SIGINT', function () {
        if (sendExitMail) {
            transporter.sendMail({
                from: 'info@sjow.me',
                to: sendExitMail,
                subject: 'SjowMe server killed !',
                html: '<b>' + (new Date()).toUTCString() + '<br>Sjow.me is beeing killed </b>',
                text: 'Sjow.me is beeing killed'
            });
            transporter.close();
        }
        console.log("SIGINT");
        exitHandler({exit: true});
    });
}


module.exports = exitManager;
