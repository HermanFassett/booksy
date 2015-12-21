var Users = require('../models/users.js');
var passport = require('passport');
var crypto = require('crypto');
var path = process.cwd();

function SearchHandler () {
	this.getSearch = function (req, res) {
		res.send("Search to be added!");
	};
}
module.exports = SearchHandler;
