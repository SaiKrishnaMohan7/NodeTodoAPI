const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const PORT = process.env.PORT || 3000;

var {User} = require('./models/user_model');
var {Todo} = require('./models/todo_model');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // createItem(req.body.text, null, null, null);
    // console.log(req.body);
    var todo = new Todo({text: req.body.text});

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});

// /**
//  * 
//  * @param {string} text todo text
//  * @param {boolean} completed true/false
//  * @param {number} completedAt when completed
//  * @param {string} email user email
//  */
// var createItem = (text, completed, completedAt, email) => {
//     let objToSave = email ? objectBuilder(null, null, null, email) :
//             objectBuilder(text, completed, completedAt, null);
//     let what = email ? 'User' : 'Todo';

//     objToSave.save().then((doc) => {
//         // doc will have an __v prop, keeps track of model version (any change)
//         console.log(logToConsole(what, doc));
//         // process.exit(0);
//     }, (err) => {
//         console.log(logToConsole(null, null, err));
//     });
// };

// /**
//  * 
//  * @param {string} text todo text
//  * @param {boolean} completed true/false
//  * @param {number} completedAt when completed
//  * @param {string} email true/false
//  * 
//  * @returns {object} object to save
//  */
// var objectBuilder = (text, completed, completedAt, email) => {
//     let obj = email ? new User({email}) : new Todo({text, completed, completedAt});

//     return obj;
// };

// /**
//  * 
//  * @param {string} what what to save
//  * @param {object} item object saved
//  */
// var logToConsole = (what, item, err) => {
//     log = (what && item) ? `Saving ${what}: ` + JSON.stringify(item, undefined, 4) :
//             `Unable to create record ${err}`;
//     return log;
// };
