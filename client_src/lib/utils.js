"use strict";

exports.file = {
    name: '',
    provider: '',
    path: '',
    image_url: '',
    date: new Date(),
    size: 0,
    owner: 0,
    data: {}
};

/**
 * Create dropdown from element
 * @param $el jQuery DOM element
 * @param cb callback to call with files
 */
exports.makeDroppable = ($el, cb) => {
    const dragoverClass = 'sj-media-drop-dragover';
    let hasdragCls = false;
    $el.on('drop', e => {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files) {
            e.stopPropagation();
            e.preventDefault();
            $el.removeClass(dragoverClass);
            cb(e.originalEvent.dataTransfer.files);
        }
    }).on('dragenter', e => {
        e.stopPropagation();
        e.preventDefault();
    }).on('dragover', e => {
        e.stopPropagation();
        e.preventDefault();
        if (!hasdragCls) {
            $el.addClass(dragoverClass);
            hasdragCls = true;
        }
    }).on('dragleave', e => {
        e.stopPropagation();
        e.preventDefault();
        $el.removeClass(dragoverClass);
        hasdragCls = false;
    });
};


