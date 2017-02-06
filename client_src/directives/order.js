module.exports = {

    bind: function () {

        var self = this;

        this.dir       = '';
        this.active    = false;
        this.indicator = jQuery('<i class="uk-icon-justify uk-margin-small-left"></i>');

        jQuery(this.el).addClass('pk-table-order uk-visible-hover-inline').on('click.order', function (){

            self.dir = (self.dir == 'asc') ? 'desc':'asc';
            self.vm.$set(self.expression, [self.arg, self.dir].join(' '));

        }).append(this.indicator);
    },

    update: function (data) {

        var parts = data.split(' '),
            field = parts[0],
            dir   = parts[1] || 'asc';

        this.indicator.removeClass('uk-icon-arrow-up uk-icon-arrow-down');
        jQuery(this.el).removeClass('uk-active');

        if (field == this.arg) {
            this.active = true;
            this.dir    = dir;

            jQuery(this.el).addClass('uk-active');
            this.indicator.removeClass('uk-invisible').addClass(dir == 'asc' ? 'uk-icon-arrow-down':'uk-icon-arrow-up');
        } else {
            this.indicator.addClass('uk-icon-arrow-down uk-invisible');
            this.active = false;
            this.dir    = '';
        }
    },

    unbind: function () {
        jQuery(this.el).removeClass('pk-table-order').off('.order');
        this.indicator.remove();
    }

};
