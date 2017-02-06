<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <img v-if="config.image.path" :class="config.image_size" :src="config.image.image_url" alt="config.image.name"/>
    </div>
</template>
<script>

    var moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin]

    }

</script>