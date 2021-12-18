const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require("passport");
const users = require("./server/routes/users");
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();
const db = require("./server/config/key").mongoURI;

app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const routes = require('./server/routes/recipeRoutes.js')
// Passport middleware
app.use(passport.initialize());
// Passport config
require("./server/config/passport")(passport);
// Routes
app.use("/", users);
app.use('/', routes);

app.listen(port, ()=> console.log(`Listening to port ${port}`));