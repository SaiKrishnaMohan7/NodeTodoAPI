const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo_model');
const {User} = require('./../../models/user_model');
const {mongoose} = require('./../../db/mongoose');

const SECRET = process.env.JWT_SECRET;
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'sai@abc.com',
    password: 'user1Pass',
    tokens: [
        {
            access: 'auth',
            token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, SECRET).toString()
        }
    ]
}, {
    _id: userTwoId,
    email: 'sai@rst.com',
    password: 'user2Pass',
    tokens: [
        {
            access: 'auth',
            token: jwt.sign({_id: userTwoId.toHexString(), access: 'auth'}, SECRET).toString()
        }
    ]
}];
const todos = [{
            _id: new ObjectID(),
            text: 'Todo x',
            email: users[0].email,
            userId: userOneId
        }, {
            _id: new ObjectID(),
            text: 'Todo Y',
            completed: true,
            email: users[1].email,
            completedAt: 123456,
            userId: userTwoId
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

const purgeConnection = () => {
    return mongoose.disconnect();
};

module.exports= {todos, users, populateTodos, populateUsers, purgeConnection};