var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var RememberMeStrategy = require('passport-remember-me-extended').Strategy;
var _ = require('lodash');
var utils = require('./../lib/utils');
var defaults = require('../database/defaults');


module.exports = (config, lib, database, subscriptions) => {

    function consumeRememberMeToken(token, fn) {
        database.user.findByRemember({remember: token})
            .then((user) => {
                if (!user) {
                    return fn(null, false);
                }
                // invalidate the single-use token
                user.remember = '';
                user.updated_at = new Date();
                return database.user.save(user);
            }, err => fn(err))
            .then(user => {
                if (user) {
                    console.log(user.name);
                } else {
                    console.error(`Why no user ${token}`);
                    return fn(null, false);
                }
                return fn(null, user);
            }, err => fn(err));
    }

    // Passport session setup.
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        database.user.findById(id).then(user => {
            subscriptions.checkSubscription(user).then(subscription => {
                user.subscription_expires = subscription ? subscription.expires_at : false;
                user.subscription_name = subscription ? subscription.name : '';
                user.isAdmin = user.user_group === 'admin';
                done(null, user);
            });
        }, err => done(err));
    });

    // Use the GoogleStrategy within Passport.
    passport.use(new GoogleStrategy({
            clientID: config.googleOAuthClientId,
            clientSecret: config.googleOAuthlientSecret,
            callbackURL: `${(config.baseUrl('member'))}/auth/google/callback`,
            passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, done) {
            console.log('passport.verify', profile.displayName);
            //find site user with account, or create if not exists
            refreshToken = refreshToken || '';
            var user = _.assign({}, defaults.user, {
                oauth_provider: profile.provider, oauth_id: profile.id
            });
            var is_new = false;
            database.user.findByAuth(user)
                .then(user => {
                    if (user.id === 0) {
                        is_new =  true;
                    }
                    user.name = user.name || profile.displayName;
                    user.email = profile.emails[0].value;
                    user.image_url = profile._json.image.url;
                    user.tokens = {accessToken, refreshToken};
                    if (config.root_admin > 0 && user.oauth_id === config.root_admin) {
                        user.user_group = 'admin';
                    }
                    return database.user.save(user);

                })
                .then(user => {

                    if (is_new) {
                        lib.events.trigger('user.registered', user);
                    }
                    lib.events.trigger('user.login', user);
                    console.log(`user ${user.name} logged in, id ${user.id}`);
                    return done(null, user);

                })
                .catch(err => done(err));
        }
    ));

    //https://www.youtube.com/watch?v=fKKNPLowteY
    // Remember Me cookie strategy
    //   This strategy consumes a remember me token, supplying the user the
    //   token was originally issued to.  The token is single-use, so a new
    //   token is then issued to replace it.
    passport.use(new RememberMeStrategy(
        (token, done) => {
            console.log('RememberMeStrategy.consumeRememberMeToken', token);
            consumeRememberMeToken(token, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            });
        },
        (user, done) => {
            console.log('RememberMeStrategy.generateToken', user.name);
            var token = utils.randomString(64);
            database.user.save({id: user.id, remember: token}).then(user => {
                console.log('RememberMeStrategy.generatedToken', user.remember);
                return done(null, token);
            }, err => done(err));
        }
    ));

    return passport;

};
