
module.exports = {

    tag: {
        name: '',
        count: 0
    },

    collections: [
        {name: 'algemeen', label: 'Algemeen'},
        {name: 'natuur', label: 'Natuur'},
        {name: 'huis-en-tuin', label: 'Huis & Tuin'},
        {name: 'transport', label: 'Transport'},
    ],

    modules: [
        require('../../client_src/modules/logo'),
        require('../../client_src/modules/list'),
        require('../../client_src/modules/weather'),
        require('../../client_src/modules/twitter')
    ]

};