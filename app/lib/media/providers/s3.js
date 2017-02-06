var _ = require('lodash');
var path = require('path');
var fs = require('fs');

module.exports = (config, locator) => {

    var s3 = require('s3');

    var client = s3.createClient({
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            region: config.region,
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
            // any other options are passed to new AWS.S3()
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        },
    });

    function removeS3File(remote_path, cb) {
        var remover = client.deleteObjects ({
            Bucket: config.Bucket,
            Delete: {
                Objects: [{Key: remote_path}],
                Quiet: true,
            }
        });
        remover.on('error', function (err) {
            cb(`Move at S3 failed: ${err}`);
        });
        remover.on('end', function () {
            console.log(`done removing ${remote_path}`);
            cb(null, true);
        });
    }

    function moveS3File(old_remote_path, new_remote_path, cb) {
        var mover = client.moveObject ({
            Bucket: config.Bucket,
            Key: new_remote_path,
            CopySource: `${config.Bucket}/${old_remote_path}`,
            ACL: 'public-read',
            Metadata: {collection: new_remote_path.split('/')[0]}
        });
        mover.on('error', function (err) {
            cb(`Move at S3 failed: ${err}`);
        });
        mover.on('end', function (data) {
            console.log("done moving");
            data.url = `https://s3-${config.region}.amazonaws.com/${config.Bucket}/${new_remote_path}`;
            cb(null, data);
        });
    }

    function uploadToS3(file_path, remote_path, cb) {
        var params = {
            localFile: file_path,
            s3Params: {
                Bucket: config.Bucket,
                Key: remote_path,
                ACL: 'public-read',
                Metadata: {collection: remote_path.split('/')[0]}
            },
        };
        var uploader = client.uploadFile(params);
        uploader.on('error', function (err) {
            cb(`Upload to S3 failed: ${err}`);
        });
        uploader.on('progress', function () {
            //todo
        });
        uploader.on('end', function (data) {
            //strip enclosing quotes...
            data.ETag = data.ETag.replace(/"/g, '');
            data.url = `https://s3-${config.region}.amazonaws.com/${config.Bucket}/${remote_path}`;
            cb(null, data);
        });
    }

    function remotePath(media_path) {
        return media_path.replace(/\\/g, '/').replace(':', '/');
    }

    return {
        storeFile: function (media_path, destination, cb) {
            var full_path = locator.get(media_path);
            if (full_path) {
                uploadToS3(full_path, destination, cb);
            } else {
                throw Error(`Bestand ${media_path} niet gevonden`);
            }
        },
        getUrl: function (media_path, media) {
            if (media.data.s3 && media.data.s3.url) {
                return media.data.s3.url;
            }
            //fallback
            return `https://s3-${config.region}.amazonaws.com/${config.Bucket}/${remotePath(media_path)}`;
        },
        removeFile: function (media_path) {
            return new Promise((resolve, reject) => {
                removeS3File(remotePath(media_path), (err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(res);
                });
            });
        },
        moveFile: function (old_media_path, new_media_path, cb) {
            moveS3File(remotePath(old_media_path), remotePath(new_media_path), cb);
        }
    };
};