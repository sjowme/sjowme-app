module.exports = {

    params: ['group'],

    update(subSelector) {

        var self = this, keypath = this.arg, group = this.params.group ? this.params.group + ' ' : '', selector = group + subSelector;

        this.selector = selector;
        this.$el = this.vm.$el;
        this.checked = false;
        this.number = this.el.getAttribute('number') !== null;

        jQuery(this.el).on('change.check-all', function () {
            jQuery(selector, self.$el).prop('checked', jQuery(this).prop('checked'));
            self.selected(true);
        });

        this.handler = [
            function () {
                self.selected(true);
                self.state();
            },
            function (e) {
                if (!jQuery(e.target).is(':input, a') && !window.getSelection().toString()) {
                    jQuery(this).find(subSelector).trigger('click');
                }
            }
        ];

        jQuery(this.$el).on('change.check-all', selector, this.handler[0]);
        jQuery(this.$el).on('click.check-all', group + '.check-item', this.handler[1]);

        this.unbindWatcher = this.vm.$watch(keypath, function (selected) {

            jQuery(subSelector, this.$el).prop('checked', function () {
                return selected.indexOf(self.toNumber(jQuery(this).val())) !== -1;
            });

            self.selected();
            self.state();
        });
    },

    unbind() {

        var self = this;

        jQuery(this.el).off('.check-all');

        if (this.handler) {
            this.handler.forEach(function (handler) {
                jQuery(self.$el).off('.check-all', handler);
            });
        }

        if (this.unbindWatcher) {
            this.unbindWatcher();
        }
    },

    state() {

        var el = jQuery(this.el);

        if (this.checked === undefined) {
            el.prop('indeterminate', true);
        } else {
            el.prop('checked', this.checked).prop('indeterminate', false);
        }

    },

    selected(update) {

        var self = this, keypath = this.arg, selected = [], values = [], value;

        jQuery(this.selector, this.$el).each(function () {

            value = self.toNumber(jQuery(this).val());
            values.push(value);

            if (jQuery(this).prop('checked')) {
                selected.push(value);
            }
        });

        if (update) {

            update = this.vm.$get(keypath).filter(function (value) {
                return values.indexOf(value) === -1;
            });

            this.vm.$set(keypath, update.concat(selected));
        }

        if (selected.length === 0) {
            this.checked = false;
        } else if (selected.length === values.length) {
            this.checked = true;
        } else {
            this.checked = undefined;
        }

    },

    toNumber(value) {
        return this.number ? Number(value) : value;
    }

};
