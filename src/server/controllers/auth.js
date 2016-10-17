var passport = require('passport')
  , User = require('../models/User.js');

module.exports = function () {

  var service = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn
  };

  return service;

  ///////////////////////////////

  function login(req, res, next) {
    passport.authenticate('local', function (err, user) {
      // console.log(err);
      // console.log(user);
      if (err) { return next(err); }
      if (!user) { return res.sendStatus(400); }


      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }

        if (req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        res.json(200, { "role": user.role, "username": user.username });
      });
    })(req, res, next);
  }

  function logout(req, res, next) {
    req.logout();
    req.end();
  }

  function isLoggedIn(req, res) {
    if (req.isAuthenticated()) {
      res.send({ state: 'success', user: req.user });
    } else {
      res.send({ state: 'fail', user: null });
    }
  }

};
