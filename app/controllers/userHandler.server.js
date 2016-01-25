var Users = require('../models/users.js');
var passport = require('passport');
var crypto = require('crypto');
var path = process.cwd();

function UserHandler () {
	var apiUrl = path + '/api/:id';
	// Get a user or profile
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
	// Login
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
	// Signup
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
	// Change settings
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
	// Accept a trade ... sort of
	this.acceptTrade = function(req, res) {
		if (!req.user) {
			res.redirect("/login")
		}
		var request = JSON.parse(req.params.i);
		Users.findOne({"profile.name": request.requester}, function(err, data) {
			var book = data.trade.map(function(b) {
				return b.title+b.owner
			}).indexOf(request.title+req.user.profile.name);
			var books = data.trade.splice(book, 1);
			Users.findOneAndUpdate({"profile.name": request.requester}, {$set: {trade: data.trade}}, function(er, lib) {
				Users.findOne({"profile.name": req.user.profile.name}, function(e, d) {
					var book = d.requests.map(function(b) {
						return b.title+b.requester
					}).indexOf(request.title+request.requester);
					var books = d.requests.splice(book, 1);
					Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$set: {requests: d.requests}}, function(e, l) {
						res.redirect("/profile");
					});
				});
			});
		});
	}
	// Decline a trade
	this.declineTrade = function(req, res) {
		if (!req.user) {
			res.redirect("/login")
		}
		var request = JSON.parse(req.params.i);
		Users.findOne({"profile.name": request.requester}, function(err, data) {
			var book = data.trade.map(function(b) {
				return b.title+b.owner
			}).indexOf(request.title+req.user.profile.name);
			var books = data.trade.splice(book, 1);
			Users.findOneAndUpdate({"profile.name": request.requester}, {$set: {trade: data.trade}}, function(er, lib) {
				Users.findOne({"profile.name": req.user.profile.name}, function(e, d) {
					var book = d.requests.map(function(b) {
						return b.title+b.requester
					}).indexOf(request.title+request.requester);
					var books = d.requests.splice(book, 1);
					Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$set: {requests: d.requests}}, function(e, l) {
						res.redirect("/profile");
					});
				});
			});
		});
	}
}
module.exports = UserHandler;
