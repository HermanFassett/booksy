var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	/**
	 * Sign in using Email and Password.
	 */
	passport.use(new LocalStrategy({usernameField: 'email'}, function(email, password, done) {
	  email = email.toLowerCase();
	  User.findOne({ email: email }, function(err, user) {
	    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
	    user.comparePassword(password, function(err, isMatch) {
	      if (isMatch) return done(null, user);
	      else return done(null, false, { message: 'Invalid email or password.' });
	    });
	  });
	}));

	passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	},
	function(req, accessToken, refreshToken, profile, done) {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile.emails[0].value }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          existingEmailUser.google = profile.id;
	        existingEmailUser.tokens.push({ kind: 'google', accessToken: accessToken });
          existingEmailUser.save(function(err) {
            done(err, existingEmailUser);
          });
        } else {
          var user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.going = [];
          user.profile.picture = profile._json.image.url;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
	}));

	/**
	 * Authorization Required middleware.
	 */
	exports.isAuthorized = function(req, res, next) {
	  var provider = req.path.split('/').slice(-1)[0];
	  if (_.find(req.user.tokens, { kind: provider })) next();
	  else res.redirect('/auth/' + provider);
	};
};
