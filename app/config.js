var path = require('path');

var ssl = process.env.SJ_SSL || false;
var port = Number(process.env.PORT) || 8801; //port assigned by environment
var main_sub = process.env.SJ_SUBDOMAIN_MAIN || 'www';
var domain = process.env.SJ_DOMAIN_NAME || 'sjow.me';
var port_rewrite = process.env.SJ_PORT_REWRITE || false;

module.exports = {
    //server settings
    environment: process.env.SJ_ENV || 'production',
    ssl: ssl,
    port: port,
    main_sub: main_sub,
    domain: domain,
    port_rewrite: port_rewrite,
    site_title: 'SjowMe - Uw eigen scherm aan de muur!',
    default_locale: 'nl-NL',

    // Google OAuth Credentials set calback url
    // `http://sjowme.dev:8801/auth/google/callback`
    googleOAuthClientId: process.env.SJ_GOOGLE_OAUTH_CLIENTID || "1029052903116-119sf058iik58mknnhee3hgi379plq9m.apps.googleusercontent.com",
    googleOAuthlientSecret: process.env.SJ_GOOGLE_OAUTH_CLIENTSECRET || "3naua8T0tQKLK5pcVMkxjndu",

    //session
    sessionSecret: process.env.SJ_SESSION_SECRET || "SjOwMe-session-Secret-2016-9yhju76tgfhjuygbvfjhukyuhts59iugfre4784654",

    //initial admin GOOGLE ID
    root_admin: process.env.SJ_ROOT_ADMIN || 0,

    mediaproviders: {
        local: {
            path: path.resolve(__dirname, '../_media')
        },
        s3: {
            accessKeyId: process.env.SJ_S3_KEY,
            secretAccessKey: process.env.SJ_S3_SECRET,
            Bucket: process.env.SJ_S3_BUCKET_MEDIA,
            region: process.env.SJ_S3_REGION
        },
        google: {
            client_id: process.env.SJ_GOOGLE_CLIENT_ID,
            private_key_id: process.env.SJ_GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.SJ_GOOGLE_PRIVATE_KEY,
            project: process.env.SJ_GCLOUD_PROJECT,
            bucket: process.env.SJ_GCLOUD_BUCKET,
        },
        youtube: {},
        vimeo: {}
    },
    remote_media: 'google',

    darksky: {
        api_key: process.env.SJ_FORECAST_API_KEY,
        ttl: 15
    },

    twitter: {
        consumer_key: process.env.SJ_TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.SJ_TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.SJ_TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.SJ_TWITTER_ACCESS_TOKEN_SECRET
    },

    mailer: {
        connection: process.env.SJ_MAILER_CONNECTION,
        from_name: 'SjowMe',
        from_address: 'info@sjow.me',
        bcc: 'info@sjow.me,admin@bixie.nl'
    },
    rss: {
        ttl: 5
    },

    //app settings
    log: {
        sendErrorMail: process.env.SJ_LOG_ERROR_MAIL || '',
        sendExitMail: process.env.SJ_LOG_EXIT_MAIL || '',
        path: process.env.SJ_LOG_PATH || '../log',
        errors: process.env.SJ_LOG_ERRORS || false,
        access: process.env.SJ_LOG_ACCESS || false,
    },

    //paths
    root() {
        return __dirname;
    },

    media() {
        return path.resolve(__dirname, '..', '_media');
    },

    views() {
        return path.resolve(__dirname, '..', 'views');
    },

    preview() {
        return path.resolve(__dirname, '..', '_previews');
    },

    public() {
        return path.resolve(__dirname, '..', '_public');
    },

    baseUrl(sub_domain) {
        return `${(ssl ? 'https' : 'http')}://${(sub_domain ? `${sub_domain}.` : `${main_sub}.`)}${domain}${(port_rewrite ? '' : `:${port}`)}`;
    }
};