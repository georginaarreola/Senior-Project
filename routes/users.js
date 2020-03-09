var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var urlencodedParser = bodyParser.urlencoded({extended:false});
var passport = require('passport');
var session = require('express-session');
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('6UAUHR-KV8WRJAV72');
var bcrypt = require('bcrypt'); 
const saltRounds = 10;



router.get('/', function(req,res){
  console.log(req.user);
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()){
    res.redirect('http://159.203.118.48:3000/users/dashboard');
  }
  res.render('home');
});


router.get('/register',function(req,res){
  res.render('register');
});

router.get('/login',function(req,res){
  res.render('login');
});


// Authenticate User==================================================================
router.post('/login', passport.authenticate(
  'local', {
    successRedirect:'/users/dashboard',
    failureRedirect:'/users/login'
  }));

router.get('/logout', (req, res, next) => {
  req.logout()
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.redirect('/')
  })
})



//stores user in DB================================================================
router.post('/registerToDb',urlencodedParser,function(req,res){
  var obj = JSON.stringify(req.body);

  console.log("Final req Data : "+obj);

  var myPlaintextPassword = req.body.pass;

  var jsonObj = JSON.parse(obj);

  var db = req.db;

  var sessionid =req.sessionID;

  bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    jsonObj.pass = hash;

    //inserts user ito DB
    db.collection("userprofile").insertOne(jsonObj, function(err, res) {
      if (err) throw err;
      console.log("User inserted into DB");
    });

    //finds user in DB to get the mongodb generated ID, which is used to create the session
    db.collection('userprofile').findOne({ name: req.body.name}, function(err, user) { 
      console.log(user._id);
      const user_id = user._id;

      req.login(user_id, function(err){
        if(req.body.type  == 'student'){

          //extracts solver queries from the session to display on dashboard
          db.collection("sessionQueries").find({sessionid: sessionid}).toArray(function(err, result) {
            if (err) throw err;
            res.render('index',{profileData:user, equation:result}); });
        }
        else if(req.body.type  == 'instructor'){

          //extracts classrooms of instructor
          db.collection("classrooms").find({instructorid: user_id}).toArray(function(err, result) {
            if (err) throw err;
            console.log("USER!!");
            console.log(user);
            res.render('instructordashboard',{profileData:user, classrooms:result}); });
        }
      });
    });

  });
});


router.get('/dashboard/studentclassrooms', function(req,res){
  console.log(req.user);
  console.log(req.isAuthenticated());
  var db = req.db;
  var id = new mongo.ObjectID(req.user);

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 
    console.log(user);
    var email = user.name;
    //{students: {$elemMatch: {email}}}

    db.collection('classrooms').find({students:email}).toArray(function(err, results) { 
      if(results===null){
        res.end("error");
      }  
      console.log(email);
      console.log(results);
      res.render('studentclassrooms',{profileData:user, classrooms:results});    

    });

    //res.render('newclassroom',{profileData:user});    
  });
});

//redirects instructor to newclasroom page/form with proile data======================================================
router.get('/dashboard/createclassroom', function(req,res){
  console.log(req.user);
  console.log(req.isAuthenticated());
  var db = req.db;
  var id = new mongo.ObjectID(req.user);

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 
    res.render('newclassroom',{profileData:user});    
  });
});

//IN PROGRESS================================================================
router.post('/dashboard/createassignment', function(req, res, next) {
  var obj = JSON.stringify(req.body);

  console.log("Final req Data : "+obj);

  var jsonObj = JSON.parse(obj);

  console.log("Parsed : "+jsonObj);


  // var onoption = [ 'Off', 'On' ];
  if(jsonObj.solveroption != "Off"){
    jsonObj['solveroption']= 'On';
    //jsonObj.solveroption = 'On';
  }

  if(jsonObj.checkoption != "Off"){
    jsonObj['checkoption']= 'On';

      // jsonObj.put(checkoption, 'On');

    }


    var id = new mongo.ObjectID(req.user);

    var db = req.db;

    db.collection("assignments").insertOne(jsonObj, function(err, res) {
      if (err) throw err;
      console.log("Assignment inserted into DB");
    });


    db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
      if(user===null){
        res.end("error");
      }
      console.log(user);
      console.log(user.type);
      db.collection("classrooms").find({instructorid: id}).toArray(function(err, result) {
        if (err) throw err;
        res.render('instructordashboard',{profileData:user, classrooms:result}); });


    });
  });

