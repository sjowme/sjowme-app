var config = require('../config');
var path = require('path');
var _ = require('lodash');

var paths = {
    '': config.root(),
    'images': path.join(config.root(), '_public', 'assets', 'images')
};

function set(prefix, path) {
    paths[prefix] = path;
}

function get(file_path) {
    if (!file_path) {
        return false;
    }
    var prefix = '', parts = String(file_path).split(':');
    if (parts.length === 2) {
        prefix = parts[0];
        file_path = parts[1];
    }
    if (paths[prefix]) {
        file_path = path.resolve(paths[prefix], file_path);
        return file_path;
    }
    return false;
}

module.exports = {
    set: set,
    get: get
};