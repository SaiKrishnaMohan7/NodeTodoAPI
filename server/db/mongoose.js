var mongoose = require('Mongoose');
var url = process.env.DB_URL || 'mongodb://localhost:27017/TodoApp';
// Telling mongoose which Promise lib to use
mongoose.Promise = global.Promise;
mongoose.connect(url, {useNewUrlParser: true});

module.exports = {
    mongoose
};