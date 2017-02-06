var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');

module.exports = (passport, config, lib, database) => {
    var default_data = {
        layout: 'layouts/main',
        component: 'site-main',
        title: config.site_title,
        page: 'Home',
        home_url: config.baseUrl(),
        member_home: config.baseUrl('member'),
        data: {
        },
        scripts: []
    };

    // define routes
    router.get('/', function(req, res) {
        res.render('site/index',  default_data);
    });

    router.get('/auth/google', (req, res, next) => {
        var match = /:\/\/([a-z]+)\./.exec(req.get('Referer'));
        req.session.returnTo = `${(config.baseUrl(match ? match[1] : null))}`;
        next();
    }, passport.authenticate('google', {
        access_type: 'offline',
        approval_prompt: 'force',
        scope: [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/drive',
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

    //statics
    router.get('*', express.static(path.resolve(config.root(), '..', '_public', 'default')));

    return router;

};
