var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("solver");
  dbo.collection("classrooms").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });

    // dbo.collection('classrooms').find( { "students": {"$in" : ["earreola@stedwards.edu"]} }, function(err, results) { 
    // if(results===null){
    //   res.end("error");
    // }  
    // console.log(results);
    //  db.close();
    // });
 });