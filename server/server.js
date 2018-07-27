const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
var {ObjectID} = require('mongodb');
const PORT = process.env.PORT || 3000;

var {User} = require('./models/user_model');
var {Todo} = require('./models/todo_model');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo  =  new Todo({text: req.body.text});

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

// Should be get by text, also eleieminate copies
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    var isValid = ObjectID.isValid(id);

    if(!isValid) return res.status(404).send('ID not valid');

    Todo.findById(id).then((todo) => {
        if (!todo) return res.status(404).send();
        res.status(200).send(todo);
    }, (err) => {
        // we don't send err, it maay have private info
        res.status(400).send();
    });
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});

module.exports = {app};