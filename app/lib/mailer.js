"use strict";

const nodemailer = require('nodemailer');
const config = require('../config');
const path = require('path');
const ejs = require('ejs');
const striptags = require('striptags');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(config.mailer.connection);

/**
 *
 * @param {String} to
 * @param {String} subject
 * @param {String} template
 * @param {Object} data
 * @param {Array} attachments
 * @returns {Promise}
 */
function sendMail(to, subject, template, data, attachments) {

    return new Promise((resolve, reject) => {

        ejs.renderFile(path.join(config.views(), 'mail', `${template}.ejs`), {data, base_url: config.baseUrl('member')}, (err, body) => {
            if (err) {
                return reject(err);
            }

            const mail_options = {
                from: `"${config.mailer.from_name}" <${config.mailer.from_address}>`, // sender address
                to: to, // list of receivers
                bcc: config.environment === 'production' ? config.mailer.bcc : '', // list of bcc
                subject: subject, // Subject line
                text: striptags(body), // plaintext body
                html: body // html body
            };
            if (attachments) {
                //todo
            }

            // send mail with defined transport object
            transporter.sendMail(mail_options, (err, info) => {
                if (err) {
                    return reject(err);
                }
                // console.log('Message sent: ' + info.envelope);
                resolve(info);
            });
        });

    });

}

module.exports = {
    sendMail,
    sendRegistration(user) {
        //todo translate
        const subject = 'Welkom bij SjowMe!';
        return sendMail(user.email, subject, 'register', {user}, []);

    },
    sendSubscriptionExpiring(subscription, days_to_expire) {
        //todo translate
        const subject = 'Uw abonnement bij SjowMe verloopt over %days% dagen!'.replace('%days%', days_to_expire);
        return sendMail(subscription.user_email, subject, 'subscription_expire', {subscription, days_to_expire}, []);
    },
    sendSubscriptionConfirmation(subscription, invoice, user) {
        //todo translate
        const subject = 'Bedankt voor uw order bij SjowMe!';
        return sendMail(user.email, subject, 'subscription_confirm', {subscription, invoice, user}, []);

    }
};

