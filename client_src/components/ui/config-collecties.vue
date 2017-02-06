<template>

    <div>
        <ul class="uk-list uk-list-line">
            <li v-for="item in items">
                <div class="uk-grid" data-uk-grid-margin>
                    <div class="uk-width-medium-1-3">
                        <div class="uk-text-truncate"><em class="uk-margin-small-right">{{ item.name }}</em></div>
                    </div>
                    <div class="uk-width-medium-2-3">
                        <div class="uk-flex uk-flex-space-between uk-flex-middle">
                            <div class="uk-flex-item-1 uk-text-truncate">
                                <a @click="edit(item)">{{ item.label }}</a>
                            </div>
                            <a v-if="item.name !== 'algemeen'" @click="remove(item)"
                               class="uk-icon-trash-o uk-icon-hover"></a>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <button type="button" class="uk-button uk-button-small" @click="edit()"><i
                class="uk-icon-plus uk-margin-small-right"></i>{{ 'Toevoegen' | trans }}</button>


        <div v-el:modal class="uk-modal">
            <div class="uk-modal-dialog uk-form uk-form-horizontal">
                <div class="uk-modal-header">
                    <h3>{{ label }}</h3>
                </div>
                <div v-if="edit_data">

                    <div class="uk-form-row">
                        <label class="uk-form-label" for="collection_name">{{ 'Naam' | trans }}</label>
                        <div class="uk-form-controls">
                            <input v-model="edit_data.name" id="collection_name" type="text" class="uk-form-width-large"
                                   @keyup.enter="save"/>
                        </div>
                    </div>

                    <div class="uk-form-row">
                        <label class="uk-form-label" for="collection_label">{{ 'Titel' | trans }}</label>
                        <div class="uk-form-controls">
                            <input v-model="edit_data.label" id="collection_label" type="text" class="uk-form-width-large"
                                   @keyup.enter="save"/>
                        </div>
                    </div>

                </div>
                <div class="uk-modal-footer uk-text-right">
                    <button type="button" class="uk-button uk-margin-right" @click="closeModal">{{ 'Annuleren' | trans }}</button>
                    <button type="button" class="uk-button uk-button-primary" @click="save">{{ 'Opslaan' | trans }}</button>
                </div>
            </div>
        </div>

    </div>


</template>

<script>
    var default_item = {
        name: '',
        label: ''
    };

    module.exports = {

        props: {
            'items': Array,
            'key': String,
            'label': String,
        },

        data() {
            return {
                edit_data: false,
                modal: null
            };
        },

        methods: {

            save() {
                this.edit_data.name = _.kebabCase(this.edit_data.name || this.edit_data.label);
                this.$parent.save(this.key);
                setTimeout(() => this.getModal().hide(), 300);
            },
            edit(item) {
                if (!item) {
                    item = _.assign({}, default_item);
                    this.items.push(item)
                }
                this.edit_data = item;
                this.getModal().show();
            },
            getModal() {
                if (!this.modal) {
                    this.modal = UIkit.modal(this.$els.modal, {modal: false});
                    this.modal.on('hide.uk.modal', () => this.edit_data = false);
                }
                return this.modal;
            },
            closeModal() {
                this.getModal().hide();
            },
            remove(item) {
                if (item.name === 'algemeen') {
                    return;
                }
                UIkit.modal.confirm(this.$trans('Wilt u dit item verwijderen?'), () => {
                    this.items.$remove(item);
                    this.$parent.save(this.key);
                });
            }
        }

    };

</script>
