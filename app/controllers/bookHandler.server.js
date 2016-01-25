var Users = require('../models/users.js');
var Books = require('../models/books.js');
var request = require('request');
var parseString = require('xml2js').parseString;
var path = process.cwd();

function BookHandler () {
	// Get books for view
	this.getBooks = function(req, res) {
		Books.find({}, function(err, data) {
			var search = req.body.search || "";
			var books = (data[0].books.length > 0) ? data[0].books : [];
			books.filter(function(val) {
				var regex = new RegExp(search, "gi")
				return val.title.match(regex) || val.author.match(regex);
			});
			res.render(path + "/public/books.ejs", {books: books});
		})
	}
	this.tradeBooks = function(req, res) {
		// Check for logged in
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		var book = {
			title: req.body.title,
			author: req.body.author,
			image_url: req.body.image_url,
			owner: req.body.owner
		}
		Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$push: {trade: book}}, {upsert: true}, function(err, lib) {
			var request = {
				title: book.title,
				author: req.body.author,
				image_url: req.body.image_url,
				requester: req.user.profile.name
			}
			Users.findOneAndUpdate({"profile.name": book.owner}, {$push: {requests: request}}, {upsert: true}, function(e, l) {
				res.redirect("/profile");
			});
		});
	}
	// Get books for add page
	this.addBooks = function(req, res) {
		// Check for logged in
		if (!req.user) {
			res.redirect("/login");
		}
		Users.findOne({"profile.name": req.user.profile.name}, function(err, data) {
			res.render(path + "/public/add.ejs", {books:data.books});
		});
	}
	// Remove a book from your account
	this.removeBook = function(req, res) {
		// Check for logged in
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		Users.findOne({"profile.name": req.user.profile.name}, function(err, data) {
			var book = data.books.map(function(b) {
				return b.title
			}).indexOf(req.body.title);
			var books = data.books.splice(book, 1);
			Books.findOne({}, function(e, d) {
				var index = d.books.map(function(b) {
					return b.title + b.owner
				}).indexOf(books[0].title+books[0].owner);
				d.books.splice(index, 1);
				Books.findOneAndUpdate({}, {$set: {books: d.books}}, function(e,l) {});
			})
			Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$set: {books: data.books}}, function(err, lib) {
				res.render(path + "/public/add.ejs", {books:data.books});
			});
		});
	}
	// Add a book to your account
	this.addBook = function(req, res) {
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		var book = req.body.book;
		if (!book) {
			Users.findOne({"profile.name": req.user.profile.name}, function(err, data) {
				res.render(path + "/public/add.ejs", {books:data.books});
			});
		}
		else {
			var url = "https://www.goodreads.com/search/index.xml";
			var params = "?key="+process.env.GR_KEY+"&q="+book;
			request(url+params, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
					parseString(body, function (err, result) {
						var data = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0];
						var book = {
							title: data.title[0],
							image_url: data.image_url[0],
							author: data.author[0].name[0],
							owner: req.user.profile.name
						}
						Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$push: {books:book}}, {upsert: true}, function(err, obj) {
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
}
module.exports = BookHandler;
