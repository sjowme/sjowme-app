module.exports = {

    data() {
        return {
            player_id: _.uniqueId('player_'),
            player: false
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

    watch: {
        'slide.background.path': function (new_path, old_path) {
            console.log(new_path, old_path);
            var new_type = /(youtube|vimeo)/.exec(new_path) ? 'video' : 'image';
            var old_type = /(youtube|vimeo)/.exec(old_path) ? 'video' : 'image';
            if (old_type === 'image' && new_type === 'image') {
                return;
            }
            var $slide = UIkit.$(this.$el);
            if (old_type === 'video' && $slide.data('sizer')) {
                $slide.data('sizer').remove();
            }
            if ($slide.data('processed')) {
                $slide.data('processed', false);
            }
            this.$nextTick(() => {
                this.$parent.slideshow.update();
                if (new_type === 'video') {
                    this.loadVideo(player => this.onShow());
                }
            });
        }
    },

    methods: {
        loadVideo(cb) {
            if (!cb) {
                cb = () => {};
            }
            if (this.video_info.type === 'youtube') {
                this.loadYoutubeVideo(this.video_info.videoId, cb);
            }
            if (this.video_info.type === 'vimeo') {
                this.loadVimeoVideo(cb);
            }
        },
        playVideo() {
            if (this.player) {
                this.player.playVideo();
            }
        },
        pauseVideo() {
            if (this.player) {
                this.player.pauseVideo();
            }
        },
        stopVideo() {
            if (this.player) {
                this.player.stopVideo();
            }
        },
        loadVimeoVideo(cb) {
            var iframe = UIkit.$(`#vimeo-${this.player_id}`),
                player = new Vimeo.Player(iframe);
            player.setVolume(0);
            player.setLoop(true);
            player.playVideo = () => player.play();
            player.pauseVideo = () => player.pause();
            player.stopVideo = () => player.stop();
            this.player = player;
            this.player.ready().then(cb(this.player));
        },
        loadYoutubeVideo(videoId, cb) {

            var onPlayerReady = event => {
                    event.target.mute();
                    var $iframe = UIkit.$(`#youtube-${this.player_id}`).addClass('uk-position-absolute').attr('data-uk-cover', 'automute:false');
                    var $canvas  = UIkit.$('<canvas></canvas>').attr({'width': $iframe[0].width, 'height': $iframe[0].height});
                    var $img = UIkit.$('<img style="width:100%;height:auto;">').attr('src', $canvas[0].toDataURL());
                    var $slide = UIkit.$(this.$el);
                    $iframe.parent().prepend($img);
                    $slide.data('sizer', $img);

                    UIkit.cover($iframe, {automute: false});
                    cb(this.player);
                },
                onPlayerStateChange = event => {
                    if (event.data === YT.PlayerState.ENDED && this.visible) {
                        this.playVideo();
                    }
                },
                getPlayer = () => {
                    this.player = new YT.Player(`youtube-${this.player_id}`, {
                        height: '390',
                        width: '640',
                        videoId: videoId,
                        playerVars: {
                            autoplay: 1
                        },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange
                        }
                    });
                };

            if (!window.YT || !window.YT.loaded) {
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
