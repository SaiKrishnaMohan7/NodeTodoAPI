require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
var app = express();

const routes = require('./routes');

app.use(bodyParser.json());
app.use(helmet());
routes(app);

module.exports = {app};
