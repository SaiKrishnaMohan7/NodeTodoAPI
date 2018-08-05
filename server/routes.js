const _ = require('lodash');

const {ObjectID} = require('./db/mongoose');
const {User} = require('./models/user_model');
const {Todo} = require('./models/todo_model');
const {authenticate} = require('./middleware/authenticate');

module.exports = function(app){
    // https://stackoverflow.com/questions/12695591/node-js-express-js-how-does-app-router-work
    
    /*jshint ignore: start*/
    // Private Route uses authentication middleware
    app.post('/todos', authenticate, async (req, res) => {
        let text = req.body.text;
        let userId = req.user._id;
        let email = req.user.email;
        let todoObj  =  new Todo({text, userId, email});
        let query = {text, completed: false, userId};
        try {
            let todo = await Todo.findOne(query);
            if(todo) return res.send('Todo Already Exists');

            let savedTodo = await todoObj.save();
            let docClean = _.pick(savedTodo, ['_id', 'text', 'completed', 'completedAt', 'email']);
            res.send(docClean);
        } catch (e) {
            res.status(400).send();
        }

    });

    app.get('/todos', authenticate, async (req, res) => {
        let query = {userId: req.user._id};
        try {
            let todos = await Todo.find(query);
            todos.forEach(todo => {
                let todoClean = _.pick(todo, ['_id', 'text', 'completed', 'completedAt', 'email']);
                let todoArr = [];
                todoArr.push(todoClean);
                res.send({todoArr});
            });
        } catch (e) {
            res.status(400).send(e);
        }
    });

    app.get('/todos/:id', authenticate, async (req, res) => {
        let {id, isValid} = idValidator(req.params.id);
        let userId = req.user._id;
        let query = {_id: id, userId};

        // valid id check
        if(!isValid) return res.status(404).send('ID not valid');
        try {
            let todo = await Todo.findOne(query);
            if (!todo) return res.status(404).send();

            res.status(200).send({todo});
        } catch (e) {
            res.status(400).send(e);
        }
    });


    app.delete('/todos/:id', authenticate, async (req, res) => {
        let {id, isValid} = idValidator(req.params.id);
        let userId = req.user._id;
        let query = {_id: id, userId};

        if(!isValid) return res.status(404).send('Invalid ID');
        try {
            let todo = await Todo.findOneAndRemove(query);
            if (!todo) return res.status(404).send('No such todo');

            res.status(200).send({todo});
        } catch (e) {
            res.status(400).send(e);
        }
    });

    app.patch('/todos/:id', authenticate, async (req, res) => {
        let {id, isValid} = idValidator(req.params.id);
        let body = _.pick(req.body, ['text', 'completed']);
        let userId = req.user._id;
        let query = {_id: id, userId};

        if(!isValid) return res.status(404).send('Invalid ID');

        if(_.isBoolean(body.completed) && body.completed){
            body.completedAt = new Date().getTime();
        } else {
            body.completed = false;
            body.completedAt = null;
        }

        try {
            let todo = await Todo.findOneAndUpdate(query, {$set: body}, {new: true});
            if (!todo) return res.status(404).send();
        
            res.status(200).send({todo});
        } catch (e) {
            res.status(404).send(e);
        }
    });

    app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
    });

    app.delete('/users/me/token', authenticate, async (req, res) => {
        let user = req.user;
        let token = req.token;
        try {
            await user.removeToken(token);
            res.status(200).send('logged out');
        } catch (e) {
            res.status(400).send();
        };
    });

    app.post('/users', async (req, res) => {
        let body = _.pick(req.body, ['email', 'password']);
        let user = new User(body);
        try {
            await user.save();
            let token = await user.generateAuthToken();
            res.header('x-auth', token).send(user);
        } catch (e) {
            res.status(400).send(e);
        }
    });

    app.post('/users/login', async (req, res) => {
        try {
            let email = _.get(req, 'body.email');
            let password = _.get(req, 'body.password');
            let user = await User.findByCredentials(email, password);
            let token = await user.generateAuthToken();
            res.header('x-auth', token).send(user);
        } catch (e) {
            res.status(400).send(e)
        }
    });
    /*jshint ignore: end*/

    var idValidator = (id) => {
        let isValid = ObjectID.isValid(id);

        return {id, isValid};
    };
};