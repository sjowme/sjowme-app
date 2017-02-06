
module.exports = (config, locator) => {


    return {
        storeFile: function (media_path, destination, cb) {
            cb(null, true);
        },
        getUrl: function (media_path, media) {
            if (media.data.poster) {
                return media.data.poster;
            }
            //fallback seems to collect random image?
            return `https://i.vimeocdn.com/video/${media.data.id}_640.jpg`;
        },
        removeFile: function (media_path, cb) {
            cb(null, true);
        },
        moveFile: function (old_media_path, new_media_path, cb) {
            cb(null, true);
        }
    };
};