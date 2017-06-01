angular.
module('deactivateAccount', ['ngRoute']).
component('deactivateAccount', {
    templateUrl: 'deactivate-account/deactivate-account.template.html',
    controller: function DeactivateAccountController($http, $scope, $window) {
        $("title").html("Deactivate Account");

        /** 
         *As star icons are displayed right to left, this function converts their id number to the correct rating that a user intended to leave.
         *num=1,return 5; num=2, return 4; num=3, return 3; num=4, return 2; num=1, return 1; num=anything else, return 0.
         */
        var getCorrectRating = function (num) {
            var nums = [5, 4, 3, 2, 1];
            for (var i = 1; i <= nums.length; ++i) {
                if (num == i) {
                    return nums[i - 1];
                }
            }
            return 0;
        }

        /** 
         *Usefulness rating row. 
         */
        $scope.usefulness_rating = 0;
        var bgColor = $("body").css("background-color");
        var usefulness = [$("#usf1"), $("#usf2"), $("#usf3"), $("#usf4"), $("#usf5")];
        for (var i = 0; i < 5; i++) {
            usefulness[i].click(function () {
                var id = $(this).attr("id");
                var index = parseInt(id.charAt(id.length - 1));
                $scope.usefulness_rating = getCorrectRating(index);

                for (var j = 4; j >= 0; --j) {
                    if (j >= index - 1) {
                        usefulness[j].css("color", "orange");
                    } else {
                        usefulness[j].css("color", bgColor);
                    }
                }
            });
        }

        /** 
         *Usability rating row 
         */
        $scope.usability_rating = 0;
        var usability = [$("#usab1"), $("#usab2"), $("#usab3"), $("#usab4"), $("#usab5")];
        for (var i = 0; i < 5; i++) {
            usability[i].click(function () {
                var id = $(this).attr("id");
                var index = parseInt(id.charAt(id.length - 1));
                $scope.usability_rating = getCorrectRating(index);

                for (var j = 4; j >= 0; --j) {
                    if (j >= index - 1) {
                        usability[j].css("color", "orange");
                    } else {
                        usability[j].css("color", bgColor);
                    }
                }
            });
        }

        /** 
         *Informativeness rating row. 
         */
        $scope.informativeness_rating = 0;
        var informativeness = [$("#informative1"), $("#informative2"), $("#informative3"), $("#informative4"), $("#informative5")];
        for (var i = 0; i < 5; i++) {
            informativeness[i].click(function () {
                var id = $(this).attr("id");
                var index = parseInt(id.charAt(id.length - 1));
                $scope.informativeness_rating = getCorrectRating(index);

                for (var j = 4; j >= 0; --j) {
                    if (j >= index - 1) {
                        informativeness[j].css("color", "orange");
                    } else {
                        informativeness[j].css("color", bgColor);
                    }
                }
            });
        }


        /** 
         *Security rating row 
         */
        $scope.security_rating = 0;
        var security = [$("#security1"), $("#security2"), $("#security3"), $("#security4"), $("#security5")];
        for (var i = 0; i < 5; i++) {
            security[i].click(function () {
                var id = $(this).attr("id");
                var index = parseInt(id.charAt(id.length - 1));
                $scope.security_rating = getCorrectRating(index);

                for (var j = 4; j >= 0; --j) {
                    if (j >= index - 1) {
                        security[j].css("color", "orange");
                    } else {
                        security[j].css("color", bgColor);
                    }
                }
            });
        }

        /** 
         *Accessibility rating row 
         */
        $scope.accessibility_rating = 0;
        var accessibility = [$("#accesibility1"), $("#accesibility2"), $("#accesibility3"), $("#accesibility4"), $("#accesibility5")];
        for (var i = 0; i < 5; i++) {
            accessibility[i].click(function () {
                var id = $(this).attr("id");
                var index = parseInt(id.charAt(id.length - 1));
                $scope.accessibility_rating = getCorrectRating(index);

                for (var j = 4; j >= 0; --j) {
                    if (j >= index - 1) {
                        accessibility[j].css("color", "orange");
                    } else {
                        accessibility[j].css("color", bgColor);
                    }
                }
            });
        }

        /**
         *Called when the user wishes to deactivate their account. Function fills in information which the user didnt leave to make feedback more uniform.
         */
        $("#deactivate_btn").click(function () {
            $http.get("/logged_in").then(function successCallBack(response) {
                var id = response.data.UserID;
                var password = $("#pwd-input-delete").val();

                //             $http.post('/login', {'userID': id, 'password':password}).then(function successCallBack(response){
                //$http.get("/logout");
                $http.delete("/api/users/" + id).then(
                    function successCallBack(response) {
                        var reasons = $("#select_year option:selected").text();
                        if (reasons.includes("Reason For Leaving")) {
                            reasons = "No Reason Specified";
                        }
                        var comment = $("#description_box2").val();
                        $http.post("/api/users/feedback", {
                                "usefulness": $scope.usefulness_rating,
                                "usability": $scope.usability_rating,
                                "informative": $scope.informativeness_rating,
                                "security": $scope.security_rating,
                                "accessibility": $scope.accessibility_rating,
                                "reasons": reasons,
                                "comments": comment
                            })
                            .then(function scuccessCallBack(response) {

                            }, function errorCallBack(response) {

                            });

                        alert("Your Account Has Been Deleted");
                         $http.get("/logout").success(function(){
													$scope.isMod = false;
													$scope.isAdmin = false;
													$scope.loggedIn = false;
													$window.location.href = "/#!/department-selector";
												});

                    },
                    function errorCallBack(response) {
                        alert("Please Try Again");
                    });
                /*
                                }, function errorCallBack(response){
                                    alert("Incorrect pasword.");
                                });
                */
            }, function errorCallBack(response) {
                alert("You Must Be Signed In To Delete Your Account");
            });
        })
    }
});