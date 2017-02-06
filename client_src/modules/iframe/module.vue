<template>
    <div :class="panelClasses(config)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <iframe :src="config.src" frameborder="0" :class="config.iframe_width" class="uk-responsive-width" width="640" height="480" :class="config.image_size"></iframe>
    </div>
</template>
<script>

    var moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin]

    }

</script>