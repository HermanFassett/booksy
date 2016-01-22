var Users = require('../models/users.js');
var Books = require('../models/books.js');
var request = require('request');
var parseString = require('xml2js').parseString;
var path = process.cwd();

function BookHandler () {
	this.getBooks = function(req, res) {
		res.render(path + "/public/books.ejs", {books: [1,2,3]});
	}
	this.addBooks = function(req, res) {
		res.render(path + "/public/add.ejs");
	}
	this.addBook = function(req, res) {
		var book = req.body.book;
		var url = "https://www.goodreads.com/search/index.xml";
		var params = "?key="+process.env.GR_KEY+"&q="+book;
		request(url+params, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				parseString(body, function (err, result) {
			    res.json(result);
				});
		  }
			else res.json(error)
		});
		//res.json(req.body);
	}
}
module.exports = BookHandler;
