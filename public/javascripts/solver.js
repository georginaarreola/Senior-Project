$(document).ready(function(){
   //=====Login Form Request=============================================
   $("#queryForm").click(function(){
     var uquery  = $("#query").val();
     var query ={'query': uquery};
     $.ajax({
         type : 'POST',
         url : 'http://159.203.118.48:3000/solver/testsolver',
         data : query,
         success: function(data){
         $("#mainDiv").html(data);
         }
       });
   });
});
