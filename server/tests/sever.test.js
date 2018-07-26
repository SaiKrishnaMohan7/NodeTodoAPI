const expect = require('expect');
const request = require('supertest');

const {propertyName} = require('./../server');
const {Todo} = require('./../todo');

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

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((err) => {done(err);});
        });

    });
});