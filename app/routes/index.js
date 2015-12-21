'use strict';

var path = process.cwd();
var UserHandler = require(path + '/app/controllers/userHandler.server.js');
var SearchHandler = require(path + '/app/controllers/searchHandler.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) return next();
		else {
			if (req.params.vote || req.params.comment) {
				res.contentType('application/json');
				var data = JSON.stringify('/login')
				res.header('Content-Length', data.length);
				res.end(data);
			}
			else res.redirect('/login');
		}
	}

	// Instantiate handlers
	var userHandler = new UserHandler();
	var searchHandler = new SearchHandler();

	// Home page
	app.route('/').get(function (req, res) {
		res.render(path + '/public/index.ejs');
	});

	// Login page
	app.route('/login').get(function (req, res) {
		res.render(path + '/public/login.ejs');
	}).post(userHandler.postLogin);

	// View signup page
	app.route('/signup').get(function (req, res) {
		res.render(path + '/public/signup.ejs');
	}).post(userHandler.postSignup);

	// Logout
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/login');
	});

	// Get a user
	app.route('/user/:name').get(userHandler.getUser);
	app.route('/profile').get(userHandler.getUser);

	// Logged in user
	app.route('/api/:id').get(isLoggedIn, function (req, res) {
		res.json(req.user);
	});

	app.route('/search').get(function(req, res) {
		res.render(path + "/public/search.ejs", {businesses:null});
	}).post(searchHandler.postSearch);
	//Google auth
	app.route('/auth/google').get(passport.authenticate('google', {scope: 'profile email'}));
	app.route('/auth/google/callback').get(passport.authenticate('google',
	{
		successRedirect: '/profile',
		failureRedirect: '/login'
	}));
};
