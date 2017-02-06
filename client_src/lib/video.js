module.exports = (UIkit) => {

    function getInfo(media, url, cb) {
        return new Promise((resolve, reject) => {
            var m;
            if ((m = /(\/\/.*?)vimeo\.[a-z]+\/(?:\w*\/)*(\d+)/i.exec(url))) {
                media.provider = 'vimeo';
                media.data.id = m[2];
                media.path = '//player.vimeo.com/video/' + m[2];
            } else if ((m = /(\/\/.*?youtube\.[a-z]+)\/watch\?v=([^&]+)(.*)/i.exec(url)) || (m = /(\/\/.*?youtu\.be)\/([^\?]+)(.*)/i.exec(url))) {
                media.provider = 'youtube';
                media.path = '//www.youtube.com/embed/' + m[2] + m[3].replace(/^&/, '?') + (m[3] ? '&wmode=transparent' : '?wmode=transparent');
                media.data.id = m[2];
                media.data.poster = '//i.ytimg.com/vi/' + m[2] + '/hqdefault.jpg';
            }

            if (media.provider === 'vimeo') {

                UIkit.$.ajax({
                    type: 'GET',
                    url: '//vimeo.com/api/oembed.json?url=' + encodeURI(url),
                    jsonp: 'callback',
                    dataType: 'jsonp',
                    success: function (data) {

                        console.log(data);
                        media.name = data.title;
                        media.data.duration = data.duration;
                        media.data.width = data.width;
                        media.data.height = data.height;
                        media.data.poster = data.thumbnail_url;

                        resolve(media);
                    }
                }).fail(function () {
                    reject('Video is not public!');
                });

            }

            if (media.provider === 'youtube') {

                UIkit.$.ajax({
                    type: 'GET',
                    url: '//query.yahooapis.com/v1/public/yql',
                    data: {
                        q: "select * from json where url ='http://www.youtube.com/oembed?url=" + encodeURI(url) + "'",
                        format: "json"
                    },
                    dataType: "jsonp",
                    success: function (data) {

                        console.log(data);
                        if (data && data.query && data.query.results && data.query.results.json) {

                            media.name = data.query.results.json.title;

                            media.width = data.query.results.json.width;
                            media.height = data.query.results.json.height;
                        }

                        resolve(media);
                    }
                }).fail(function () {
                    resolve(media);
                });
            }

        });

    }

    var mixin = {

        data() {
            return {
                player_id: _.uniqueId('player_'),
                player: {}
            };
        },

        computed: {
            video_info() {
                var m = /(\/\/.*?youtube\.[a-z]+)\/embed\/([^&]+)/i.exec(this.slide.background.path);
                if (m) {
                    return {type: 'youtube', videoId: m[2]};
                }
                return {type: 'vimeo'};
            }
        },

        methods: {
            loadVideo() {
                if (this.video_info.type === 'youtube') {
                    this.player = this.loadYoutubeVideo(this.video_info.videoId);
                }
            },
            onPlayerReady(event) {
                console.log('read');
                console.log(event);
                event.target.playVideo();
            },
            onPlayerStateChange(event) {
                console.log('chang');
                console.log(event);
                if (event.data === YT.PlayerState.PLAYING) {

                }

            },
            stopVideo() {
                this.player.stopVideo();
            },
            loadYoutubeVideo(videoId) {

                var getPlayer = () => {
                    this.player = new YT.Player(this.player_id, {
                        height: '390',
                        width: '640',
                        videoId: videoId,
                        events: {
                            'onReady': this.onPlayerReady,
                            'onStateChange': this.onPlayerStateChange
                        }
                    });
                };

                if (!window.YT) {
                    loadYoutubeApi(getPlayer);
                } else {
                    getPlayer();
                }
            }
        }
    };
    function loadYoutubeApi(cb) {
        //youtube iframe_api
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // 3. This function creates an <iframe> (and YouTube player)
        //    after the API code downloads.
        window.onYouTubeIframeAPIReady = () => {
            cb();
        };
    }

    return {
        getInfo,
        mixin
    };

};