//redirects instructor to newassignment page/form with proile data======================================================
router.get('/dashboard/createassignment', function(req,res){
  console.log(req.user);
  console.log(req.isAuthenticated());
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
  var classroom_id = new mongo.ObjectID(req.query.classroom); // get classroom id

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 

    db.collection('classrooms').findOne( {_id: classroom_id}, function(err, classroom) { 
      if(classroom===null){
        res.end("error");
      } 

      db.collection('subjects').findOne( {name: classroom.subject}, function(err, subject) { 

        var topics = subject.topics; 
        res.render('newassignment',{profileData:user, classroom:classroom, topics: topics});  


      });


    });

  });
});

//redirects instructor to newassignment page/form with proile data======================================================
router.get('/dashboard/viewassignment', function(req,res){
  console.log(req.user);
  console.log(req.isAuthenticated());
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
  var assignment_id = new mongo.ObjectID(req.query.assignment); // get classroom id

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 

    db.collection('assignments').findOne( {_id: assignment_id}, function(err, assignment) { 
      if(assignment===null){
        res.end("error");
      } 
      console.log(assignment);
      var classroom_id = new mongo.ObjectID(assignment.classroomid); // get classroom id
      
      var pairs =  [];

      for (var i = 0; i < assignment.questions.length; ++i) {
        var question =assignment.questions[i];
        var answer = assignment.answers[i];
        var pair = {question: question, answer: answer};
        pairs.push(pair); 
      }

      db.collection('classrooms').findOne( {_id: classroom_id}, function(err, classroom) { 
      if(classroom===null){
        res.end("error");

      } 

      var studentdetails = [];
      db.collection('userprofile').find( {"name" : {"$in" : classroom.students}}).toArray(function(err, students) { 
        studentdetails = students;
        var submissions = [];
      db.collection('submissions').find( {assignmentid: req.query.assignment}).toArray(function(err, assignmentsubmissions) { 


      if(assignmentsubmissions===null || assignmentsubmissions.length ===0 ){
        console.log("NULLLL")
        var emails = [];
        var points = [];
        var topicdifficulty = [];

        res.render('assignment',{profileData:user, classroom:classroom, students: classroom.students, assignment:assignment, pairs:pairs, studentdetails:studentdetails, submissions:submissions, emails:emails, points:points, topicdifficulty:topicdifficulty});  

      } else{
        console.log("studentdetails");
        submissions = assignmentsubmissions;

        var emails = [];
        var points = [];

        for (var i = 0; i < assignmentsubmissions.length; ++i) {
          emails.push(assignmentsubmissions[i].email);

          var questiondetails = assignmentsubmissions[i].details;
          console.log("questiondetails" + questiondetails);

          for (var j = 0; j < questiondetails.length; ++j) {

            console.log(JSON.stringify(questiondetails[j]));


            var individualquestion = JSON.stringify(questiondetails[j]);
            individualquestion = JSON.parse(individualquestion);

            if(i === 0){
            points.push(individualquestion.pointearned);}
            else{
              points[j] = points[j] + individualquestion.pointearned;
            }
          }

      }
      var topicpoints = [];
      var topicsarray = assignment.topics;
      var individualtopics = [];
      var topicpotentialpoints = [];
        for (var i = 0; i < topicsarray.length; ++i) {
          if(individualtopics.includes(topicsarray[i]) === false){
            individualtopics.push(topicsarray[i]);
            topicpotentialpoints.push(1);
            topicpoints.push(points[i]);
          }
          else{

            var indexoftopic = individualtopics.indexOf(topicsarray[i]);
            topicpoints[indexoftopic] = topicpoints[indexoftopic] + points[i];
            topicpotentialpoints[indexoftopic] =topicpotentialpoints[indexoftopic] +1;
          }

        }

        console.log(points);
        console.log(topicsarray);
        console.log(individualtopics);
        console.log(topicpoints);
        console.log(topicpotentialpoints);
        var topicdifficulty = [];
        for (var i = 0; i < individualtopics.length; ++i) {
          topicpotentialpoints[i] = topicpotentialpoints[i] * assignmentsubmissions.length;

          topicdifficulty.push({topic: individualtopics[i], pointsearned: topicpoints[i], potentialpoints: topicpotentialpoints[i]});
          }

          console.log(topicdifficulty);





      points = JSON.stringify(points);
      points = JSON.parse(points);

      console.log("POINTS:" + points);

      console.log(emails);
        res.render('assignment',{profileData:user, classroom:classroom, students: classroom.students, assignment:assignment, pairs:pairs, studentdetails:studentdetails, submissions:submissions, emails:emails, points:points, topicdifficulty:topicdifficulty});  
        }
         });

         });

      });


    });

  });
});

