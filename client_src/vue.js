
var Vue = require('vue');

Vue.use(require('vue-form'));
// Vue.use(require('vue-intl'));
Vue.use(require('./lib/filters'));

Vue.use(require('./lib/trans'));

if (window.$default_locale) {
    var translations = {};
    translations[window.$default_locale] = {messages: require(`../language/${window.$default_locale}/messages`)};

    Vue.prototype.$locale = {
        locale: window.$default_locale, //todo have current_locale
        fallback: window.$default_locale,
        defaultDomain: 'messages',
        translations: translations
    };
}

Vue.component('v-pagination', require('./components/ui/pagination'));
Vue.component('input-filter', require('./components/ui/input-filter.vue'));
Vue.component('input-tags', require('./components/ui/input-tags.vue'));
Vue.component('textfield-edit', require('./components/ui/textfield-edit.vue'));
Vue.component('info-icon', require('./components/ui/info-icon.vue'));
Vue.component('exclamation-icon', require('./components/ui/exclamation-icon.vue'));

Vue.directive('check-all', require('./directives/check-all'));
Vue.directive('order', require('./directives/order'));

Vue.use(require('./form-fields/fields'));

module.exports = Vue;

