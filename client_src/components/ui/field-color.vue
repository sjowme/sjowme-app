<template>

    <div>

        <input v-el:color v-model="value"/>

    </div>

</template>

<script type="text/babel">

    module.exports = {

        props: ['allow-empty', 'value'],

        data() {
            return _.assign(this.config);
        },

        destroy() {
            this.input.spectrum('destroy');
        },

        ready() {

            this.input = $(this.$els.color);
            this.input.spectrum({
                allowEmpty: this.allowEmpty,
                color: this.value,
                flat: false,
                preferredFormat: 'hex',
                showAlpha: false,
                showInitial: true,
                showInput: true,
                show: () => {
//                    UIkit.$(document).unbind('click.spectrum');
//                    UIkit.$('.sp-container', this.$el).unbind('click');
//                    UIkit.$('.sp-choose', this.$el).unbind('click.spectrum').on('click', () => {
//                        var color = this.input.spectrum('get');
//                        this.value = color && color.toString();
//                        this.$emit('update');
//                        this.dropdown.hide(false);
//                    });
//                    UIkit.$('.sp-cancel', this.$el).unbind('click.spectrum').on('click', e => {
//                        e.preventDefault();
//                        this.dropdown.hide(false);
//                    });
                }
            });

        },

        methods: {


        }

    };

</script>
