var Users = require('../models/users.js');
var passport = require('passport');
var crypto = require('crypto');
var path = process.cwd();

function UserHandler () {
	var apiUrl = path + '/api/:id';
	this.getUser = function (req, res) {
		var button = false, name = req.params.name;
		if (!req.params.name) {
			name = req.user.profile.name, button = true;
		};
		Users.findOne({ 'profile.name' : name }, function(err, result) {
			res.render(path + '/public/user.ejs', {
				name: result.profile.name,
				img: result.profile.picture,
				button: button,
				books: (result.books.length > 0) ? result.books : false,
				trade: (result.trade.length > 0) ? result.trade : false,
				fullname: result.profile.fullname || "N/A",
				location: result.location || "N/A",
				requests: (result.requests.length > 0) ? result.requests : false
			});
		});
	};
	this.postLogin = function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) {
	      return next(err);
	    }
	    if (!user) {
	      console.log(info.message);
	      return res.redirect('/login');
	    }
	    req.logIn(user, function(err) {
	      if (err) {
	        return next(err);
	      }
	      res.redirect(req.session.returnTo || '/');
	    });
	  })(req, res, next);
	};
	this.postSignup = function(req, res, next) {
		var md5 = crypto.createHash('md5').update(req.body.email).digest('hex');
	  var img = 'https://gravatar.com/avatar/' + md5 + '&d=retro';
	  var user = new Users({
			profile: {
				picture: img,
				name: req.body.username
			},
	    email: req.body.email,
	    password: req.body.password,
			going: []
	  });

	  Users.findOne({ email: req.body.email }, function(err, existingUser) {
	    if (existingUser) {
	      console.log('Account with that email address already exists.');
	      return res.redirect('/signup');
	    }
	    user.save(function(err) {
	      if (err) {
	        return next(err);
	      }
	      req.logIn(user, function(err) {
	        if (err) {
	          return next(err);
	        }
	        res.redirect('/');
	      });
	    });
	  });
	};
	this.changeSettings = function(req, res) {
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		Users.findOneAndUpdate({"profile.name": req.user.profile.name},
			{$set: {location:req.body.location, "profile.fullname": req.body.name}},
			function(err, result) {
				res.redirect("/profile");
			}
		);
	}
}
module.exports = UserHandler;
