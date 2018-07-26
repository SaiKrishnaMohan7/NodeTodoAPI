var mongoose = require('Mongoose');
var url = process.env.DB_URL || 'mongodb://localhost:27017/TodoApp';

// Telling mongoose which Promise lib to use
mongoose.Promise = global.Promise;
mongoose.connect(url, {useNewUrlParser: true});

var todoSchema = {
    text: {type: String, required: true, minlength: 1},
    completed: {type: Boolean, default: false},
    completedAt: {type: Number, default: null}
};

var userSchema = {
    email: {type: String, required: true, minlength: 1, trim: true}
};

// Returns constructor
var Todo = mongoose.model('Todo', todoSchema);
var User = mongoose.model('User', userSchema);

/**
 * 
 * @param {string} text todo text
 * @param {boolean} completed true/false
 * @param {number} completedAt when completed
 * @param {string} email user email
 */
var createItem = (text, completed, completedAt, email) => {
    let objToSave = email ? buildOpts(null, null, null, email) :
            buildOpts(text, completed, completedAt, null);
    let what = email ? 'User' : 'Todo';

    objToSave.save().then((doc) => {
        // doc will have an __v prop, keeps track of model version (any change)
        console.log(logToConsole(what, doc));
        process.exit(0);
    }, (err) => {
        console.log(logToConsole());
    });
};

/**
 * 
 * @param {string} text todo text
 * @param {boolean} completed true/false
 * @param {number} completedAt when completed
 * @param {string} email true/false
 * 
 * @returns {object} object to save
 */
var buildOpts = (text, completed, completedAt, email) => {
    let obj = email ? new User({email}) : new Todo({text, completed, completedAt});

    return obj;
};

/**
 * 
 * @param {string} what what to save
 * @param {object} item object saved
 */
var logToConsole = (what, item) => {
    log = (what && item) ? `Saving ${what}: ` + JSON.stringify(item, undefined, 4) :
            'Unable to create record';
    return log;
};

createItem(null, null, null, 'sai@xyz.com');
