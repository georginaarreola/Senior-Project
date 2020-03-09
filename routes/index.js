
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var urlencodedParser = bodyParser.urlencoded({extended:false});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('6UAUHR-KV8WRJAV72');
var bcrypt = require('bcrypt');
const saltRounds = 10;

/* GET home page 'index.html' */
router.get('/', function(req, res, next) {
  console.log(req.user);
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()){
    res.redirect('http://159.203.118.48:3000/users/dashboard');
  }
  res.render('home');

});


router.get('/testcom', function(req, res, next) {

	let test = [
        {
            name: 'one',
        },
        {
            name: 'two',
            
        },
        {
            name: 'three!',
            
        }
    ]
  res.render('testcom', { test: test });
});

router.post('/testcomback', function(req, res, next) {
  console.log(req.body);
  res.render('home');
});
router.get('/testcomback', function(req, res, next) {
  console.log(req.body.classroom);
  res.render('home');
});


module.exports = router;
