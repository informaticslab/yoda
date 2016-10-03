/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var logger = require('morgan');
var port = process.env.PORT || 8001;
var four0four = require('./utils/404')();

var passport = require('passport');
// var auth = require('./config/auth');
var cookieParser = require('cookie-parser');
var User = require('./models/User');

var https = require('https');
var fs = require('fs');


var environment = process.env.NODE_ENV;

app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({secret:'use the force',resave:false,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));



passport.use(User.localStrategy);
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

app.use('/api', require('./routes'));
app.use('/logs', require('./logs'));


// app.post('/login', auth.authenticate);

// app.use('/api/users', require())

console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);


var https = require('https'),      // module for https
    fs =    require('fs');         // required to read certs and keys

var options = {
    key:    fs.readFileSync('../../sec/certs/server-key.pem'),
    cert:   fs.readFileSync('../../sec/certs/server-cert.pem'),
    // ca:     [fs.readFileSync('/sec/certs/gd_bundle-g2.crt'),fs.readFileSync('/sec/certs/HHSPIVcachn.pem')],
    // requestCert:        true,
    // rejectUnauthorized: false,
};

if(environment === 'build') {
  // case 'build':
    console.log('** BUILD **');
    app.use(express.static('./build/'));
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static('./build/index.html'));
    // https.createServer(options, app).listen('4400', function() {
    //   console.log('Express server listening on port ' + '4400');
    //   console.log('env = ' + app.get('env') +
    //     '\n__dirname = ' + __dirname +
    //     '\nprocess.cwd = ' + process.cwd());
    // });
    // break;
} else {
  // default:
    console.log('** DEV **');
    app.use(express.static('./src/client/'));
    app.use(express.static('./'));
    app.use(express.static('./tmp'));
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static('./src/client/index.html'));

}

// require('./config/passport')();

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
    '\n__dirname = ' + __dirname +
    '\nprocess.cwd = ' + process.cwd());
});
