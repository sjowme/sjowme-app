<template>

    <div class="">
        <template v-if="editMode">
            <div class="uk-form uk-form-password uk-width-1-1">
                <input v-el:inputbox type="text" v-model="model" class="uk-width-1-1" @keyup.enter="save" :placeholder="placeholder">
                <a class="uk-form-password-toggle" @click="save" :title="$trans('Opslaan')" data-uk-tooltip="delay:200"><i
                        class="uk-icon-check uk-text-success"></i></a>
            </div>
        </template>
        <template v-else>
            <div class="uk-flex uk-flex-middle uk-form-controls-condensed">
                <span class="uk-flex-item-1 uk-text-nowrap">{{ model || placeholder }}</span>
                <i class="uk-icon-edit uk-icon-hover" @click="edit"
                   :title="$trans('Bewerken')" data-uk-tooltip="delay:200"></i>
            </div>
        </template>
    </div>

</template>

<script>

    module.exports = {

        props: {
            'model': String,
            'onSave': Function,
            'id': {type: Number, default: 0},
            'placeholder': {type: String, default: ''}
        },

        data() {
            return {
                editMode: false
            }
        },

        methods: {
            edit() {
                this.editMode = true;
                this.$nextTick(() => this.$els.inputbox.select());
            },
            save() {
                this.editMode = false;
                this.onSave(this.id);
            }

        }

    };

</script>
