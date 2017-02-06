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
            <div class="uk-form-controls-condensed uk-text-right">
                <strong>{{ readable(model) }}</strong>
            </div>
            <div class="uk-form-controls-condensed uk-flex uk-flex-space-between">
                <label>{{ 'Seconden' | trans }}</label>
                <input type="range" v-model="seconds" class="uk-form-width-small" min="0" max="60" step="1"/>
            </div>
            <div class="uk-form-controls-condensed uk-flex uk-flex-space-between">
                <label>{{ 'Minuten' | trans }}</label>
                <input type="range" v-model="minutes" class="uk-form-width-small" min="0" max="15" step="1"/>
            </div>
        </div>

    </div>

</template>
<script>

    module.exports = {

        props: {
            model: Number,
            defaultValue: {type: Number, default: 0}
        },

        data() {
            return {
                useDefault: false,
                minutes: 0,
                seconds: 0
            }
        },

        created() {
            this.useDefault = this.model === 0 && this.defaultValue !== 0;
            if (this.model > 0) {
                this.minutes = Math.floor((this.model / 1000) / 60);
                this.seconds = (this.model / 1000) % 60;
            }
        },

        methods: {
            readable(milliseconds) {
                var minutes = Math.floor((milliseconds / 1000) / 60);
                var seconds = (milliseconds / 1000) % 60;
                if (minutes == 0) {
                    return this.$trans('%seconds% seconden', {seconds});
                }
                return this.$trans('%minutes% minuten, %seconds% seconden', {minutes, seconds});
            }
        },

        watch: {
            'useDefault': function (new_value) {
                if (new_value === true && this.defaultValue) {
                    this.model = 0;
                }
                if (new_value === false && this.defaultValue) {
                    this.minutes = Math.floor((this.defaultValue / 1000) / 60);
                    this.seconds = (this.defaultValue / 1000) % 60;
                }
            },
            'minutes + seconds': function () {
                this.model = (this.minutes * 60 + this.seconds) * 1000;
            }
        }

    };
</script>