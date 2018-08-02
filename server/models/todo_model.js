const mongoose = require('mongoose');

var schemaObject = {
    text: {type: String, required: true, minlength: 1},
    completed: {type: Boolean, default: false},
    completedAt: {type: Number, default: null},
    email: {type: String},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true} 
};


var TodoSchema = new mongoose.Schema(schemaObject);
var Todo = mongoose.model('Todo', TodoSchema);

/**
 * @override
 */
TodoSchema.methods.toJSON = function () {
    let todo = this;
    let todoObj = todo.toObject();

    // Only return some details
    return _.pick(todoObj, ['text', 'completed', 'completedAt', 'email']);
};

module.exports = {Todo};