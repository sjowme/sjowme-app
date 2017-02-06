"use strict";

const assets = __dirname + "/_public/assets";

const loaders = [
    {test: /\.vue$/, loader: "vue"},
    {test: /\.html$/, loader: "vue-html"},
    {test: /\.js/, loader: 'babel', query: {presets: ['es2015']}}
];

const externals = {
    "jquery": "jQuery",
    "uikit": "UIkit",
    "vue": "Vue",
    "lodash": "_"
};

module.exports = [

    {
        entry: {
            "vue": "./client_src/vue"
        },
        output: {
            filename: "./_public/assets/vue/[name].js",
            library: "Vue"
        },
        module: {
            loaders: loaders
        }
    },

    {
        entry: {
            "app": "./client_src/member",
            "preview": "./client_src/preview",
            "demo": "./client_src/demo"
        },
        output: {
            filename: "./_public/member/js/[name].js"
        },
        externals: externals,
        module: {
            loaders: loaders
        }
    },

    {
        entry: {
            "app": "./client_src/admin"
        },
        output: {
            filename: "./_public/admin/js/[name].js"
        },
        externals: externals,
        module: {
            loaders: loaders
        }
    },

    {
        entry: {
            "app": "./client_src/screen"
        },
        output: {
            filename: "./_public/screen/js/[name].js"
        },
        externals: externals,
        module: {
            loaders: loaders
        }
    }
];
