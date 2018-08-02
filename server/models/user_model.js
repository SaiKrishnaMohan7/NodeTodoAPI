const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
    let token = jwt.sign(signObj, 'abc345').toString();

    user.tokens.push({access, token});
    // user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    
    let user = this;
    let updateQuery = {$pull: {tokens: {token: token}}};

    return user.update(updateQuery);
};
// instance methods

// model methods
UserSchema.statics.findByToken = function (token) {
    // this binds to the Model itself
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc345');
    } catch (error) {
        return Promise.reject();
    }

    let query = {_id: decoded._id, 'tokens.token': token, 'tokens.access': 'auth'};
    return User.findOne(query);
};

UserSchema.statics.findByCredentials = function (email, password) {
    // this binds to the Model itself
    let User = this;
    let query = {email};

    return User.findOne(query).then((user) => {
        if (!user) return Promise.reject();

        return bcrypt.compare(password, user.password).then((res) => {
            if(res) return user;

            return Promise.reject();
        });
    });
    
};

// model methods

// mongoose middleware - do stuff before or after updating model
UserSchema.pre('save', function(next){
    let user = this;
    let password = user.password;

    // Hash and salt the password and update user instance
    if (user.isModified('password')) {
        // salt
        bcrypt.genSalt(10, (err, salt) => {
            if(err) return 'Something wrong with salting';
            // hash password and set
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) return 'Something wrong with hashing';
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});



var User = mongoose.model('User', UserSchema);

module.exports = {User};