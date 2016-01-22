var Users = require('../models/users.js');
var Books = require('../models/books.js');
var path = process.cwd();

function BookHandler () {
	this.getBooks = function(req, res) {
		res.render(path + "/public/books.ejs", {books: [1,2,3]});
	}
}
module.exports = BookHandler;
