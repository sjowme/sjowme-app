module.exports = {

    template: '<ul class="uk-pagination"></ul>',

    props: {
        page: {
            default: 0
        },

        pages: {
            default: 1
        }
    },

    created: function () {

        this.key = this.$parent.$options.name + '.pagination';

        if (this.page === null && this.$session.get(this.key)) {
            this.$set('page', this.$session.get(this.key));
        }

    },

    ready: function () {

        var vm = this;

        this.pagination = UIkit.pagination(this.$el, {pages: this.pages, currentPage: this.page || 0});
        this.pagination.on('select.uk.pagination', (e, page) => {
            vm.$set('page', page);
        });

    },

    watch: {

        page(page) {
            this.pagination.selectPage(page || 0);
        },

        pages(pages) {
            this.pagination.render(pages);
        }

    }

};
