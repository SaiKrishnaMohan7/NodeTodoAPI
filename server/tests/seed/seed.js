const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('./../../models/todo_model');
const {User} = require('./../../models/user_model');

const todos = [{
    _id: new ObjectID(),
    text: 'Todo x'
}, {
    _id: new ObjectID(),
    text: 'Todo Y',
    completed: true,
    completedAt: 123456
}];
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: new ObjectID(),
    email: 'sai@abc.com',
    password: 'user1Pass',
    tokens: [
        {
            access: 'auth',
            token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'abc345').toString()
        }
    ]
}, {
    _id: userTwoId,
    email: 'sai@abc.com',
    password: 'user2Pass'
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports= {todos, users, populateTodos, populateUsers};