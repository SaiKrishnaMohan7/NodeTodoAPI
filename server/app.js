require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
var app = express();

const routes = require('./routes');

app.use(bodyParser.json());
routes(app);

module.exports = {app};
