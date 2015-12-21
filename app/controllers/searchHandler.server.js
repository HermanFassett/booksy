var Users = require('../models/users.js');
var Going = require('../models/going.js');
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

	this.getSearch = function(req, res) {
		var location = (req.user) ? req.user.location : null;
		res.render(path + "/public/search.ejs", {businesses: null, location: location});
	};

	this.postSearch = function (req, res) {
		yelp.search({ term: 'bar', location: req.body.location })
		.then(function (data) {
			if (req.user) {
				Users.update({"profile.name":req.user.profile.name},{location:req.body.location},{upsert: true},function(e, r){});
			}
			var businesses = [];
			Going.findOne({}, function (err, result) {
				if (err) throw err;
				for (var i in data.businesses) {
					var amount = 0, going_index = result.going.indexOf(data.businesses[i].id);
					if (going_index != -1) amount = result.amount[going_index];
					data.businesses[i].people_going = amount;
					businesses.push(data.businesses[i]);
				}
				res.render(path + '/public/search.ejs', {
					businesses: businesses, location: null
				});
			});
		})
		.catch(function (err) {
		  console.error(err);
		});
	};

	this.getGoing = function(req, res) {
		if (!req.user) {
			res.contentType('application/json');
			var data = JSON.stringify('/login')
			res.header('Content-Length', data.length);
			return res.end(data);
		}
		Going.findOne({}, function (err, result) {
			if (err) throw err;
			var goingHidden = req.params.id, index = req.params.index;
			var going_index = result.going.indexOf(goingHidden);
			if (going_index != -1) res.json({amount: result.amount[going_index], index: index});
			else res.json(0);
		});
	};

	this.addGoing = function(req, res) {
		Going.findOne({}, function (err, result) {
			if (err) throw err;
			var index = req.params.index;
			var goingHidden = req.params.id;
			var going_index = result.going.indexOf(goingHidden);
			if (going_index != -1) {
				var update = {};
				update["amount." + going_index] = req.params.amount;
				Going.findOneAndUpdate({}, { $inc: update}, function(e, r) {});
			}
			else
				Going.findOneAndUpdate({}, { $push: { going: goingHidden, amount: 1 }}, function(e, r) {})
			Users.findOne({"profile.name": req.user.profile.name}, function(err, user) {
				if (user.going.indexOf(goingHidden) == -1) {
					Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$push: {going: goingHidden}}, function(e, r) {
						res.end();
					});
				}
				else if (req.params.amount == -1) {
					Users.findOneAndUpdate({"profile.name": req.user.profile.name}, {$pull: {going: goingHidden}}, function(e, r) {
						res.end();
					});
				}
				else res.end();
			});
		});
	};

	this.getSet = function(req, res) {
		if (req.user) {
			Users.findOne({"profile.name": req.user.profile.name}, function(err, user) {
				res.json({result: user.going.indexOf(req.params.id) !== -1, index: req.params.index});
			});
		}
		else res.json({result: false});
	};
}
module.exports = SearchHandler;
