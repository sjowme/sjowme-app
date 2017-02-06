const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const webshot = require('webshot');
const _ = require('lodash');

const options = {
    errorIfJSException: true,
    screenSize: {
        width: 1920,
        height: 1080
    },
    shotSize: {
        width: 'window',
        height: 'window'
    },
    cookies: []
};
module.exports = (config, database, lib) => {

    lib.locator.set('preview', config.preview());

    function createPreview(channel) {
        database.channel.savePreviews(channel.id, channel.previews)
            .then(res => {
                //all done, send to sockets
                // console.log(previews);
                lib.events.trigger('admin.broadcast', {channel, previews: channel.previews});
                lib.events.trigger('member.broadcast', {channel, previews: channel.previews});

            }).catch(err => console.error(err));

    }

    function renderPreviews(channel) {
        console.log(`createPreview`);
        options.cookies.push({'sjowme_token': 'asfasf'});
        const promises = [];
        _.forIn(channel.content.slides, slide => {
            const preview_path = 'c%cid%/slide%nr%.png'.replace('%cid%', `${channel.id}`).replace('%nr%', `${slide.number}`);
            const file_path = path.join(config.preview(), preview_path);
            promises.push(new Promise((resolve, reject) => {
                webshot(`${config.baseUrl('member')}/${preview_path}`, file_path, options, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        //resize todo stream this
                        // console.log(file_path);
                        gm(file_path)
                            .resize(240, 240)
                            .write(file_path, function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                const file = {
                                    name: `slide${slide.number}`,
                                    provider: config.remote_media,
                                    path: `preview:${preview_path}`,
                                    image_url: ''
                                };
                                // console.log(file.path);
                                //almost there... send to remote
                                lib.media.storeFile(file.provider, file, (err, data) => {
                                    if (err) {
                                        return reject(err);
                                    }
                                    file.ETag = data.ETag;
                                    file.image_url = data.url;
                                    resolve(file);
                                });

                            });

                    });
            }));
        });
        //do it!
        Promise.all(promises)
            .then(preview_files => {
                const previews = {};
                preview_files.forEach(file => previews[file.name] = file);
                database.channel.savePreviews(channel.id, previews)
                    .then(res => {
                        //all done, send to sockets
                        // console.log(previews);
                        lib.events.trigger('admin.broadcast', {channel, previews});
                        lib.events.trigger('member.broadcast', {channel, previews});

                    }).catch(err => console.error(err));
            })
            .catch(err => {
                console.error(err);
            });

    }

    return {createPreview};

};
