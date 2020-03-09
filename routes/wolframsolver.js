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


//change here
router.get('/', function(req,res){
  res.render('queryform');
});

router.post('/testsolver',urlencodedParser,function(req,res){
  var uquery = req.body.query;
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
    var sessionid =req.sessionID;

console.log(req.sessionID);
  // waApi.getFull({input: uquery, output: 'string'}).then(console.log).catch(console.error);
  // waApi.getSpoken({input: uquery, output: 'string'}).then(console.log).catch(console.error);
  waApi.getShort({input: uquery, output: 'string'}).then(console.log).catch(console.error);

  let QueryAnswer = function(uquery) {
    return waApi.getShort({input: uquery, output: 'string'}).then(actionText => {return actionText}).catch(console.error);
  }
  let answer = QueryAnswer(uquery);
  answer.then(function(result){
    console.log('ANSWER:',result);

    var myobj = { sessionid: sessionid, uquery: uquery,  result: result};

    db.collection("sessionQueries").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("query inserted into DB");
    });

    db.collection('userprofile').findOne({ _id: id}, function(err, user){ 
      if(user===null){
        res.end("error");
      };
      db.collection("sessionQueries").find({sessionid: sessionid}).toArray(function(err, result) {
      if (err) throw err;
     console.log(result);
      res.render('index',{profileData:user, equation:result}); });
      //res.render('index',{profileData:user, result : result, query:uquery, equals: '   =   ' });
    });
  }).catch(console.error);

});

module.exports = router;
