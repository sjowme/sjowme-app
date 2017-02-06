const _ = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = (config, locator) => {

    const auth = {
         "type": "service_account",
         "project_id": config.project,
         "private_key_id": config.private_key_id,
         "private_key": `${config.private_key}`.replace(/\\n/g, "\n"),
         "client_email": `${config.project}@appspot.gserviceaccount.com`,
         "client_id": "${config.client_id}",
         "auth_uri": "https://accounts.google.com/o/oauth2/auth",
         "token_uri": "https://accounts.google.com/o/oauth2/token",
         "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
         "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${config.project}%40appspot.gserviceaccount.com`
     };

    const storage = require('google-cloud').storage;
    const gcs = storage({
        projectId: config.project,
        credentials: auth
    });

    // Reference an existing bucket.
    const bucket = gcs.bucket(config.bucket);

    // Upload a local file to a new file to be created in your bucket.
    // bucket.upload('/photos/zoo/zebra.jpg', function(err, file) {
    //     if (!err) {
    //         // "zebra.jpg" is now in your bucket.
    //     }
    // });

    // Download a file from your bucket.
    // bucket.file('giraffe.jpg').download({
    //     destination: '/photos/zoo/giraffe.jpg'
    // }, function(err) {});
    //
    // Streams are also supported for reading and writing files.
    // var remoteReadStream = bucket.file('giraffe.jpg').createReadStream();
    // var localWriteStream = fs.createWriteStream('/photos/zoo/giraffe.jpg');
    // remoteReadStream.pipe(localWriteStream);
    //
    // var localReadStream = fs.createReadStream('/photos/zoo/zebra.jpg');
    // var remoteWriteStream = bucket.file('zebra.jpg').createWriteStream();
    // localReadStream.pipe(remoteWriteStream);

    function removeFile(remote_path, cb) {
        bucket.file(remote_path).delete(cb);
    }

    function moveFile(old_remote_path, new_remote_path, cb) {
        bucket.file(old_remote_path).move(new_remote_path, cb);
    }

    function uploadToRemote(file_path, remote_path, cb) {
        const options = {
            destination: remote_path,
            gzip:true
        };
        bucket.upload(file_path, options, (err, file) => {
            if (err) {
                return cb(err);
            }
            file.ETag = file.metadata.etag;
            file.url = `https://storage.googleapis.com/${config.bucket}/${remote_path}`;
            cb(null, _.pick(file, ['id', 'name', 'url', 'ETag']));
        });
    }

    function remotePath(media_path) {
        return media_path.replace(/\\/g, '/').replace(':', '/');
    }

    return {
        storeFile: function (media_path, destination, cb) {
            var full_path = locator.get(media_path);
            if (full_path) {
                uploadToRemote(full_path, destination, cb);
            } else {
                throw Error(`Bestand ${media_path} niet gevonden`);
            }
        },
        getUrl: function (media_path, media) {
            if (media.data.google && media.data.google.url) {
                return media.data.google.url;
            }
            //fallback
            return `https://storage.googleapis.com/${config.bucket}/${remotePath(media_path)}`;
        },
        removeFile: function (media_path) {
            return new Promise((resolve, reject) => {
                removeFile(remotePath(media_path), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        },
        moveFile: function (old_media_path, new_media_path, cb) {
            moveFile(remotePath(old_media_path), remotePath(new_media_path), cb);
        }
    };
};