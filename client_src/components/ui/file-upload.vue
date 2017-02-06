<template>

    <div class="uk-margin uk-form">

        <div v-if="file.name">
            <div class="uk-flex uk-flex-middle">
                <div>
                    <a v-if="isImage(file.image_url)" :href="file.image_url" data-uk-lightbox="">
                        <img :src="file.image_url" :alt="file.name" style="height: 50px"/>
                    </a>
                    <i v-else class="uk-icon-file-o uk-margin-small-right"></i>
                </div>
                <div class="uk-margin-left uk-flex-item-1">
                    <a :href="file.image_url" class="uk-h4" download>{{ file.name }}</a><br/>
                    <small>{{ file.size | filesize }} | {{ file.date | date }}</small>
                </div>
                <a @click="remove" class="uk-close"></a>
            </div>
        </div>

        <template v-if="enabled">
            <div v-el:drop class="uk-placeholder">
                <i class="uk-icon-cloud-upload uk-margin-small-right"></i>
                {{ 'Sleep bestand hier naar toe of ' | trans }}<a class="uk-form-file">{{ 'selecteer een bestand' | trans }}<input
                    v-el:file_upload type="file" name="files[]" multiple="multiple"></a>.
            </div>

            <div v-el:progressbar class="uk-progress uk-progress-mini uk-margin-remove uk-hidden">
                <div class="uk-progress-bar" :style="{width: upload.progress + '%'}"></div>
            </div>
        </template>


    </div>

</template>

<script>

    var makeDroppable = require('../../lib/utils').makeDroppable;
    var default_file = require('../../lib/utils').file;
    module.exports = {

        props: {
            file: {type: Object, default: function () {return default_file;}},
            target: {type: String, default: '/'},
            afterUpload: {type: Function, default: (a) => a},
            enabled: {type: Boolean, default: true}
        },

        data() {
            return {
                pending: false,
                socketIOFile: {},
            };
        },

        created() {
            //new file
            if (this.file.name == undefined) {
                this.file = default_file;
            }
        },

        ready() {
            if (!this.enabled) {
                return;
            }
            var $select = jQuery(this.$els.file_upload),
                $drop   = jQuery(this.$els.drop),
                $progressbar = jQuery(this.$els.progressbar),
                $bar         = $progressbar.find('.uk-progress-bar');

            makeDroppable($drop, files => {
                if (files) {
                    this.upload(files[0]);
                }
            });
            $select.change(e => {
                var files = e.target.files || e.dataTransfer.files;
                if (files) {
                    this.upload(files[0]);
                }
            });
            //upload socket init
            this.socketIOFile = new SocketIOFileClient(this.$root.socket);
            this.socketIOFile.on('start', () => {
                $bar.css('width', '0%').text('0%');
                $progressbar.removeClass('uk-hidden');
                console.log('File uploading starting...');
            });
            this.socketIOFile.on('stream', data => {
                var percent = (Math.round(data.percent * 100)/100);
                $bar.css('width', `${percent}%`).text(`${percent}%`);
            });
            this.socketIOFile.on('complete', () => {
                $bar.css('width', '100%').text('100%');
                setTimeout(() => $progressbar.addClass('uk-hidden'), 500);
                this.pending = false;
                console.log('File Uploaded Successfully!');
            });
        },

        events: {
            'socket.data': function (command, component, data) {
                if (command === 'media.file.upload' && component === 'file-upload') {
                    if (data.media) {
                        this.file = data.media;
                    }
                    this.afterUpload();
                }
                return true;
            }
        },

        methods: {
            isImage: function (url) {
                return url.match(/\.(?:gif|jpe?g|png|svg|ico)$/i);
            },

            upload(file) {
                this.file.name = file.name;
                this.file.size = file.size;
                this.file.date = new Date();
                this.file.path = `${this.target}:${file.name}`;
                this.pending = true;
                this.socketIOFile.upload(file, {
                    to: this.target,
                    data: {
                        component: 'file-upload',
                        media: this.file
                    }
                });

            },

            remove() {
                this.file = default_file;
                this.afterUpload();
            }

        }

    };

</script>
