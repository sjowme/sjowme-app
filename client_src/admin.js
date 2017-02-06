var socket = io();

var Admin = {

    name: 'admin',

    el: '#app',

    data() {
        return _.assign({
            socket: socket,
            socket_token: '',
            member_id: 0,
            name: '',
            member_url: '',
            image_url: '',
            google_url: '',
            component: 'admin-main',
            state: {},
            user: {},
            viewdata: {}
        }, window.$data);
    },

    created() {
        this.state = JSON.parse(sessionStorage.getItem('admin') || '{}');
        this.socket.emit('admin.submit.token', this.socket_token, this.component, {filter: this.state[this.component]});
        this.socket.on('admin.response', (command, component, viewdata, message) => {
            console.log(`Data received from server from ${command} for ${component}`);
            if (message) {
                UIkit.notify(message.message, message.status);
            }
            if (Object.keys(this.$options.components).indexOf(component) > -1) {
                this.component = component;
                this.viewdata = viewdata;
            }
            this.$nextTick(() => this.$broadcast('socket.data', command, component, viewdata));
        });
        this.socket.on('module.response', (module, task, data) => {
            console.log(`Data received from server from ${task} for ${module}`);
            this.$broadcast(`module.response.${module}.${task}`, data);
        });
        this.socket.on('admin.error', error => {
            console.error(error);
            UIkit.notify(error, 'danger');
        });
        this.socket.on('admin.broadcast', data => {
            if (data.message) {
                UIkit.notify(data.message.message, data.message.status);
            }
            this.$broadcast('global.broadcast', data);
        });
    },

    methods: {
        command(component, command, data){
            component = component || this.component;
            console.log(`admin.command: send ${command} for ${(component)}`);
            socket.emit('admin.command', {component, command, data});
        },
        saveState(components, data) {
            components.forEach(component => this.state[component] = data);
            sessionStorage.setItem('admin', JSON.stringify(this.state));
        }
    },

    components: {
        'admin-main': require('./components/admin-main.vue'),
        'admin-config': require('./components/admin-config.vue'),
        'user-edit': require('./components/user-edit.vue'),
        'user-list': require('./components/user-list.vue'),
        'channel-edit': require('./components/channel-edit.vue'),
        'channel-list': require('./components/channel-list.vue'),
        'media-edit': require('./components/media-edit.vue'),
        'media-list': require('./components/media-list.vue'),
        'subscription-list': require('./components/subscription-list.vue'),
        'subscription-edit': require('./components/subscription-edit.vue'),
        'invoice-list': require('./components/invoice-list.vue'),
        'invoice-edit': require('./components/invoice-edit.vue')
    }
};

require('./theme');

UIkit.on('beforeready.uk.dom', () => {

    window.$admin = new Vue(Admin);

});