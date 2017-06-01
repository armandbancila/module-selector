var content = {
    controller: function ($http, $window, $cookies) {
        $("title").html("Create Account");
        $("#acc_btn").html("Create Account");
        
        /**
        *This functions is called when a user clicks on the create account submission button. The function checks for 
        *validation rules that the user may have violated and displays an error message depending on which rule isn't
        *obeyed. Once all checks are passed the function then posts the data to the database.
        */
        $("#acc_btn").click(function () {
            var f_name = $("#f_name_input").val();
            var l_name = $("#l_name_input").val();
            var email = $("#email_input").val();
            var email_pattern = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
            var patt = new RegExp(email_pattern);
            var password = $("#pwd_input").val();
            var pass_confirmed = $("#pwd_confirm_input").val();
            if (f_name.length == 0) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter Your Forename </p>");
            } else if (l_name.length == 0) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter Your Surname </p>");
            } else if (email.length == 0) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter Your Email Address </p>");
            } else if (!patt.test(email)) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter A Valid Email Address </p>");
            } else if (password.length == 0) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter A Password  </p>");
            } else if (password.length < 8) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Please Enter A Password Which Is At Least 8 Characters Long </p>");
            } else if (password != pass_confirmed) {
                $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Passwords Do Not Match, Please Try Again </p>");
            } else {
                $http.post("/signup", {
                    'userID': email,
                    'password': password,
                    'fName': f_name,
                    'lName': l_name,
                }).then(function successCallback(response) {
                    $cookies.put("firstTime", "chocolate-chip-cookie");
                    $window.location.href = "/#!/index";
                }, function errorCallback(response) {
                    $("#register-message-alert").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'> </i> Your Email Address Exists In Our System, Please Use A Different Email Address </p>");
                });
            }
        });
    },
    templateUrl: "account-form/account-form.template.html"
}

angular.module('createAccount', ['ngRoute', 'ngCookies']).component('accountForm', content);