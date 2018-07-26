const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo_model');

const todos = [{text: 'Todo x'}, {text: 'Todo Y'}];

// Clean db before every test case
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a todo', (done) => {
        var text = 'Todo test';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if(err) return done(err);
            // Check if saved in db
            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((err) => done(err));
        });
    });

    it('should not create todo without required params', (done) => {
        // no assertion about body is needed
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);

            Todo.find().then((todos) => {
                expect(todos.length).toBe(todos.length);
                done();
            }).catch((err) => done(err));
        });
    });
});

describe('GET /todos', (done) => {
    it('should get all todos from db', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(todos.length);
        })
        .end(done);
    });
});