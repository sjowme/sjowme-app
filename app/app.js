"use strict";

console.log('[INFO]- Loading Node modules...');
//node core
var path = require('path');
var fs = require('fs');

//node modules
var logger = require('morgan');
var subdomain = require('express-subdomain');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');

//load app
console.log('[INFO]- Loading app...');
var config = require('./config');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: true });
console.log('[INFO]- Get lib...');
var lib = require('./lib');
lib.exitmanager();

//module helper
var modules = require('./includes/modules')(config, lib);

//setup db
console.log('[INFO]- Database setup...');
var database = require('./database/knex');
database.initialize(lib, modules);

//subscription helper
var subscriptions = require('./includes/subscriptions')(config, lib, database);

//scheduler
var scheduler = require('./includes/scheduler')(config, lib, database, subscriptions);
//mail events
lib.events.subscribe('user.registered', lib.mailer.sendRegistration);

//get passport
var passport = require('./includes/passport')(config, lib, database, subscriptions);

//view engine
console.log('[INFO]- Set web engine');
app.use(expressLayouts);
app.set('views', path.resolve(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
//set up events and models
console.log('[INFO]- Setting up events');

//set collection paths
database.config.load('collections').then(data => {
    data.collections.forEach(collection => {
        lib.locator.set(collection.name, path.join(config.media(),  'collection'));
    });
});

//get connectors
var memberConnector = require('./socketconnectors/member')(database, lib, subscriptions, modules);
var screenConnector = require('./socketconnectors/screen')(database, lib, subscriptions, modules);
var adminConnector = require('./socketconnectors/admin')(database, lib, subscriptions, modules);

//set subscriptions
io.on('connection', (socket) => {
    screenConnector.setResponses(socket);
    memberConnector.setResponses(socket);
    adminConnector.setResponses(socket);
    console.log(`Client connected: ${socket.id}`);

});
//broadcast stats
setInterval(() => lib.events.trigger('admin.broadcast', {stats: lib.events.getStats()}), 15000);
setInterval(() => lib.events.trigger('member.broadcast', {}), 15000);

//previewer
var previewer = require('./includes/previewer')(config, database, lib);
lib.events.subscribe('channel.create.preview', channel => previewer.createPreview(channel));

// setup the logger
if (config.log.access) {
    var log_file = path.resolve(__dirname, config.log.path) + '/access.log';
    console.log(`[INFO]- Setup loggers at ${log_file}`);
    var accessLogStream = fs.createWriteStream(log_file, {flags: 'a'});
    app.use(logger('combined', {stream: accessLogStream}));
}

//static paths
app.use('/media', express.static(path.resolve(__dirname, '../_media')));
app.use('/assets', express.static(path.resolve(__dirname, '..', '_public', 'assets')));
app.use('/assets/content', express.static(path.resolve(__dirname, '..', 'content', 'images')));

//parsers
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//setup session
app.use( session({
    secret: config.sessionSecret,
    cookie: { domain : `.${config.domain}` },
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

console.log('[INFO]- Setup routers...');
//attach routers
app.use(subdomain('member', require('./routes/member')(passport, config, lib, database, modules)));
app.use(subdomain('screen', express.static(path.resolve(__dirname, '..', '_public', 'screen'))));
app.use(subdomain('admin', require('./routes/admin')(passport, config, lib)));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error(`Not Found ${req.originalUrl}`);
    err.status = 404;
    next(err);
});

//error handling
app.use(methodOverride());
app.use(lib.error.logErrors);
app.use(lib.error.clientErrorHandler);
app.use(lib.error.errorHandler);

//spin it up
console.log('[INFO]- Starting Listener');
server.listen(config.port, () => {
    console.log(`listening on http://${config.domain}:${config.port}`);
    console.log('Ready to sjow!');
});
console.log('[INFO]- System started at ' , (new Date()).toTimeString().split(' ')[0]);
