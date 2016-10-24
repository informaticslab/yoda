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
var cookieParser = require('cookie-parser');

var User = require('./models/User');

var http = require('http');
var https = require('https');
var fs = require('fs');

var userRoles = require('./accessConfig');


var environment = process.env.NODE_ENV;

app.use(favicon(__dirname + '/favicon.ico'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret:'use the force',resave:false,saveUninitialized:false}));

app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', require('./routes'));
app.use('/logs', require('./logs'));





passport.use(User.localStrategy);
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);


console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

if(environment === 'build') {
  var envProperties = require('./envProperties');

  var https = require('https'),      // module for https
    fs =    require('fs');         // required to read certs and keys

    var options = {
    key:    fs.readFileSync('../../../../sec/certs/server-key.pem'),
    cert:   fs.readFileSync('../../../../sec/certs/server-cert.pem'),
    ca:     fs.readFileSync('../../../../sec/certs/gd_bundle-g2.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

  // case 'build':
    console.log('** BUILD **');
    app.use(express.static('./build/'));
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static('./build/index.html'));


    https.createServer(options, app).listen('4400');

    http.createServer(function (req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      // res.writeHead(301, { "Location": "https://localhost:4400" });
      res.end();
    }).listen(port);

} else {
  console.log('** DEV **');
  app.use(express.static('./src/client/'));
  app.use(express.static('./'));
  app.use(express.static('./tmp'));
  // Any invalid calls for templateUrls are under app/* and should return 404
  app.use('/app/*', function (req, res, next) {
    four0four.send404(req, res);
  })

  // Any deep link calls should return index.html
  // app.use('/*', express.static('./src/client/index.html'));
  app.use('/*', express.static('./src/client/index.html'));

  app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
      '\n__dirname = ' + __dirname +
      '\nprocess.cwd = ' + process.cwd());
  });


}

// require('./config/passport')();

