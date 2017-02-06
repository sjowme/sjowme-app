
module.exports = (config, locator) => {


    return {
        storeFile: function (media_path, destination, cb) {
            cb(null, true);
        },
        getUrl: function (media_path, media) {
            if (media.data.poster) {
                return media.data.poster;
            }
            //fallback
            return `//i.ytimg.com/vi/${media.data.id}/hqdefault.jpg`;
        },
        removeFile: function (media_path, cb) {
            cb(null, true);
        },
        moveFile: function (old_media_path, new_media_path, cb) {
            cb(null, true);
        }
    };
};