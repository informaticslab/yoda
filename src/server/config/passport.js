var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

module.exports = function() {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      var user = {
        username: username,
      };
      console.log('user: ', username);
      console.log('password: ', password);
      if(username === 'labuser' && password ==='testwiththelab') {
        return done(null, user);
      } else {
        return done(null, false, {message: 'Incorrect Username/Password'});
      }
    }
  ));

  passport.serializeUser(function(user, done) {
    if(user){
      done(null, user);
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
  });
}
