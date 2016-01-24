var Users = require('../models/users.js');
var Books = require('../models/books.js');
var request = require('request');
var parseString = require('xml2js').parseString;
var path = process.cwd();

function BookHandler () {
	this.getBooks = function(req, res) {
		Books.find({}, function(err, data) {
			var books = (data[0].books.length > 0) ? data[0].books : [];
			res.render(path + "/public/books.ejs", {books: books});
		})
	}
	this.addBooks = function(req, res) {
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		Users.findOne({"profile.name": req.user.profile.name}, function(err, data) {
			res.render(path + "/public/add.ejs", {books:data.books});
		});
	}
	this.addBook = function(req, res) {
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		var book = req.body.book;
		var url = "https://www.goodreads.com/search/index.xml";
		var params = "?key="+process.env.GR_KEY+"&q="+book;
		request(url+params, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
				parseString(body, function (err, result) {
					var data = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0] ;
					var book = {
						title: data.title[0],
						image_url: data.image_url[0],
						author: data.author[0].name[0]
					}
					Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$push: {books:book}}, function(err, obj) {
						if (err) console.error(err);
						else {
							Books.findOneAndUpdate({}, {$push: {books: book}}, {upsert: true}, function(err) {
								Users.findOne({"profile.name": req.user.profile.name}, function(err, data) {
									res.render(path + "/public/add.ejs", {books:data.books});
								});
							});
						}
					});
				});
		  }
			else res.json(error)
		});
	}
}
module.exports = BookHandler;
