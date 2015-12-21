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
		yelp.search({ term: 'food', location: req.body.location })
		.then(function (data) {
			res.render(path + '/public/search.ejs', {
				items: data
			});
		})
		.catch(function (err) {
		  console.error(err);
		});
	};
}
module.exports = SearchHandler;
