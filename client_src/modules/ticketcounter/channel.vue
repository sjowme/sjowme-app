<template>
    <div>

        <div class="uk-form uk-flex uk-flex-middle uk-flex-space-between">
            <button type="button" class="uk-button uk-button-primary uk-button-large"
                    @click="count--"><i class="uk-icon-chevron-down"></i></button>
            <input class="uk-form-large uk-form-width-small uk-form-blank uk-text-center uk-flex-item-1"
                   type="text" v-model="count" number debounce="500"/>
            <button type="button" class="uk-button uk-button-primary uk-button-large"
                    @click="count++"><i class="uk-icon-chevron-up"></i></button>
        </div>
        <div class="uk-margin-small uk-flex uk-flex-middle uk-flex-space-between">
            <button type="button" class="uk-button" :title="$trans('Reset naar 1')" data-uk-tooltip="delay:300"
                    @click="count = 1"><i class="uk-icon-refresh"></i></button>
            <button type="button" class="uk-button" :title="$trans('Full screen')" data-uk-tooltip="delay:300"
                    @click="openModal"><i class="uk-icon-expand"></i></button>
        </div>

        <div v-el:fsmodal class="uk-modal">
            <div class="uk-modal-dialog uk-modal-dialog-blank uk-height-viewport">
                <a class="uk-modal-close uk-close"></a>
                <div v-if="full_screen" class="sj-ticketcounter-fullscreen">

                    <div class="uk-grid uk-grid-small" data-uk-grid-margin>
                        <div class="uk-width-1-4">
                            <div><img :src="module.image_url" :alt="module.name" style="max-height:100px"/></div>
                        </div>
                        <div class="uk-width-3-4 uk-flex uk-flex-middle">
                            <h3>{{ module.label }}</h3>
                        </div>
                    </div>


                    <div class="uk-margin uk-form uk-flex uk-flex-center uk-flex-wrap" style="min-height: 50vh;">
                        <div class="uk-width-1-1 uk-text-center">
                            <button type="button" class="uk-button uk-button-primary uk-button-large"
                                    @click="count++"><i class="uk-icon-chevron-up"></i></button>
                        </div>

                        <input class="uk-form-large uk-form-width-small uk-form-blank uk-text-center uk-flex-item-1"
                               type="number" v-model="count" number debounce="500"/>

                        <div class="uk-width-1-1 uk-text-center">
                            <button type="button" class="uk-button uk-button-primary uk-button-large"
                                    @click="count--"><i class="uk-icon-chevron-down"></i></button>
                        </div>
                    </div>
                    <div class="uk-panel uk-panel-space uk-flex uk-flex-middle uk-flex-space-between">
                        <button type="button" class="uk-button" :title="$trans('Reset naar 1')" data-uk-tooltip="delay:300"
                                @click="count = 1"><i class="uk-icon-refresh"></i></button>
                        <button type="button" class="uk-button" :title="$trans('Verlaat full screen')" data-uk-tooltip="delay:300"
                                @click="closeModal"><i class="uk-icon-compress"></i></button>
                    </div>


                </div>

            </div>
        </div>


    </div>
</template>
<script>

    module.exports = {

        props: ['module', 'channel'],

        data() {
            return {
                count: 0,
                full_screen: false,
                fsmodal: false
            };
        },

        ready() {
            this.getCounter();
            this.$watch('count', () => this.setCounter());
        },

        events: {
            'module.response.ticketcounter.getCounter': function (res) {
                this.count = res.count;
            },
            'module.response.ticketcounter.setCounter': function (res) {
                this.count = res.count;
            }
        },

        methods: {
            getCounter() {
                this.$parent.moduleCommand('ticketcounter', 'getCounter', {channel_id: this.channel.id});
            },
            setCounter() {
                if (!_.isNumber(this.count)) {
                    return;
                }
                this.$parent.moduleCommand('ticketcounter', 'setCounter', {channel_id: this.channel.id, count: this.count});
            },
            closeModal() {
                this.getModal().hide();
            },
            openModal() {
                this.full_screen = true;
                this.getModal().show();
            },
            getModal() {
                if (!this.fsmodal) {
                    this.fsmodal = UIkit.modal(this.$els.fsmodal);
                    this.fsmodal.on('hide.uk.modal', () => this.full_screen = false);
                }
                return this.fsmodal;
            }
        }

    };

</script>