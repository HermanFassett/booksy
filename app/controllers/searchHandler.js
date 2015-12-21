var Users = require('../models/users.js');
var path = process.cwd();
var Yelp = require('yelp');

function SearchHandler () {
	var options = {
		consumer_key: process.env.YELP_KEY,
		consumer_secret: process.env.YELP_CONS_SECRET,
		token: process.env.YELP_TOKEN,
		token_secret: process.env.YELP_SECRET,
	};
	var yelp = new Yelp(options);
	this.postSearch = function (req, res) {
		yelp.search({ term: 'bar', location: req.body.location })
		.then(function (data) {
			var businesses = [];
			for (var i in data.businesses) {
				data.businesses[i].people_going = Math.floor(Math.random() * 10);
				businesses.push(data.businesses[i]);
			}
			res.render(path + '/public/search.ejs', {
				businesses: businesses
			});
		})
		.catch(function (err) {
		  console.error(err);
		});
	};
}
module.exports = SearchHandler;
