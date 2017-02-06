var socket = io();

var Preview = {

    name: 'preview',

    el: '#app',

    data() {
        return _.assign({
            socket: socket,
            socket_token: '',
            member_id: 0,
            slide:{},
            channel: {},
            modules: {},
            user: {}
        }, window.$data);
    },

    created() {
        this.socket.emit('screen.connect.id', null,  this.socket_token);
        this.socket.on('module.response', (module, task, data) => {
            console.log(`Data received from server from ${task} for ${module}`);
            this.$broadcast(`module.response.${module}.${task}`, data);
        });
        this.socket.on('screen.error', error => {
            console.error(error);
            UIkit.notify(error, 'danger');
        });
    },

    ready() {
        //set title to middle, phantom won't flex that
        // var $center_pos = UIkit.$('.sj-pos-c');
        // $center_pos.css({
        //     'top': '50%',
        //     'left': '50%',
        //     'margin-left': -($center_pos.width() / 2),
        //     'margin-top': -($center_pos.height() / 2)
        // });
    },

    methods: {
        command(component, command, data){
            component = component || this.component;
            console.log(`screen.command: send ${command} for ${(component)}`);
            this.socket.emit('screen.command', {component, command, data});
        }
    },

    components: {
        'screen-slide': require('./components/screen-slide.vue')
    }
};

UIkit.on('beforeready.uk.dom', () => {

    window.$member = new Vue(Preview);

});