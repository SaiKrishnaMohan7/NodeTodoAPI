const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// https://stackoverflow.com/questions/22950282/mongoose-schema-vs-model

var schemaObject = {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
};
var UserSchema = new mongoose.Schema(schemaObject);

/**
 * @override
 */
UserSchema.methods.toJSON = function () {
    let user = this;
    let userObj = user.toObject();

    // Only return some details
    return _.pick(userObj, ['_id', 'email']);
};

// instance methods
UserSchema.methods.generateAuthToken = function () {
    // not using arrow functions as they don't bind this. generateAuthToken is instance method so
    // this refers to whichever instance of UserSchema is accesing this method
    let user = this;
    let access = 'auth';
    let signObj = {_id: user._id.toHexString(), access};
    let token = jwt.sign((signObj).toString(), 'abc345');

    user.tokens.push({access, token});
    // user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    });
};


var User = mongoose.model('User', UserSchema);

module.exports = {User};