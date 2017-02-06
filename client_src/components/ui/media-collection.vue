<template>

    <div>
        <ul class="uk-subnav uk-subnav-pill">
            <li class="uk-active" :class="{'uk-active': !filter.tags.length}"><a @click="toggleTag('')">{{ 'Toon alles' | trans }}</a></li>
            <li v-for="tag in tags" track-by="$index" :class="{'uk-active': filter.tags.indexOf(tag) > -1}">
                <a @click="toggleTag(tag)">{{ tag }}</a>
            </li>
        </ul>

        <v-pagination :page.sync="page" :pages="pages" v-show="pages > 1"></v-pagination>

        <div v-el:grid class="uk-grid uk-grid-width-medium-1-2 uk-grid-width-large-1-4">
            <div v-for="media in medias">
                <div @click="pick(media)" class="uk-panel uk-panel-hover uk-text-center" :class="{'uk-panel-box': selectedPath == media.path}">
                    <div v-if="media.image_url" class="uk-panel-teaser">
                        <img class="uk-overlay-scale" :src="media.image_url" :alt="media.name"
                             :width="media.data.width || 270" :height="media.data.height || 150">
                    </div>
                    <h3 class="uk-panel-title uk-margin-remove">{{ media.name }}</h3>
                    <div class="uk-text-right uk-text-small">
                         {{media.tags.join(', ')}}
                    </div>
                    <div v-if="allowEdit" class="sj-collection-buttons uk-flex uk-flex-center">
                        <a @click.stop="edit(media)"><i class="uk-icon-edit uk-icon-justify"></i></a>
                        <a @click.stop="remove(media)"><i class="uk-icon-trash-o uk-icon-justify"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script>


    module.exports = {

        props: {
            'current_collection': {type: String, default: 'algemeen'},
            'collections': Array,
            'selectedPath': String,
            'allowEdit': {type: Boolean, default: false},
            'onPick': {type: Function, default: (a) => a},
            'onEdit': {type: Function, default: (a) => a},
            'onRemove': {type: Function, default: (a) => a}
        },

        data() {
            return {
                grid: {},
                filter: {tags: [], limit: 8, collection: this.current_collection},
                medias: {},
                tags: [],
                count: 0,
                pages: 0,
                page: 0
            };
        },

        created() {
            this.loadCollection()
        },

        ready() {
            this.grid = UIkit.grid(this.$els.grid, {});
            UIkit.$('[data-uk-tab]').on('show.uk.switcher', (e, active) => {
                if (this.grid && active.data('sjCollection') !== undefined) {
                    this.loadGrid();
                }
            });
            this.grid.on('beforeupdate.uk.grid', (e) => {
            });
        },

        watch: {
            'current_collection + filter.tags + page': function () {
                this.loadCollection();
            }
        },

        events: {
            'media.collection.refesh': function () {
                this.loadCollection();
            },
            'socket.data': function (command, component, data) {
                if (component === 'media-collection' && data.medias) {
                    this.medias = data.medias;
                    this.tags = data.tags.map(tag => tag.name);
                    this.count = data.count;
                    this.pages = data.pages;
                    this.filter.tags = _.intersection(this.filter.tags, this.tags);
                    this.$nextTick(() => this.loadGrid());
                }
                return true;
            }
        },

        methods: {
            loadCollection() {
                this.filter.collection = this.current_collection;
                this.$root.command('media-collection', 'media.list', {page: this.page, filter: this.filter});
            },
            toggleTag(tag) {
                if (tag === '') {
                    return this.filter.tags = [];
                }
                if (this.filter.tags.indexOf(tag) > -1) {
                    return this.filter.tags.$remove(tag);
                }
                this.filter.tags.push(tag);
            },
            pick(media) {
                this.onPick(media)
            },
            edit(media) {
                this.onEdit(media);
            },
            remove(media) {
                this.onRemove(media);
            },
            loadGrid() {
                if (!this.grid) {
                    return;
                }
                this.grid.update();
                // get the images of the gallery and replace it by a canvas of the same size to fix the problem with overlapping images on load.
                UIkit.$('img[width][height]:not(.uk-overlay-panel)', UIkit.$(this.$els.grid)).each(function() {

                    var $img = UIkit.$(this);

                    if (this.width == 'auto' || this.height == 'auto' || !$img.is(':visible')) {
                        return;
                    }

                    var $canvas = UIkit.$('<canvas class="uk-responsive-width"></canvas>').attr({width:$img.attr('width'), height:$img.attr('height')}),
                        img = new Image,
                        release = function() {
                            $canvas.remove();
                            $img.css('display', '');
                            release = function(){};
                        };

                    $img.css('display', 'none').after($canvas);

                    UIkit.$(img).on('load', function(){ release(); });
                    setTimeout(function(){ release(); }, 1000);

                    img.src = this.src;

                });

            }
        }

    };

</script>