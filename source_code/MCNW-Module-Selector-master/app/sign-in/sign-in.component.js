angular.module('signIn', ['ngRoute']).component('signIn', {
    templateUrl: 'sign-in/sign-in.template.html',
    controller: ['$http', '$routeParams', '$window', '$cookies', function SignInController($http, $scope, $window, $cookies) {

        var e = function (str) {
            var str2 = "";
            var rnd = ['', '*', '%', '$', '@', '£', '&', '$$', '!', '_', '/', '~'];
            for (var i = str.length - 1; i > 0; --i) {
                str2 += rnd[Math.floor(Math.random() * 11)] + str.charCodeAt(i) + ".";
            }
            str2 += str.charCodeAt(0);
            return str2;
        }

        var d = function (str) {
            var ar = str.replace(/[^\d.]/g, "").split(".");
            var str2 = "";
            for (var i = ar.length - 1; i >= 0; --i) {
                str2 += String.fromCharCode(ar[i]);
            }
            return str2;
        }

        var em = $cookies.get("remeber-dets");
        var mat = $cookies.get("mat");
        if (em != null) {
            $("#email_input").val(em);
        }
        if (mat != null) {
            $("#pwd_input").val(d(mat));
        }
        
        /**
        *Function called when the user wishes to sign in. Validates to check if the user has entered matching data.
        */
        $("#sign_in_btn").click(function () {
            var email = $("#email_input").val();
            var password = $("#pwd_input").val();
            var remember = document.getElementById("cbox").checked == true;

            if (email.length == 0) {
                $("#signin-message-alert").html("<p style='margin-top:30px;' class ='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i>Please Enter Your Email Address </p>");
            } else if (password.length == 0) {
                $("#signin-message-alert").html("<p style='margin-top:30px;' class ='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i>Please Enter Your Password </p>");
            } else {
                $http.post("/login", {
                    "userID": email,
                    "password": password,
                    "remember": true
                }).then(function successCallback(response) {
                    var cookie = $cookies.get("selector_user");
                    var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
                    var fName = cookiedata.FName;
                    var lName = cookiedata.LName
                    if (remember) {
                        var day = new Date();
                        day.setDate(day.getDate() + 7);
                        $cookies.put("remeber-dets", email, {
                            "expires": day
                        });
                        $cookies.put("mat", e(password), {
                            "expires": day
                        });
                    }
                    $window.history.back();
                }, function errorCallback(response) {
                    $("#signin-message-alert").html("<p style='margin-top:30px;' class ='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i>Incorrect Sign In Details, Please Try Again </p>");
                });
            }
        });
 }]
});