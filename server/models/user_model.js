const mongoose = require('mongoose');

var userSchema = {
    email: {type: String, required: true, minlength: 1, trim: true}
};

var User = mongoose.model('User', userSchema);

module.exports = {User};