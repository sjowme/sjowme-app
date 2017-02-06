
var path = require('path');
var fs = require('fs');

module.exports = (config, locator) => {

    var base_path = config.path || '../../../../_media';

    locator.set('user', path.join(base_path, 'user'));
    locator.set('collection', path.join(base_path, 'collection'));

    return {
        storeFile: function (media_path, destination, cb) {
            cb({media_path});
        },
        getUrl: function (media_path, media) {
            var full_path = locator.get(media_path);
            if (full_path) {
                return full_path.replace(base_path, 'media');
            }
            return false;
        },
        removeFile: function (media_path) {
            return new Promise((resolve, reject) => {
                var file_path = locator.get(media_path);
                if (!file_path) {
                    return reject(`Bestand ${media_path} niet gevonden voor verwijderen`);
                }
                fs.unlink(file_path, err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });

        },
        moveFile: function (old_media_path, new_media_path, cb) {
            var old_path = locator.get(old_media_path);
            var new_path = locator.get(new_media_path);
            fs.stat(new_path, (err, stats) => {
                //Check if error defined and the error code is "not exists"
                if (err && err.code === 'ENOENT') {
                    //try to move the old image
                    fs.stat(old_path, err => {
                        if (err) {
                            cb(`Image ${old_path} could not be found!`);
                        }
                        fs.rename(old_path, new_path, err => {
                            if (err) {
                                cb(`Image ${old_path} could not be moved!`);
                            }
                            cb(null, new_media_path);
                        });
                    });
                } else {
                    //all fine
                    cb(null, new_media_path);
                }
            });
        }
    };
};