const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');

require('dotenv').config();

const port = process.env.port || 4000;

//parsing middleware
//parsing application
app.use(bodyParser.urlencoded({extended: false}));

//parse application/json
app.use(bodyParser.json());
app.use(express.static('public'));

//templating engine
app.engine('hbs', exphbs({extname:'.hbs' }));
app.set('view engine','hbs');







const routes = require('./server/routes/user');
app.use('/', routes);

app.listen(port, () =>console.log(`listening at port ${port}`));