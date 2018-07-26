const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user_model');
const {Todo} = require('./models/user_model');


// Returns constructor



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
        console.log(logToConsole(null, null, err));
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
var logToConsole = (what, item, err) => {
    log = (what && item) ? `Saving ${what}: ` + JSON.stringify(item, undefined, 4) :
            `Unable to create record ${err}`;
    return log;
};

createItem(null, null, null, 'sai@xyz.com');
