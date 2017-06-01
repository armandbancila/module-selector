var data = {
    controller: function ($http, $window, $scope, $cookies) {
        $("title").html("Forgot Password");

        /**
        *Function called when the user wishes to submit their new password. Validates to check if the user has entered matching data. If so the 
        *user is sent a new link to reset their password.
        */
        $("#resetPasswordButton").click(function () {
            var emailAddress = $('#email_address').val();

            if (emailAddress.length == 0) {
                $("#wrong_email_message").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Enter Your Email Address</p>");
            } else {
                $http.post('/request_reset', {
                    "userID": emailAddress
                }).then(function successCallback(response) {
                    $cookies.put("email_cookie", emailAddress);
                    $("#forgot-password-page").html("<p style='width:40%;margin-top:10%' class='alert info'><i style='padding-right:20px' class='glyphicon glyphicon-envelope'></i>Check Your Email Address - " + emailAddress + " For A Link To Reset Your Password</p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'>Back To Sign In</label><script>$('#reloadBtn').click(function(){window.location.href = '/#!/sign-in';});</script>");
                }, function errorCallback(response) {
                    $("#wrong_email_message").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Incorrect Email Address, Please Try Again</p>");
                });
            }
        });
    },
    templateUrl: 'password-components/forgot-password.template.html'
}

angular.module('forgotPassword', ['ngRoute', 'ngCookies']).component('forgotPassword', data)