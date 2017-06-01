var content = {

 controller: function($http, $window, $scope, $cookies) {

  /* $scope.logged_in;
    var cookie = $cookies.get("selector_user");
    if (cookie != undefined) {
        try{
        var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
         $scope.logged_in = cookiedata; 
        }
        catch(err){
            console.log("unsuccessful parsing")
            
        }
    }else{ */

  $("#edit-names-span").click(function() {
   var icon = $("#names-icon");
   if (icon.attr("class") == "glyphicon glyphicon-minus") {
    icon.attr("class", "glyphicon glyphicon-plus");
   } else {
    icon.attr("class", "glyphicon glyphicon-minus")
   }

  });

  $("#update-pwd-span").click(function() {
   var icon = $("#pass-icon");
   if (icon.attr("class") == "glyphicon glyphicon-minus") {
    icon.attr("class", "glyphicon glyphicon-plus");
   } else {
    icon.attr("class", "glyphicon glyphicon-minus")
   }

  });

  $("#edit-names-span").click(function() {
   if ($("#separator1").css("display") == "none") {
    $("#separator1").css("display", "block");
   } else {
    $("#separator1").css("display", "none");
   }

  });

  $("#update-pwd-span").click(function() {
   if ($("#separator2").css("display") == "none") {
    $("#separator2").css("display", "block");
   } else {
    $("#separator2").css("display", "none");
   }

  });

  $("title").html("Edit Profile");
  $("#separator1").css("display", "block");
  $("#separator2").css("display", "none");
  $("#acc_btn").html('Change Password');
  $("#email_input").prop('disabled', true);

  $http.get('/logged_in').then(function successCallback(response) {
   $scope.logged_in = response.data;
   if ($scope.logged_in != null) {
    if ($scope.logged_in.FName != undefined) {
     $scope.email_addr = $scope.logged_in.UserID;
     $("#f_name_input").val($scope.logged_in.FName);
     $("#l_name_input").val($scope.logged_in.LName);
     $("#email_input").val($scope.logged_in.UserID);
    } else {
     $("#edit_profile_span").html("<p style='width:30%;margin-top:5%' class='alert info'> You need to be logged in to edit your profile. </p><br/> <label style='width:20% !important' class='btn submit_req_btn' id='reloadBtn'> Sign In </label><script>$('#reloadBtn').click(function(){window.location.href = '/#!/sign-in';});</script>");
    }
   } else {

    $("#edit_profile_span").html("<p style='width:30%;margin-top:5%' class='alert info'> You need to be logged in to edit your profile. </p><br/> <label style='width:20% !important' class='btn submit_req_btn' id='reloadBtn'> Sign In </label><script>$('#reloadBtn').click(function(){window.location.href = '/#!/sign-in';});</script>");
   }
  }, function errorCallback() {

  });
  //} 


 /* redirects to the first previously accessed page */
  $scope.back = function() {
   $window.history.back();
  }

  $("#save_prof_btn").click(function() {
   var email = $("#email_input").val();
   var forename = $("#f_name_input").val();
   var surname = $("#l_name_input").val();

   if (forename.length == 0) {
    $("#update_name_alert").html("<p class='alert' style='margin-bottom:20px'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>Please Enter Your Forename</p>");
   } else if (surname.length == 0) {
    $("#update_name_alert").html("<p class='alert' style='margin-bottom:20px'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>Please Enter Your Surname</p>");
   } else {
    $http.put("/api/users/" + email, {
     "userID": email,
     "fName": forename,
     "lName": surname
    }).then(function successCallback(response) {
     $http.get('/logged_in').success(function(){
					$("#edit_profile_span").html("<p style='width:30%;margin-top:15%' class='alert success'> Names Successfully Updated To " + forename + " " + surname + ". Refresh The Page To See The Changes.</p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Refresh </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");
			});
    }, function errorCallback(response) {
     $("#update_name_alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>Something Went Wrong...</p>");
    });
   }

  });

  $("#pass_btn").click(function() {
   var old_pwd = $("#old-pwd-field").val();
   var new_pwd = $("#pwd_input").val();
   var new_pwd_conf = $("#pwd_confirm_input").val();
   var a = new_pwd == new_pwd_conf;
   var b = new_pwd.length < 8;
   var message = "";
   if (!a) {
    message += " Your New Passwords Have To Match.";
   }
   if (b) {
    message += " Your New Password Must Be At Least 8 Characters Long.";
   }

   $http.post("/login", {
    "userID": $scope.email_addr,
    "password": old_pwd,
    "remember": true
   }).then(function successCallback(response) {
     if (message == "") {
      $http.post("/change_password", {
       "userID": $scope.email_addr,
       "password": new_pwd
      }).then(function successCallback(response) {
       $("#edit_profile_span").html("<p style='width:25%;margin-top:15%' class='alert success'> Password Successfully Updated </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Back To Edit Profile </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");

      }, function errorCallback(response) {
       $("#update_password_alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>Please Try Again</p>");
      });
     } else {

      $("#update_password_alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>" + message + " Please Try Again</p>");
     }
    },
    function errorCallback(response) {
     $("#update_password_alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i>The Old Password You Have Entered Is Incorrect." + message + " Please Try Again</p>");
    });
  });
 },
 templateUrl: "account-form/edit-form.template.html"
}

angular.module('editProfile', ['ngRoute', 'ngCookies']).component('editProfile', content);
