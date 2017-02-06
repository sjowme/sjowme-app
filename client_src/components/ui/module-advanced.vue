<template>

    <div class="uk-button-dropdown" data-uk-dropdown="mode:'click', justify: '#{{settings_id}}'">

        <button type="button" class="uk-button uk-button-small"><i
                class="uk-icon-cogs uk-margin-small-right"></i>{{ 'Geavanceerd' | trans }}</button>

        <div class="uk-dropdown uk-padding-remove">
            <div class="uk-panel uk-panel-space">
                <a class="uk-close uk-dropdown-close uk-position-top-right"></a>
                <slot></slot>
            </div>
        </div>
    </div>

</template>
<script>

    module.exports = {

        props: ['settings_id'],

    };

</script>