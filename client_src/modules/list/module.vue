<template>
    <div :class="panelClasses(config) + ' ' + textClasses(config.text)">
        <h3 v-if="config.title" class="uk-panel-title">{{ config.title }}</h3>
        <ul class="uk-list uk-list-space">
            <li v-for="item in config.items">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p>{{ item.content }}</p>
            </li>
        </ul>
    </div>
</template>
<script>

    var moduleMixin = require('../mixin-site');

    module.exports = {

        mixins: [moduleMixin]

    }

</script>