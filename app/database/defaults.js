var _ = require('lodash');

var slide = {
    active: true,
    number: 1,
    background: {
        bg_type: 'media',
        src: '/assets/images/noimage.png',
        name: 'No Image',
        path: 'images:noimage.png',
        type: 'image',
        color: '#ffffff',
        width: 0,
        height: 0
    },
    modules: [],
    config: {
        style: 'default',
        size: 'large',
        /*title: {
            active: true,
            position: 'c',
            size: 'uk-h1',
            color: '',
            uppercase: false,
        },*/
        player: {
            duration: 0,
            animation: ''
        }
    },
    title: ''
};

var preview = {
    name: '',
    provider: '',
    path: '',
    ETag: '',
    image_url: '/assets/images/noimage.png'
};

module.exports = {

    slide: slide,

    channel: {
        id: 0,
        name: '',
        content: {
            slides: [
                _.defaults({number: 1, title: 'Slide 1'}, slide),
                _.defaults({number: 2, title: 'Slide 2'}, slide),
                _.defaults({number: 3, title: 'Slide 3'}, slide),
                _.defaults({number: 4, title: 'Slide 4'}, slide),
                _.defaults({number: 5, title: 'Slide 5'}, slide),
                _.defaults({number: 6, title: 'Slide 6'}, slide),
                _.defaults({number: 7, title: 'Slide 7'}, slide),
                _.defaults({number: 8, title: 'Slide 8'}, slide),
                _.defaults({number: 9, title: 'Slide 9'}, slide),
                _.defaults({number: 10, title: 'Slide 10'}, slide)
            ]
        },
        config: {
            style: 'default',
            player: {
                duration: 10000,
                animation: 'fade'
            }
        },
        created_at: '',
        updated_at: '',
        owner: 0,
        category: '',
        previews: {
            slide1: _.defaults({name: 'slide1'}, preview),
            slide2: _.defaults({name: 'slide2'}, preview),
            slide3: _.defaults({name: 'slide3'}, preview),
            slide4: _.defaults({name: 'slide4'}, preview),
            slide5: _.defaults({name: 'slide5'}, preview),
            slide6: _.defaults({name: 'slide6'}, preview),
            slide7: _.defaults({name: 'slide7'}, preview),
            slide8: _.defaults({name: 'slide8'}, preview),
            slide9: _.defaults({name: 'slide9'}, preview),
            slide10: _.defaults({name: 'slide10'}, preview)
        }
    },

    screen: {
        id: 0,
        name: '',
        active: false,
        created_at: '',
        updated_at: '',
        owner: 0,
        channel: 0
    },

    user: {
        id: 0,
        name: '',
        email: '',
        company: '',
        image_url: '',
        oauth_provider: 'google',
        oauth_id: 0,
        tokens: {},
        active: true,
        user_group: 'member',
        data: {},
        created_at: '',
        updated_at: '',
        remember: ''
    },

    media: {
        id: 0,
        name: '',
        collection: 'algemeen',
        provider: 'local',
        type: 'image',
        path: '',
        tags: [],
        data: {
            url: '',
            duration: '',
            poster: '',
            id: '',
            width: 0,
            height: 0
        },
        owner: 0
    },

    tag: {
        name: '',
        count: 0
    },

    subscription: {
        id: 0,
        payed: false,
        name: '',
        starts_at: '',
        expires_at: '',
        transaction_id: '',
        data: {},
        owner: 0,
        price: 0
    },

    invoice: {
        id: 0,
        user_id: 0,
        number: '',
        reference: '',
        vat_perc: 0,
        net_price: 0,
        vat_amount: 0,
        total_price: 0,
        transaction_id: '',
        address: {},
        transaction: {},
        data: {
            specifications: []
        },
        created_at: '',
        updated_at: ''
    }
};