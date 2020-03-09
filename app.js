/**
 * File: app.js
 * Author: Geo Arreola
 * Last Edit Date: 9-18-19
 * Description: Main script for configuring and executing Express API
 */

// Import and configure dependencies
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//import and initiate wolfram class
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('6UAUHR-KV8WRJAV72');

//Authentication
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
var bcrypt = require('bcrypt');

//Define routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var solverRouter = require('./routes/wolframsolver')


//Define and initialize mongoose connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/solver', {useNewUrlParser: true});
var db = mongoose.connection;


//Initialize Express app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//Define express settings, and mixins
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'geo is amazing',
  //store: new MongoStore(options)
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// Make our db accessible to our router
app.use(function(req,res,next){
req.db = db;
next();
});


app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});


//Register routers with Express
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/solver', solverRouter);

passport.use(new LocalStrategy({
    usernameField: 'uname',
    passwordField: 'upass'
  },function(username, password, done) {
  	console.log(username);
  	console.log(password);
    db.collection('userprofile').findOne({ name: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.compare(password, user.pass, function(err, result){
        console.log(password);
        console.log(user.pass);
        if(result){
          console.log(user._id);
          return done(null, user._id);
        }
        else{
          console.log("Password wrong");
          return done(null, false, { message: 'Incorrect password.' });
        }
        }); 
    });
  }
));


        

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development	
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

//Export the app to parent module (www)
module.exports = app;
