var mongoose = require('mongoose');

var booksSchema = new mongoose.Schema({
  books: Array
});

module.exports = mongoose.model('Books', booksSchema);