//redirects instructor to classroom page with proile, classroom, and assignment data======================================================
//IN PROGRESS: currently it is only able to redirect to first classroom in DB for that specific instructor==============================
router.get('/dashboard/classroom', function(req,res){
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
  var classroom_id = new mongo.ObjectID(req.query.classroom); // get classroom id

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 
    db.collection('classrooms').findOne( {_id: classroom_id}, function(err, classroom) { 
      if(classroom===null){
        res.end("error");
      }
      var students = classroom.students;
      console.log(students);
      db.collection("assignments").find({classroomid: req.query.classroom}).toArray(function(err, assignments) {
        if (err) throw err;
        res.render('classroom',{profileData:user, classroom:classroom, students:classroom.students, assignments: assignments}); 
      });     
    });
  });
});

router.get('/studentclassrooms/view/assignment', function(req,res){
  var db = req.db;
  var id = new mongo.ObjectID(req.user);


  var assignment_id = new mongo.ObjectID(req.query.assignment); // get classroom id
  console.log(assignment_id);

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 
    var email = user.name;

     

    db.collection('submissions').findOne({ assignmentid: req.query.assignment, studentid: req.user}, function(err, submission) { 

      console.log(submission); 

      if(submission===null){
        console.log("No submission");




        db.collection('assignments').findOne( {_id: assignment_id}, function(err, assignment) { 
          if(assignment===null){
            res.end("error");
          } 
          console.log("HERE: assignment");


          console.log(assignment);

          db.collection("subjects").find({}).toArray(function(err, result) {
            console.log("HERE: subjects");


            var topics = [];
            var lessons = [];
            for (var i = 0; i < result.length; ++i) {
              var subjecttopics = result[i].topics;
              var subjectlessons = result[i].lessons;

              for (var k = 0; k < subjecttopics.length; ++k) {
                topics.push(subjecttopics[k]);
              }

              for (var j = 0; j < subjectlessons.length; ++j) {
                lessons.push(subjectlessons[j]);
              }

            }

            var dict = {};
            console.log(topics);
            console.log(lessons);

            topics.forEach((key, i) => dict[key] = lessons[i]);

            console.log("TOPICS LESSONS DICTIONARY: ")
            console.log(dict);

            var currenttopics = assignment.topics;
            var pairs =  [];

            for (var i = 0; i < currenttopics.length; ++i) {
              var currlesson = dict[currenttopics[i]];
              var currquestion =assignment.questions[i];
              var curranswer = assignment.answers[i];
              var pair = {lesson: currlesson, question: currquestion, answer: curranswer};
              pairs.push(pair); 
            }

            console.log("ASSIGNMENT LESSONS: ")
            console.log(pairs);


            var questions = assignment.questions;

            // file = 'takeassignment';
            // date = {profileData:user, assignment: assignment, questions:questions, pairs: pairs};

            res.render('takeassignment',{profileData:user, assignment: assignment, questions:questions, pairs: pairs}); 
          });



        });
      }

      else{
      res.render('submittedassignment',{profileData:user, questiondetails:submission.details, submission: submission}); 

      }
      
      

    });
  });
});

router.post('/dashboard/submitassignment',urlencodedParser,function(req,res){

  var userid = new mongo.ObjectID(req.user);
  var assignmentid =  new mongo.ObjectID(req.body.assignmentid);
  var studentanswers = req.body.studentanswers;
  var correctanswers = req.body.correctanswers;
  var questions = req.body.questions;
  var assignmentname = req.body.assignmentname;
  var instructions = req.body.instructions;
    var name = req.body.name;
  var email = req.body.email;


  var pointsearned = 0;
  var possiblepoints = correctanswers.length;
  var details = [];

  for(var i = 0; i < studentanswers.length; i++){
    var point = 0;
    if(studentanswers[i] == correctanswers[i]){
      pointsearned++;
      point = 1;
    }

    var questiondetails = {question: questions[i], correctanswer: correctanswers[i], studentanswer: studentanswers[i], pointearned: point};

    details.push(questiondetails);

  }


  var myobj = { studentid: req.user, name: name, email:email, assignmentid: req.body.assignmentid, assignmentname: assignmentname, instructions: instructions, pointsearned: pointsearned, possiblepoints: possiblepoints, details:details};

  var db = req.db;

  db.collection("submissions").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("Assignment submission inserted into DB");
  });



  db.collection('userprofile').findOne({ _id: userid}, function(err, user) { 
    console.log(user._id);
    res.render('submittedassignment',{profileData:user, questiondetails:details, submission: myobj});

  });
});





