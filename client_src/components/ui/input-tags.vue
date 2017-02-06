<template>

    <div>
        <ul v-if="style == 'list'" class="uk-list uk-list-line">
            <li v-for="tag in tags">
                <a class="uk-float-right uk-close" @click.prevent="removeTag(tag)"></a>
                {{ tag }}
            </li>
        </ul>
        <div v-else class="uk-flex uk-flex-wrap" data-uk-margin="">
            <div v-for="tag in tags" class="uk-badge uk-margin-small-right" track-by="$index">
                <a class="uk-float-right uk-close" @click.prevent="removeTag(tag)"></a>
                {{ tag }}
            </div>
        </div>

        <div class="uk-flex uk-flex-middle uk-margin">
            <div v-show="existing.length">
                <div class="uk-position-relative" data-uk-dropdown="">
                    <button type="button" class="uk-button uk-button-small">{{ 'Bestaande tags' | trans }}</button>

                    <div class="uk-dropdown uk-dropdown-small uk-dropdown-scrollable">
                        <ul class="uk-nav uk-nav-dropdown">
                            <li v-for="tag in existing"><a :class="{'uk-text-muted': selected(tag.name)}"
                                                           @click.prevent="addTag(tag.name)">{{ tag.name }} <small>({{tag.count}})</small></a></li>
                        </ul>
                    </div>
                </div>

            </div>
            <div class="uk-flex-item-1 uk-margin-small-left">
                <div class="uk-form-password">
                    <input type="text" class="uk-width-1-1" v-model="newtag" @keyup.enter="addTag()">
                    <a class="uk-form-password-toggle" @click="addTag()"><i
                            class="uk-icon-check uk-icon-hover"></i></a>
                </div>
            </div>

        </div>
    </div>


</template>

<script>

    module.exports = {

        props: {
            'tags': Array,
            'existing': Array,
            'style': {type: String, default: 'tags'}
        },

        data() {
            return {
                'newtag': ''
            };
        },

        methods: {

            addTag(tag) {
                tag = tag || this.newtag;
                if (!tag || this.selected(tag)) {
                    return;
                }
                this.tags.push(tag);
                if (this.style == 'tags') {
                    this.$nextTick(function () {
                        UIkit.$html.trigger('resize'); //todo why no check.display or changed.dom???
                    });
                }
                this.newtag = '';
            },

            removeTag(tag) {
                this.tags.$remove(tag)
            },

            selected(tag) {
                return this.tags.indexOf(tag) > -1;
            }

        }

    };

</script>
