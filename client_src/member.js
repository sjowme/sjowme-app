var socket = io();

var Member = {

    name: 'member',

    el: '#app',

    data() {
        return _.assign({
            socket: socket,
            socket_token: '',
            member_id: 0,
            name: '',
            image_url: '',
            google_url: '',
            component: 'member-main',
            state: {},
            viewdata: {},
            user: {}
        }, window.$data);
    },

    created() {
        this.state = JSON.parse(sessionStorage.getItem('admin') || '{}');
        this.socket.emit('member.submit.token', this.socket_token, this.component);
        this.socket.on('member.response', (command, component, viewdata, message) => {
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
        this.socket.on('member.error', error => {
            console.error(error);
            UIkit.notify(error, 'danger');
        });
        this.socket.on('member.broadcast', data => {
            if (data.message) {
                UIkit.notify(data.message.message, data.message.status);
            }
            this.$broadcast('global.broadcast', data);
        });
    },

    methods: {
        command(component, command, data){
            component = component || this.component;
            console.log(`member.command: send ${command} for ${(component)}`);
            this.socket.emit('member.command', {component, command, data});
        },
        saveState(components, data) {
            components.forEach(component => this.state[component] = data);
            sessionStorage.setItem('member', JSON.stringify(this.state));
        }
    },

    components: {
        'channel-edit': require('./components/channel-edit.vue'),
        'member-main': require('./components/member-main.vue'),
        'member-profile': require('./components/member-profile.vue')
    }
};

require('./theme');

UIkit.on('beforeready.uk.dom', () => {

    window.$member = new Vue(Member);

});