router.get('/studentclassrooms/view', function(req,res){
  var db = req.db;
  var id = new mongo.ObjectID(req.user);

  var classroom_id = new mongo.ObjectID(req.query.classroom); // get classroom id
  console.log(classroom_id);



  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    } 
    var email = user.name;

    //db.collection('classrooms').findOne( {'students':[email]}, function(err, classroom) { 
      db.collection('classrooms').findOne( {_id: classroom_id}, function(err, classroom) { 

        if(classroom===null){
          res.end("error");
        } 
        db.collection("assignments").find({classroomid: req.query.classroom}).toArray(function(err, assignments) {
          if (err) throw err;
          res.render('studentclassroom',{profileData:user, classroom:classroom, assignments: assignments}); 
        });     
      });
    });
});


router.get('/dashboard', function(req,res){
  console.log(req.user);
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
  var sessionid =req.sessionID;

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    }
    console.log(user);
    console.log(user.type);
    if(user.type == 'student'){
      db.collection("sessionQueries").find({sessionid: sessionid}).toArray(function(err, result) {
        if (err) throw err;
        res.render('index',{profileData:user, equation:result}); });
    // res.render('index',{profileData:user, result: ' ', query: '', equals: ''});
  }
  else if(user.type == 'instructor'){   
   db.collection("classrooms").find({instructorid: id}).toArray(function(err, result) {
    if (err) throw err;
    res.render('instructordashboard',{profileData:user, classrooms:result}); });
 }

});
  console.log(req.user);
 // res.end('pretend this is the dashboard');
});

//register to DB================================================================
router.post('/createclassroom',urlencodedParser,function(req,res){
  var classroomname = req.body.name;
  var subject = req.body.subject;
  var students = req.body.example_emailB;
  var instructorid = new mongo.ObjectID(req.user);
  var db = req.db;
  var sessionid =req.sessionID;

  console.log(students);
  console.log(JSON.parse(students));

  console.log("Final req Data : "+ JSON.stringify(myobj));



  var myobj = { instructorid: instructorid, classroomname: classroomname, subject: subject, students: JSON.parse(students) };

  db.collection("classrooms").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("Classroom inserted into DB");
  });

  db.collection('userprofile').findOne({ _id: instructorid}, function(err, user) { 
    console.log(user._id);
    db.collection("classrooms").find({instructorid: instructorid}).toArray(function(err, result) {
      if (err) throw err;
      res.render('instructordashboard',{profileData:user, classrooms:result}); });
  });
});

router.get('/saveproblem', function(req,res){
  console.log(req.user);
  var db = req.db;
  var id = new mongo.ObjectID(req.user);
  var sessionid =req.sessionID;

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    }

    db.collection("sessionQueries").find({sessionid: sessionid}).toArray(function(err, results) {
      if (err) throw err;
      var problem = results[results.length-1];
      console.log(problem);
      var query = problem.uquery;
      var solution = problem.result;
      var myobj = { userid: id, query: query,  solution: solution};
      console.log("Final  Data : "+ JSON.stringify(myobj));

      db.collection("savedproblems").insertOne(myobj, function(err, res) {
       if (err) throw err;
       console.log("Solution inserted into DB");
     });
      res.render('index',{profileData:user, equation:results}); });
    // res.render('index',{profileData:user, result: ' ', query: '', equals: ''});
  });
});

router.get('/savedproblems', function(req,res){
  console.log(req.user);
  var db = req.db;
  var id = new mongo.ObjectID(req.user);

  db.collection('userprofile').findOne({ _id: id}, function(err, user) { 
    if(user===null){
      res.end("error");
    }

    db.collection("savedproblems").find({userid: id}).toArray(function(err, results) {
      if (err) throw err;
      console.log(results);
      res.render('savedsolutions',{profileData:user, savedproblems:results}); });
    // res.render('index',{profileData:user, result: ' ', query: '', equals: ''});
  });
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
