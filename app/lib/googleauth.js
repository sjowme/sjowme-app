var config = require('../config');
var _ = require('lodash');
var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var database;

var defaults = require('../database/defaults');

function initialize(db) {
    database = db;
}

function getOAuthClient() {
    return new OAuth2(config.googleOAuthClientId, config.googleOAuthlientSecret, config.googleOAuthRedirectionUrl);
}

function getAuthUrl() {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        approval_prompt: 'force',
        scope: [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/drive',
            'email'
        ]
    });
}

function setDataFromOauth2Client(user, oauth2Client) {
    return new Promise(function (resolve, reject) {
        plus.people.get({userId: 'me', auth: oauth2Client}, function (err, response) {
            if (err) {
                reject(err);
            }
            else {
                console.log(response.displayName);
                user.name = response.displayName;
                user.email = response.emails[0].value;
                user.oauth_provider = 'google';
                user.oauth_id = response.id;
                user.image_url = response.image.url;

                resolve(user);
            }
        });
    });
}

function googleCallback(req, res) {
    console.log("oauth-start " + (new Date()).toTimeString().split(' ')[0]);

    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;
    oauth2Client.getToken(code, (err, tokens) => {
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (!err) {
            oauth2Client.setCredentials(tokens);

            var user = _.assign({}, defaults.user);

            // console.log("fase 02");
            setDataFromOauth2Client(user, oauth2Client)
                .then(user => database.user.findByAuth(user), err => console.log(err))
                .then(user => {
                    console.log(tokens);
                        user.tokens = tokens;
                        return database.user.save(user);
                    }, err => console.log(err)
                )
                .then(user => {
                        console.log(`user ${user.name} logged in, id ${user.id}]`);
                        session.sjowme_user = user;
                        res.send(`<script type="text/javascript">window.location='http://member.${config.domain}/';</script>`);
                    },
                    err => console.log(err));


        } else {
            console.log(err);
            res.send(`<h3>Login failed!!</h3>`);
        }
    });
}


function details(req, res) {
    var oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(req.session["tokens"]);

    var p = new Promise(function (resolve, reject) {
        plus.people.get({userId: 'me', auth: oauth2Client}, function (err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        res.send(`
            <img src=${data.image.url} />
            <h3>Hello ${data.displayName}</h3>
            <a href="/">Go to start</a>
        `);
        // console.log(data);
        listFiles(oauth2Client);
        createFolder(oauth2Client);
    });
}

function logout(req, res) {

    console.log("logging out!");

    req.session.destroy();
    res.send('<script type="text/javascript"> window.location="http://member.sjow.me/"; </script>');

}

function createFolder(auth) {
    "use strict";

    var fileMetadata = {
        'name': 'Sjow.Me.System.Data',
        'mimeType': 'application/vnd.google-apps.folder'
    };
    var drive = google.drive('v3');
    drive.files.create({
        resource: fileMetadata,
        fields: 'id',
        auth: auth
    }, function (err, file) {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log('Folder Id: ', file.id);
            uploadFoto(file.id, auth);
        }
    });
}


function listFiles(auth) {
    var service = google.drive('v3');
    service.files.list({
        auth: auth,
        pageSize: 10,
        //q: "name = 'Sjow.Me.System.Data'",
        fields: "nextPageToken, files(id, name)"
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var files = response.files;
        if (files.length == 0) {
            console.log('No files found.');
        } else {
            console.log('Files:');
            console.log(files.length);
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log('%s - %s (%s)', i, file.name, file.id);
            }
        }
    });
}


module.exports = {
    initialize: initialize,
    callback: googleCallback,
    logout: logout,
    details: details,
    createFolder: createFolder,
    getAuthUrl: getAuthUrl
};