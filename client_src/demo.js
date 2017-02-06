var socket = io();

var Preview = {

    name: 'demo',

    el: '#app',

    data() {
        return _.assign({
            socket: socket,
            socket_token: '',
            member_id: 0,
            channel: {},
            modules: {},
            user: {},
            component: 'screen-main',
            viewdata: {
                channel: {
                    content: {
                        config: {}
                    }
                },
                modules: []
            }
        }, window.$data);
    },

    created() {
        this.socket.emit('screen.connect.id', null, this.socket_token);
        this.socket.on('module.response', (module, task, data) => {
            console.log(`Data received from server from ${task} for ${module}`);
            this.$broadcast(`module.response.${module}.${task}`, data);
        });
        this.socket.on('screen.connect.screen', socket_token => {
            this.$broadcast('screen.data.init', this.viewdata);
        });
        this.socket.on('screen.error', error => {
            console.error(error);
            UIkit.notify(error, 'danger');
        });
    },

    methods: {
        command(component, command, data){
            component = component || this.component;
            console.log(`screen.command: send ${command} for ${(component)}`);
            this.socket.emit('screen.command', {component, command, data});
        }
    },

    components: {
        'screen-main': require('./components/screen-main.vue')
    }
};

UIkit.on('beforeready.uk.dom', () => {

    window.$screen = new Vue(Preview);

});