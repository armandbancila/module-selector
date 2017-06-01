var data = {
    controller: function ($http, $window, $scope, $cookies, $routeParams) {
        $("title").html("Reset Password");

        /**
        *Function called when the user wishes to submit their new password. Validates to check if the user has entered matching data.
        */
        $("#resetPasswordButton").click(function () {
            var cookie = $cookies.get("email_cookie");
            var id = cookie;
            var token = $routeParams.token;
            var password = $('#password').val();
            var confirmPassword = $('#confirm-password').val();
            console.log(id);
            console.log(token);
            console.log(password);
            if (password.length == 0) {
                $("#reset-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Enter Your New Password</p>");
            } else if (password != confirmPassword) {
                $("#reset-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Passwords Do Not Match, Please Try Again</p>");
            } else {
                $http.post('/reset_password', {
                    "userID": id,
                    "password": confirmPassword,
                    "token": token
                }).then(function successCallback(response) {
                    $cookies.remove("email_cookie");
                    $("#reset-password-span").html("<p style='width:30%;margin-top:10%' class='alert success'> Your Password Has Successfully Been Updated </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Sign In </label><script>$('#reloadBtn').click(function(){window.location.href = '/#!/sign-in';});</script>");
                }, function errorCallback(response) {
                    $("#reset-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Try Again</p>");
                });
            }
        });
    },
    templateUrl: 'password-components/reset-password.template.html'
}

angular.module('resetPassword', ['ngRoute', 'ngCookies']).component('resetPassword', data)