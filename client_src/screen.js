var socket = io();

var Screen = {

    name: 'screen',

    el: '#app',

    data() {
        return _.assign({
            hasData: false,
            socket: socket,
            member_id: 0,
            name: '',
            image_url: '',
            component: 'screen-main',
            viewdata: {
                screen: {},
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
        var screen_id = this.getScreenId();
        console.log(`Screen id from localstorage: ${screen_id}`);
        // send to server
        socket.emit('screen.connect.id', screen_id);

        this.socket.on('screen.response', (component, viewdata, message) => {
            console.log(`[INFO] Data received from server for ${component} `, viewdata);
            this.component = component;
            this.viewdata = viewdata;
            if (message) {
                UIkit.notify(message.message, message.status);
            }
            if (!this.hasData) {
                this.hasData = true;
                this.$broadcast('screen.data.init', viewdata);
            }
        });
        this.socket.on('screen.connect.screen', (screen) => {
            console.log(`[info] screen.connect.screen ${screen.id}`);
            this.setScreenId(screen.id);
            this.viewdata.screen = screen;
        });
        this.socket.on('screen.refresh', () => {
            location.reload(true);
        });
        this.socket.on('module.response', (module, task, data) => {
            console.log(`Data received from server from ${task} for ${module}`);
            this.$broadcast(`module.response.${module}.${task}`, data);
        });
        this.socket.on('screen.error', error => {
            console.error(error);
            UIkit.notify(error, 'danger');
        });
    },

    methods: {
        getScreenId() {
            return localStorage.getItem("screen.id");
        },
        setScreenId(id) {
            localStorage.setItem("screen.id", id);
        },
        refreshScreenId() {
            this.setScreenId(0);
            socket.emit('screen.connect.id', 0);
        }
    },

    components: {
        'screen-main': require('./components/screen-main.vue')
    }
};

UIkit.on('beforeready.uk.dom', () => {

    window.$screen = new Vue(Screen);

});