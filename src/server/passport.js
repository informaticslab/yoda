var passport = require('passport'),
  mongoose = require('mongoose'),
  LocalStrategy = require('passport-local').Strategy,
  User = mongoose.model('User');

module.exports = function() {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      if(username === 'tester' && password === 'Ilikegummybears') {
        return done(null);
      } else {
        return done(null, false, {message: 'Incorrect username or password'})
      }
    }
  ));

  passport.serializeUser(function(user, done) {
    if(user) {
      done(null, user._id);
    }
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({_id:id}).exec(function(err, user) {
      if(user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  })

}