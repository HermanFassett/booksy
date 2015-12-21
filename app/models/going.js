var mongoose = require('mongoose');

var goingSchema = new mongoose.Schema({
  going: Array,
  amount: Array
});

module.exports = mongoose.model('Going', goingSchema);
