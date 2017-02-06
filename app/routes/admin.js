var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var crypto = require('crypto');

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticatedAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.redirect('/login');
}

module.exports = (passport, config, lib) => {

    var default_data = {
        layout: 'layouts/admin',
        title: config.site_title,
        page: 'Dashboard',
        home_url: config.baseUrl(),
        environment: config.environment,
        default_locale: config.default_locale,
        member_url: config.baseUrl('member'),
        data: {
            component: 'admin-main',
            member_url: config.baseUrl('member'),
            socket_token: ''
        },
        scripts: [
            {src: '/assets/vimeo-player-js/dist/player.min.js'},
            {src: '/assets/uikit/js/components/notify.min.js'},
            {src: '/assets/uikit/js/components/pagination.min.js'},
            {src: '/assets/uikit/js/components/grid.min.js'},
            {src: '/assets/uikit/js/components/tooltip.min.js'},
            {src: '/assets/uikit/js/components/slideshow.min.js'},
            {src: '/assets/uikit/js/components/slideshow-fx.min.js'},
            {src: '/assets/uikit/js/components/lightbox.min.js'},
            {src: '/assets/lodash/dist/lodash.min.js'},
            {src: '/assets/vue/vue.js'},
            {src: '/assets/spectrum/spectrum.js'},
            {src: 'js/app.js'},
        ]
    };

    //set socket token on new sessions
    router.use(function socketToken(req, res, next) {

        if (req.isAuthenticated() && req.user.isAdmin && !req.session.socket_token) {
            var hash = crypto.createHmac('sha512', config.sessionSecret);
            hash.update(req.user.name + req.session.id);
            req.session.socket_token = hash.digest('hex');

            lib.events.setToken(req.session.socket_token, req.user.id);

            console.log(`socket_token set: ${req.session.socket_token}`);

        }

        next();
    });

    // define routes
    router.get('/', ensureAuthenticatedAdmin, (req, res) => {

        res.render('admin/index', _.defaultsDeep({
            data: {
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/gebruikers', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Gebruikers',
            data: {
                component: 'user-list',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/sjows', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Sjows',
            data: {
                component: 'channel-list',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/mediabeheer', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Media',
            data: {
                component: 'media-list',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/abonnementen', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Abonnementen',
            data: {
                component: 'subscription-list',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/facturen', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Facturen',
            data: {
                component: 'invoice-list',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    router.get('/configuratie', ensureAuthenticatedAdmin, function (req, res) {

        res.render('admin/index', _.defaultsDeep({
            page: 'Configuratie',
            data: {
                component: 'admin-config',
                member_id: req.user.id,
                socket_token: req.session.socket_token,
                user: req.user
            }
        }, default_data));

    });

    //authentication routes
    router.get('/login', (req, res) => {
        res.render('admin/login',  _.defaults({
            page: 'Inloggen',
            google_url: `${(config.baseUrl('member'))}/auth/google`
        }, default_data));
    });

    router.get('/logout', function (req, res) {
        // clear the remember me cookie when logging out
        res.clearCookie('remember_me');
        req.logout();
        res.redirect('/');
    });

    //statics
    router.get('*', express.static(path.resolve(config.root(), '..', '_public', 'admin')));

    return router;
};
