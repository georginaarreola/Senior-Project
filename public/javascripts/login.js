$(document).ready(function(){
   $("#regBtn").click(function(){
       $.ajax({
         type : 'GET',
         url : 'http://159.203.118.48:3000/users/register',
         success: function(data){
           $("#regDiv").html(data);
         }
       });
   });
   $("#loginBtn").click(function(){
       $.ajax({
         type : 'GET',
         url : 'http://159.203.118.48:3000/users/login',
         success: function(data){
           $("#loginDiv").html(data);
         }
       });
   });
   //=====Login Form Request=============================================
   $("#loginForm").click(function(){
     var uname  = $("#uname").val();
     var upass = $("#upass").val();
     var loginData ={'name': uname,'pass':upass};
     $.ajax({
         type : 'POST',
         url : 'http://159.203.118.48:3000/users/authenticate',
         data : loginData,
         success: function(data){
         $("#mainDiv").html(data);
         }
       });
   });
//=====Register Form=============================================
   $("#regForm").click(function(){
     var uname  = $("#uname").val();
     var upass = $("#upass").val();
     var fname = $("#fname").val();
     var lname = $("#lname").val();
     var regData ={'name': uname,'pass':upass, 'fname':fname, 'lname': lname};
       $.ajax({
         type : 'POST',
         url : 'http://159.203.118.48:3000/users/registerToDb',
         data : regData,
         success: function(data){
         $("#mainDiv").html(data);
         }
       });
   });
  });
