<template>

    <div>
        <div v-if="defaultValue">
            <div class="uk-form-controls-condensed">
                <label><input type="checkbox" v-model="useDefault"/>
                    {{ 'Standaard' | trans }} <small>({{ readable(defaultValue) }})</small>
                </label>
            </div>
        </div>
        <div v-if="!defaultValue || !useDefault">
            <select v-model="model" class="uk-form-width-medium">
                <option v-for="value in options" :value="$key">{{ value | trans }}</option>
            </select>
        </div>

    </div>

</template>
<script>

    var optionSets = {
        animations: {
            'fade': 'Vervaag',
            'scroll': 'Rol',
            'swipe': 'Sleep',
            'scale': 'Schaal',
            'none': 'Geen'
        }
    };


    module.exports = {

        props: {
            model: String,
            optionType: String,
            defaultValue: {type: String, default: ''}
        },

        data() {
            return {
                useDefault: false,
                options: optionSets[this.optionType]
            }
        },

        created() {
            this.useDefault = this.model === '' && this.defaultValue !== '';
        },

        methods: {
            readable(value) {
                return this.options[value] || value;
            }
        },

        watch: {
            'useDefault': function (new_value) {
                if (new_value === true && this.defaultValue) {
                    this.model = '';
                }
                if (new_value === false && this.defaultValue) {
                    this.model = this.defaultValue;
                }
            }
        }

    };
</script>