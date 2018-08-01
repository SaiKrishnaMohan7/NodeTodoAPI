require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {ObjectID} = require('./db/mongoose');
const PORT = process.env.PORT;

const {User} = require('./models/user_model');
const {Todo} = require('./models/todo_model');
const {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

// Private route
app.post('/todos', authenticate, (req, res) => {
    let text = req.body.text;
    let userId = req.user._id;
    let email = req.user.email;
    let todoObj  =  new Todo({text, userId, email});
    let query = {text, completed: false, userId};

    Todo.findOne(query).then((todo) => {
        // Duplicity check
        if(todo) return res.send('Todo Already Exists');

        // Save
        todoObj.save().then((doc) => {
            let docClean = _.pick(doc, ['_id', 'text', 'completed', 'completedAt', 'email']);
            res.send(docClean);
        }, (err) => {
            res.status(400).send(err);
        });
    }, (/*err*/) => {
        res.send('Something wrong with redundancy check');
    });

});

// Private route
app.get('/todos', authenticate,(req, res) => {
    let query = {userId: req.user._id};

    Todo.find(query).then((todos) => {
        todos.forEach(todo => {
            let todoClean = _.pick(todo, ['_id', 'text', 'completed', 'completedAt', 'email']);
            let todoArr = [];
            todoArr.push(todoClean);
            res.send({todoArr});
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    let {id, isValid} = idValidator(req.params.id);
    let userId = req.user._id;
    
    // valid id check
    if(!isValid) return res.status(404).send('ID not valid');

    Todo.findOne({id, userId}).then((todo) => {
        // does record exist check
        if (!todo) return res.status(404).send();

        // if exist all is well
        res.status(200).send({todo});

        // res.send(todo); Will work but having an obj makes it flexible
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
    let {id, isValid} = idValidator(req.params.id);

    if(!isValid) return res.status(404).send('Invalid ID');

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) return res.status(404).send('No such todo');

        res.status(200).send({todo});
    }, (/*err*/) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    let {id, isValid} = idValidator(req.params.id);
    let body = _.pick(req.body, ['text', 'completed']);

    if(!isValid) return res.status(404).send('Invalid ID');

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) return res.status(404).send();
        res.status(200).send({todo});
    }).catch((/*err*/) => res.status(404).send());
});

app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => res.status(400).send(err));
});

// Private Route uses authentication middleware
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    let email = _.get(req, 'body.email');
    let password = _.get(req, 'body.password');

    User.findByCredentials(email, password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err => res.status(400).send(err)));
});

app.delete('/users/me/token', authenticate,(req, res) => {
    let user = req.user;
    let token = req.token;

    user.removeToken(token).then(() => {
        res.status(200).send('logged out');
    }).catch((err) => res.status(400).send(err));
});

var idValidator = (id) => {
    let isValid = ObjectID.isValid(id);

    return {id, isValid};
};

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});

module.exports = {app};