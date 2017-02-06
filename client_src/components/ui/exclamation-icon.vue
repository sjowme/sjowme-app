<template>

    <span>
        <a class="uk-icon-exclamation-circle uk-text-muted" :class="size" v-bind="attrs"></a>
    </span>

</template>

<script>

    module.exports = {

        props: {
            'url': {type: String, default: ''},
            'text': {type: String, default: ''},
            'title': {type: String, default: ''},
            'size': {type: String, default: 'uk-icon-medium'}
        },

        computed: {
            attrs() {
                var attr = {
                    title: this.text || this.title
                };
                if (this.text || this.title) {
                    attr['data-uk-tooltip'] = 'delay:100';
                }
                if (this.url) {
                    attr['href'] = this.url;
                    attr['data-uk-lightbox'] = `width:800,height:600`;
                    attr['data-lightbox-type'] = 'iframe';
                }
                return attr;
            }
        }

    };

</script>
