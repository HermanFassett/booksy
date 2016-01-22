var Users = require('../models/users.js');
var Books = require('../models/books.js');
var path = process.cwd();

function BookHandler () {
	this.getBooks = function(req, res) {
		res.render(path + "/public/books.ejs", {books: [1,2,3]});
	}
	this.addBooks = function(req, res) {
		res.render(path + "/public/add.ejs");
	}
	this.addBook = function(req, res) {
		console.log(req.query);
		res.json(req.query);
	}
}
module.exports = BookHandler;
