<template>

    <div>

        <div v-el:progressbar class="uk-progress uk-hidden">
            <div class="uk-progress-bar" style="width: 0;"></div>
        </div>

        <div class="uk-grid" data-uk-grid-margin="">
            <div :class="grid_classes.one">

                <div class="uk-margin uk-flex uk-flex-space-around">
                    <button type="button" @click="media.type = 'image'" class="uk-button"
                            :class="{'uk-button-primary': media.type == 'image'}">{{ 'Afbeelding' | trans }}</button>
                    <button type="button" @click="media.type = 'video'" class="uk-button"
                            :class="{'uk-button-primary': media.type == 'video'}">{{ 'Video' | trans }}</button>
                </div>

                <media-video-edit v-if="media.type == 'video'" class="uk-margin" :media.sync="media"></media-video-edit>

                <div v-if="media.type == 'image'" class="uk-margin">

                    <div v-if="message" class="uk-alert uk-alert-warning">{{ message }}</div>

					<div class="sj-media-info-box">Maximaal 2 mb.</div>
					
                    <div v-el:drop class="uk-overlay sj-media-drop sj-media-drop-empty">
                        <canvas v-el:canvas height="0" width="0"></canvas>
                        <div class="sj-media-drop-overlay-empty uk-overlay-panel uk-flex uk-flex-middle uk-flex-center">
                            <div class="uk-panel uk-text-center">
                                {{ 'Drop afbeelding, of ' | trans }}
                                <div class="uk-form-file">
                                    {{ 'selecteer bestand' | trans }}
                                    <input v-el:file_upload type="file" name="file">
                                </div>
                            </div>
                        </div>

                        <div class="sj-media-drop-overlay-progress uk-overlay-panel uk-flex uk-flex-middle uk-flex-center">
                            <i class="uk-icon-circle-o-notch uk-icon-spin uk-icon-large"></i>
                        </div>

                        <div class="sj-media-drop-overlay-filled uk-overlay-panel uk-overlay-background uk-overlay-top">
                            <a @click="emptyCanvas" class="uk-icon-trash-o"
                               title="Verwijderen" data-uk-tooltip="delay:200"></a>
                        </div>

                    </div>
                    <div v-el:current v-if="media.image_url" class="uk-panel uk-margin-small-top">
                        <div class="uk-cover-background uk-position-cover" :style="'background-image: url(\'' + media.image_url + '\')'"></div>
                        <img :src="media.image_url" :alt="media.name"/>
                    </div>
                </div>


            </div>
            <div :class="grid_classes.two">
                <form>
                    <div class="uk-form-row">
                        <label class="uk-form-label">{{ 'Naam' | trans }}</label>
                        <div class="uk-form-controls">
                            <input type="text" class="uk-form-width-large"
                                   v-model="media.name"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <span class="uk-form-label">{{ 'Tags' | trans }}</span>
                        <div class="uk-form-controls">
                            <input-tags :tags.sync="media.tags" :existing="tags"></input-tags>
                        </div>
                    </div>

                    <div v-if="media.collection" class="uk-form-row">
                        <label class="uk-form-label">{{ 'Collectie' | trans }}</label>
                        <div class="uk-form-controls">
                            <select v-model="media.collection" class="uk-form-width-medium">
                                <option v-for="collection in collections" :value="collection.name">
                                    {{ collection.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div v-if="!media.collection && media.user_name">
                        {{ $trans('Media van gebruiker %user_name%.', {user_name: media.user_name}) }}
                    </div>
                </form>


            </div>

        </div>
    </div>

</template>
<script>

    var emptyClass ='sj-media-drop-empty',
            progressClass = 'sj-media-drop-progress',
            filledClass = 'sj-media-drop-filled uk-overlay-hover',
            dragoverClass = 'sj-media-drop-dragover';

    var CanvasImageUploaderPlus = require('canvas-image-uploader-plus');

    var uploader = new CanvasImageUploaderPlus({
        maxSize: 1500,
        jpegQuality: 0.7
    });

    function makeDroppable($el, cb) {
        var hasdragCls = false;
        $el.on('drop', e => {
            if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files) {
                e.stopPropagation();
                e.preventDefault();
                $el.removeClass(dragoverClass);
                cb(e.originalEvent.dataTransfer.files);
            }
        }).on('dragenter', e => {
            e.stopPropagation();
            e.preventDefault();
        }).on('dragover', e => {
            e.stopPropagation();
            e.preventDefault();
            if (!hasdragCls) {
                $el.addClass(dragoverClass);
                hasdragCls = true;
            }
        }).on('dragleave', e => {
            e.stopPropagation();
            e.preventDefault();
            $el.removeClass(dragoverClass);
            hasdragCls = false;
        });
    }
    
    function addFileToCanvas($canvas, file, width, cb) {
        var $cnvs = jQuery('<canvas>');
        uploader.readImageToCanvas(file, $cnvs, () => {
            var canvas = $cnvs[0];
            // Render the preview from your original canvas...
            uploader.copyToCanvas(canvas, $canvas, width || 300);
            uploader.saveCanvasToImageData(canvas);
            cb(file);
        });

    }
    
    function addImageToCanvas($canvas, image_url, width, cb) {
        var image = new Image();
        var $cnvs = jQuery('<canvas>');
        //http://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = () => {
            console.log('image ready!');
            uploader.setImageToCanvas(image, $cnvs, () => {
                var canvas = $cnvs[0];
                // Render the preview from your original canvas...
                uploader.copyToCanvas(canvas, $canvas, width || 300);
                uploader.saveCanvasToImageData(canvas);
                cb();
            });
        };
        image.onerror = () => UIkit.notify('Fout bij laden afbeelding', 'danger');
        image.src = image_url;

    }

    module.exports = {

        props: {
            'media': Object,
            'tags': Array,
            'collections': {type: Array, default: () => []},
            'target': {type: String, default: 'user'},
            'parentComponent': String,
            'afterUpload': {type: Function, default: (a) => a},
            'maxFileSize': {type: Number, default: (4 * 1048576)},
            'width': {type: Number, default: 500},
            'compact': {type: Boolean, default: false}
        },

        data() {
            return {
                pending: false,
                message: '',
                file: {name: ''},
                socketIOFile: null
            };
        },

        ready() {
            var $select = jQuery(this.$els.file_upload),
                $drop   = jQuery(this.$els.drop),
                $canvas = jQuery(this.$els.canvas),
                $current = jQuery(this.$els.current),
                $progressbar = jQuery(this.$els.progressbar),
                $bar         = $progressbar.find('.uk-progress-bar');

            //bind drop and file-select
            makeDroppable($drop, files => {
                $current.addClass('uk-hidden');
                $drop.addClass(progressClass);
                addFileToCanvas($canvas, files[0], this.width, (file) => this.setFile($drop, file));
            });
            $select.change(e => {
                var files = e.target.files || e.dataTransfer.files;
                if (files) {
                    $drop.addClass(progressClass);
                    addFileToCanvas($canvas, files[0], this.width, (file) => this.setFile($drop, file));
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
                this.file = {name: this.file.name};
                this.pending = false;
                console.log('File Uploaded Successfully!');
            });
            //load current media image
            if (this.media.file && this.media.file.name) {
                this.file = this.media.file;
//                $drop.addClass(progressClass);
//                addImageToCanvas($canvas, this.media.image_url, this.width, () => {
//                    this.file = this.media.file;
//                    $drop.removeClass(`${emptyClass} ${progressClass}`).addClass(filledClass);
//                });
            }

        },

        events: {
            'socket.data': function (command, component, data) {
                if (command === 'media.file.upload') {
                    this.afterUpload(true);
                }
                if (data.media) {
                    this.media = data.media;
                }
                return true;
            }
        },

        watch: {
            'media.collection + file.name': function () {
                if (!this.file.name) {
                    return '';
                }
                if (this.media.type === 'image') {
                    this.media.path = `${this.target === 'collection' ? this.media.collection : this.target}:${this.file.name || ''}`;
                }
            }
        },

        computed: {
            grid_classes() {
                return {
                    one: this.compact ?
                            'uk-width-medium-1-2':
                            'uk-width-medium-1-2 uk-width-xlarge-1-3',
                    two: this.compact ?
                            'uk-width-medium-1-2 uk-form uk-form-stacked':
                            'uk-width-medium-1-2 uk-width-xlarge-2-3 uk-form uk-form-horizontal'
                };
            }
        },

        methods: {
            emptyCanvas() {
                var ctx = this.$els.canvas.getContext('2d');
                ctx.clearRect(0, 0, Number(this.$els.canvas.getAttribute('width')), Number(this.$els.canvas.getAttribute('height')));
                jQuery(this.$els.drop).removeClass(filledClass).addClass(emptyClass);
                this.file = {name: ''};
                this.media.image_url = '';
                this.message = '';
            },
            setFile($drop, file) {
                this.message = '';
                this.media.name = file.name.replace(/\.(png|jpg|gif|jpeg)$/i, '');
                if (file.size > this.maxFileSize * 1048576) {
                    this.message = this.$trans('Bestand te groot. Maximaal toegestane grootte is %size%Mb', {'size': this.maxFileSize});
                }
                this.file = file;
                $drop.removeClass(`${emptyClass} ${progressClass}`).addClass(filledClass);
            },
            upload() {
                if (this.pending) return;
                if (this.file.size > this.maxFileSize * 1048576) {
                    return;
                }
                if (!this.file.type) {
                    this.afterUpload(false);
                    return;
                }
                this.pending = true;
                //var image_data = uploader.getImageData();//todo get image from canvas
                this.socketIOFile.upload(this.file, {
                    to: this.target,
                    data: {
                        component: this.parentComponent,
                        media: this.media,
                        saveMedia: true
                    }
                });
            }
        },

        components: {
            'media-video-edit': require('./media-video-edit.vue')
        }
    };

</script>