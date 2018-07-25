var mongoose = require('Mongoose');
var url = process.env.DB_URL || 'mongodb://localhost:27017/TodoApp';

// Telling mongoose which Promise lib to use
mongoose.Promise = global.Promise;
mongoose.connect(url);

var todoSchema = {
    text: {type: String},
    completed: {type: Boolean},
    completedAt: {type: Number}
};
// Returns constructor
var Todo = mongoose.model('Todo', todoSchema);

/**
 * 
 * @param {object} todoOpts an object with todo props
 * 
 * @returns {undefined}
 */
var createTodo = (text, completed, completedAt) => {
    let todoObj = buildOpts(text, completed, completedAt);

    todoObj.save().then((doc) => {
        // doc will have an __v prop, keeps track of model version (any change)
        console.log(JSON.stringify(doc, undefined, 4));
    }, (err) => {
        console.log('Unable to create record');
    });
};

/**
 * 
 * @param {string} text todo text
 * @param {boolean} completed true/false
 * 
 * @returns {object}  todo creation obj
 */
var buildOpts = (text, completed, completedAt) => {
    return new Todo({text, completed, completedAt});
};

createTodo('Drink Water', false);