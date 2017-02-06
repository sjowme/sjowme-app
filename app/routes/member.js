var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var crypto = require('crypto');

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function httpError(statusCode, message) {
    var err = new Error(message);
    err.statusCode = statusCode;
    return err;

}
module.exports = (passport, config, lib, database, modules) => {

    var default_data = {
        layout: 'layouts/member',
        title: config.site_title,
        page: 'Dashboard',
        home_url: config.baseUrl(),
        environment: config.environment,
        default_locale: config.default_locale,
        admin_url: config.baseUrl('admin'),
        data: {
            home_url: config.baseUrl(),
            screen_url: config.baseUrl('screen'),
            component: 'member-main',
            socket_token: ''
        },
        scripts: []
    };

    //set socket token on new sessions
    router.use(function socketToken(req, res, next) {

        if (req.isAuthenticated() && !req.session.socket_token) {
            var hash = crypto.createHmac('sha512', config.sessionSecret);
            hash.update(req.user.name + req.session.id);
            req.session.socket_token = hash.digest('hex');

            lib.events.setToken(req.session.socket_token, req.user.id);

            console.log(`socket_token set: ${req.session.socket_token}`);

        }
        next();
    });

    // define routes
    router.get('/', ensureAuthenticated, (req, res) => {

        res.render('member/index', _.defaults({
            data: {
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            },
            scripts: [
                {src: '/assets/vimeo-player-js/dist/player.min.js'},
                {src: '/assets/uikit/js/components/notify.min.js'},
                {src: '/assets/uikit/js/components/tooltip.min.js'},
                {src: '/assets/uikit/js/components/lightbox.min.js'},
                {src: '/assets/uikit/js/components/grid.min.js'},
                {src: '/assets/uikit/js/components/pagination.min.js'},
                {src: '/assets/lodash/dist/lodash.min.js'},
                {src: '/assets/vue/vue.js'},
                {src: '/assets/spectrum/spectrum.js'},
                {src: 'js/app.js'},
            ]
        }, default_data));

    });

    router.get('/profiel', ensureAuthenticated, (req, res) => {
        //make sure callback is triggered when webhook is missed or in local dev
        //(callback set in socket member, addSubscr task)
        lib.events.trigger(`payment.pending`, (err, subscription, invoice, user) => {
            if (err) {
                return console.error(err);
            }
            lib.mailer.sendSubscriptionConfirmation(subscription, invoice, user);
        });

        res.render('member/index', _.defaults({
            page: 'Profiel',
            data: {
                component: 'member-profile',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            },
            scripts: [
                {src: '/assets/uikit/js/components/notify.min.js'},
                {src: '/assets/uikit/js/components/tooltip.min.js'},
                {src: '/assets/uikit/js/components/lightbox.min.js'},
                {src: '/assets/lodash/dist/lodash.min.js'},
                {src: '/assets/vue/vue.js'},
                {src: 'js/app.js'},
            ]
        }, default_data));

    });

    //invoice pdf
    router.get(/\/pdf\/factuur\/([A-Z,0-9]+-\d.*)\/(download|bekijk)/i, ensureAuthenticated, (req, res) => {
        var invoice_number = req.params[0];
        var type = req.params[1];
        database.invoice.findByNumber(invoice_number)
            .then(invoice => {
                if (invoice === false) {
                    throw httpError(404, `Invoice ${invoice_number} not found`);
                }
                if (invoice.user_id !== req.user.id && !req.user.isAdmin) {
                    throw httpError(403, 'No access');
                }

                return lib.pdf.invoiceStream(invoice);
            })
            .then(stream => {
                res.setHeader('Content-Type', 'application/pdf');
                if (type === 'download') {
                    res.setHeader('Content-Disposition', `attachment; filename=${invoice_number}.pdf`);
                }
                stream.pipe(res);
            })
            .catch(err => {
                if (err.statusCode) {
                    res.status(err.statusCode);
                }
                res.send(err.message);
            });

    });

    //slide preview
    router.get(/\/c(\d.*)\/slide(\d)/i, (req, res) => {
        var channel_id = Number(req.params[0]);
        var slide_number = Number(req.params[1]);
        //create token to check
        var hash = crypto.createHmac('sha512', config.sessionSecret);
        hash.update(channel_id + slide_number + req.session.id);
        var socket_token = hash.digest('hex');

        lib.events.setToken(socket_token, true);

        database.channel.findById(channel_id).then(channel => {
            if (channel.owner !== 0 && (!req.user || !req.user.isAdmin)) {
                throw Error('Geen toegang tot deze show.');
            }
            var slide = _.find(channel.content.slides, {number: slide_number});
            res.render('member/slide', {
                layout: 'slide_preview',
                data:{
                    socket_token,
                    modules: modules.siteData(),
                    channel,
                    slide
                }
            });
        }).catch(err => res.status(500).send(err.message || err));
    });

    //sjow preview
    router.get(['/demo', /\/demo\/(\d.*)/], (req, res) => {
        database.config.load('general')
            .then(general_config => {
                var channel_id = Number(req.params[0]) || Number(general_config.default_channel);
                if (!channel_id) {
                    throw Error('Geen standaard sjow ingesteld.');
                }
                return database.channel.findById(channel_id);
            })
            .then(channel => {
                if (channel.owner !== 0 && (!req.user || !req.user.isAdmin)) {
                    throw Error('Geen toegang tot deze show.');
                }
                //create token to check
                var hash = crypto.createHmac('sha512', config.sessionSecret);
                hash.update(channel.id + req.session.id);
                var socket_token = hash.digest('hex');
                var screen = {id: 0};
                lib.events.setToken(socket_token, true);
                res.render('member/demo', {
                    layout: 'slide_preview',
                    data:{
                        socket_token,
                        viewdata: {
                            modules: modules.siteData(),
                            channel,
                            screen
                        }
                    }
                });
            })
            .catch(err => res.status(500).send(err.message || err));
    });

    //authentication routes
    router.get('/login', (req, res) => {
        res.render('member/login',  _.defaults({
            page: 'Inloggen',
            google_url: `${(config.baseUrl('member'))}/auth/google`
        }, default_data));
    });

    router.post('/payment/webhook', (req, res) => {
        var transaction_id = req.body.id;
        if (transaction_id) {
            console.log(`Webhook request for ${transaction_id}`);
            //callback set in socket member, addSubscr task
            var triggered = lib.events.trigger(`payment.pending`, (err, subscription, invoice, user) => {
                if (err) {
                    return res.status(400).send(err);
                }
                lib.mailer.sendSubscriptionConfirmation(subscription, invoice, user);
                res.send('OK');
            });
            if (!triggered) {
                res.send('No pending request');
            }
        } else {
            res.send('No transaction ID');
        }
    });

    router.get('/auth/google', (req, res, next) => {
        var match = /:\/\/([a-z]+)\./.exec(req.get('Referer'));
        req.session.returnTo = `${(config.baseUrl(match ? match[1] : 'member'))}`;
        next();
    }, passport.authenticate('google', {
        access_type: 'offline',
        approval_prompt: 'force',
        scope: [
            'https://www.googleapis.com/auth/plus.me',
            'email'
        ]
    }));

    router.get('/auth/google/callback', passport.authenticate('google', {
        // successReturnToOrRedirect: '/', //overwritten to sub domain by returnTo in session
        failureRedirect: '/login'
    }), (req, res, next) => {
        // Issue a remember me cookie if the option was checked
        // if (!req.body.remember_me) { return next(); }
        var token = lib.utils.randomString(64);
        console.log('RememberMeStrategy.generateToken.root', req.user.name);
        database.user.save({id: req.user.id, remember: token}).then(user => {
            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
            console.log('RememberMeStrategy.generateToken.root', user.remember);
            return next();
        }, err => next(err));

    }, (req, res) => {
        var returnTo = '/';
        if (req.session.returnTo) {
            returnTo = req.session.returnTo;
            delete req.session.returnTo;
        }
        res.redirect(returnTo);
    });

    router.get('/logout', (req, res) => {
        // clear the remember me cookie when logging out
        res.clearCookie('remember_me');
        req.logout();
        res.redirect('/');
    });

    //statics
    router.get('*', express.static(path.resolve(config.root(), '..', '_public', 'member')));

    return router;
};
