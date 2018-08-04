var mongoose = require('mongoose');
var {ObjectID} = require('mongodb');

var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoAppTest';

// Telling mongoose which Promise lib to use
mongoose.Promise = global.Promise;
mongoose.connect(url, { useNewUrlParser: true });

module.exports = {
    mongoose,
    ObjectID
};
