var mongoose = require('mongoose');
var {ObjectID} = require('mongodb');
var url = process.env.MONGODB_URI || 'mongodb://root:test@localhost:27017';

// Telling mongoose which Promise lib to use
mongoose.Promise = global.Promise;
mongoose.connect(url, {});

module.exports = {
    mongoose,
    ObjectID
};
