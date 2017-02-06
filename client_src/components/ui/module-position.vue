<template>

    <div class="sj-pick-position">
        <div class="uk-position-relative uk-flex uk-flex-center uk-flex-middle">
            <button class="uk-button uk-button-small uk-position-top-left"
                    :title="positionError('tl')" data-uk-tooltip="delay:400" :disabled="!active"
                    :class="{'uk-button-danger': positionError('tl'), 'uk-button-success': config.position == 'tl'}"
                    @click="pick('tl')"><i :class="[(config.position == 'tl' ? 'uk-icon-toggle-on': 'uk-icon-toggle-off')]"></i></button>

            <button class="uk-button uk-button-small uk-position-top-right"
                    :title="positionError('tr')" data-uk-tooltip="delay:400" :disabled="!active"
                    :class="{'uk-button-danger': positionError('tr'), 'uk-button-success': config.position == 'tr'}"
                    @click="pick('tr')"><i :class="[(config.position == 'tr' ? 'uk-icon-toggle-on': 'uk-icon-toggle-off')]"></i></button>

            <button class="uk-button uk-button-small"
                    :title="positionError('c')" data-uk-tooltip="delay:400" :disabled="!active"
                    :class="{'uk-button-danger': positionError('c'), 'uk-button-success': config.position == 'c'}"
                    @click="pick('c')"><i :class="[(config.position == 'c' ? 'uk-icon-toggle-on': 'uk-icon-toggle-off')]"></i></button>

            <button class="uk-button uk-button-small uk-position-bottom-left"
                    :title="positionError('bl')" data-uk-tooltip="delay:400" :disabled="!active"
                    :class="{'uk-button-danger': positionError('bl'), 'uk-button-success': config.position == 'bl'}"
                    @click="pick('bl')"><i :class="[(config.position == 'bl' ? 'uk-icon-toggle-on': 'uk-icon-toggle-off')]"></i>
            </button>

            <button class="uk-button uk-button-small uk-position-bottom-right"
                    :title="positionError('br')" data-uk-tooltip="delay:400" :disabled="!active"
                    :class="{'uk-button-danger': positionError('br'), 'uk-button-success': config.position == 'br'}"
                    @click="pick('br')"><i :class="[(config.position == 'br' ? 'uk-icon-toggle-on': 'uk-icon-toggle-off')]"></i>
            </button>

        </div>

    </div>

</template>

<script>

    module.exports = {

        props: {
            'slide': Object,
            'config': Object,
            'name': String,
            'active': Boolean
        },

        data() {
            return {
            };
        },

        methods: {
            pick(pos) {
                if (this.positionError(pos) !== '') {
                    return;
                }
                this.config.position = pos;
            },
            positionError(pos) {
                return this.$parent.$parent.$parent.positionError(pos, this.name);
            }
        }

    };

</script>
