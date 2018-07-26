const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
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
        res.send(err);
    });
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});

module.exports = {app};