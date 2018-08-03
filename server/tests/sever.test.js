const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo_model');
const {User} = require('./../models/user_model');
const {ObjectID} = require('mongodb');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');

// Clean db before every test case
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a todo',  (done) => {
        var text = 'Test Todos';
        let token = users[0].tokens[0].token;
        request(app)
            .post('/todos')
            .set('x-auth', token)
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end(async (err, res) => {
                if (err) return done(err);

                try {
                    // Check if saved in db
                    let todos = await Todo.find({text});
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('should not create todo without required params', (done) => {
        let token = users[0].tokens[0].token;

        // no assertion about body is needed
        request(app)
            .post('/todos')
            .set('x-auth', token)
            .send({})
            .expect(400)
            .end(async (err) => {
                if (err) return done(err);
                try {
                    // Check if saved in db
                    let todos = await Todo.find();
                    expect(todos.length).toBe(todos.length);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos related to user from db', (done) => {
        let token = users[0].tokens[0].token;
        request(app)
            .get('/todos')
            .set('x-auth', token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todoArr.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {

    it('should return todo doc', (done) => {
        let todoId = todos[0]._id.toHexString();
        let token = users[0].tokens[0].token;

        request(app)
            .get(`/todos/${todoId}`)
            .set('x-auth', token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        let token = users[0].tokens[0].token;

        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid object ids', (done) => {
        let token = users[0].tokens[0].token;

        request(app)
            .get('/todos/123')
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        let todoId = todos[1]._id.toHexString();
        let token = users[0].tokens[0].token;

        request(app)
            .get(`/todos/${todoId}`)
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        let todoId = todos[1]._id.toHexString();
        let token = users[1].tokens[0].token;

        request(app)
            .delete(`/todos/${todoId}`)
            .set('x-auth', token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todoId);
            })
            .end(async (err) => {
                if (err) return done(err);

                try {
                    let todo = await Todo.findById(todoId);
                    expect(todo).toBeFalsy();
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('should not delete a todo owned by other user', (done) => {
        let todoId = todos[0]._id.toHexString();
        let token = users[1].tokens[0].token;

        request(app)
            .delete(`/todos/${todoId}`)
            .set('x-auth', token)
            .expect(404)
            .end(async (err) => {
                if (err) return done(err);

                try {
                    let todo = await Todo.findById(todoId);
                    expect(todo).toBeTruthy();
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });


    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        let token = users[1].tokens[0].token;
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid object ids', (done) => {
        let token = users[1].tokens[0].token;
        request(app)
            .delete('/todos/123')
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update own todo', (done) => {
        let text = 'Todo Update test';
        let todoId = todos[1]._id.toHexString();
        let token = users[1].tokens[0].token;
        let completed = true;

        request(app)
            .patch(`/todos/${todoId}`)
            .set('x-auth', token)
            .send({text, completed})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(completed);
                expect(res.body.todo.completedAt).toBeTruthy();
                // expect(typeof(res.body.todo.completedAt).toBe('number'))
            }).end(done);
    });

    it('should not update other user\'s todo', (done) => {
        let text = 'Todo Update test 2';
        let todoId = todos[0]._id.toHexString();
        let token = users[1].tokens[0].token;
        let completed = true;

        request(app)
            .patch(`/todos/${todoId}`)
            .set('x-auth', token)
            .send({text, completed})
            .expect(404)
            .end(done);
    });

    it('should clear completedAt if todo not completed', (done) => {
        let text = 'Todo Update test 2';
        let todoId = todos[1]._id.toHexString();
        let token = users[1].tokens[0].token;
        let completed = false;

        request(app)
            .patch(`/todos/${todoId}`)
            .set('x-auth', token)
            .send({text, completed})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(completed);
                expect(res.body.todo.completedAt).toBeFalsy();
            }).end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        let token = users[1].tokens[0].token;

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for invalid object ids', (done) => {
        let token = users[1].tokens[0].token;

        request(app)
            .patch('/todos/123')
            .set('x-auth', token)
            .expect(404)
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        let token  = users[0].tokens[0].token;
        let id  = users[0]._id.toHexString();
        let email = users[0].email;

        request(app)
            .get('/users/me')
            .set('x-auth', token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(id);
                expect(res.body.email).toBe(email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create user', (done) => {
        let email = 'example@lala.com';
        let password = 'username';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end(async (err) => {
                if (err) return done(err);

                    try {
                        let user =  await User.findOne({email});
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    } catch (e) {
                        done(e);
                    }
            });
    });
    
    it('should return validation error if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({email: '', password: '23413uio'})
            .expect(400)
            .end(done);
    });

    it('should not create user if already exists', (done) => {
        request(app)
            .post('/users')
            .send({email: users[0].email, password: '23413uio'})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        let email = users[1].email;
        let password = users[1].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end(async (err, res) => {
                try {
                    let user = await User.findByCredentials();

                    // .toMatchObject checks if subset not hard equal
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('should not login user', (done) => {
        let email = users[1].email;
        let password = 'shalala';

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end(async () => {
                try {
                    let user = await User.findByCredentials(email, password);
                    expect(user.tokens.length).toBe(1);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should delete token on logout', (done) => {
        let token = users[0].tokens[0].token;
        let id = users[0]._id;

        request(app)
            .delete('/users/me/token')
            .set('x-auth', token)
            .expect(200)
            .end(async (err) => {
                if (err) return done(err);

                try {
                    let user = await User.findById(id);
                    expect(user.tokens.length).toBe(0);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});