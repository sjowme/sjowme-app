var path = require('path');
var config = require('../../config');
var _ = require('lodash');

module.exports = (locator) => {

    var providers = {};

    _.forIn(config.mediaproviders, (config, provider) => {
        providers[provider] = require(`./providers/${provider}`)(config, locator);
    });

    function getUserMediaPath(media) {
        var media_path = media.path;
        if (_.startsWith(media_path, 'user:')) {
            media_path = path.join(`user:u${(media.owner || 0)}`, media_path.split(':')[1]);
        }
        if (_.startsWith(media_path, 'user_collection:')) {
            media_path = path.join(`user:u${(media.owner || 0)}`, 'collection', media_path.split(':')[1]);
        }
        return media_path;
    }

    function storeFile(provider, media, cb) {
        var media_path = getUserMediaPath(media);
        var destination = media_path.replace(/\\/g, '/').replace(':', '/');
        if (providers[provider] === undefined) {
            throw Error(`Provider ${provider} not found`);
        }
        providers[provider].storeFile(media_path, destination, (err, data) => {
            if (err) {
                return cb(err);
            }
            if (provider !== 'local') {
                providers.local.removeFile(media_path).then(res => {
                    if (err) {
                        return cb(err);
                    }
                    if (!res) {
                        return cb('Fout in verwijderen lokaal bestand');
                    }
                    cb(null, data);
                }).catch(err => cb(err));
            }
        });

    }

    function getUrl(media) {
        var media_path = getUserMediaPath(media);
        if (providers[media.provider] === undefined) {
            throw Error(`Provider ${media.provider} not found`);
        }
        return providers[media.provider].getUrl(media_path, media);
    }

    function moveFile(provider, old_media_path, new_media_path, cb) {
        if (providers[provider] === undefined) {
            throw Error(`Provider ${provider} not found`);
        }
        return providers[provider].moveFile(old_media_path, new_media_path, cb);
    }

    function removeFiles(medias) {
        var promises = medias.map(media => {
            return removeFile(media);
        });
        return Promise.all(promises);
    }

    function removeFile(media) {
        if (providers[media.provider] === undefined) {
            throw Error(`Provider ${media.provider} not found`);
        }
        return providers[media.provider].removeFile(getUserMediaPath(media));
    }

    return {
        storeFile: storeFile,
        getUrl: getUrl,
        moveFile: moveFile,
        removeFile: removeFile,
        removeFiles: removeFiles
    };

};