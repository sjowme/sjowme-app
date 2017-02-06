var _ = require('lodash');

var modules = {};
//todo glob folders async
var module_names = ['logo', 'list', 'weather', 'clock', 'twitter', 'rss', 'ticketcounter'];

module.exports = (config, lib) => {

    function sjowmeModule(module) {
        return {
            name: module.name,
            module: module,

            command(command, module_config, data, cb) {
                if (!this.module.commands[command] || !_.isFunction(this.module.commands[command])) {
                    cb(new Error(`Module ${module} has no command ${command}!`));
                }
                this.module.commands[command].call(null, module_config, data, cb);
            },

            siteData() {
                return _.pickBy(this.module, (prop, key) => ['command'].indexOf(key) === -1);
            }
        };
    }


    //load the modules
    module_names.forEach(module_name => modules[module_name] = sjowmeModule(require(`../../client_src/modules/${module_name}`)));

    return {
        get(name) {
            return _.find(modules, {name});
        },
        siteData() {
            return _.map(modules, module => module.siteData());
        },
        doCommand(module, command, module_config, data, cb) {
            if (modules[module] === undefined) {
                cb(new Error(`Module ${module} not registered!`));
            }
            modules[module].command(command, module_config, data, cb);
        }
    };

};