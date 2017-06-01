'use strict';

var mod = angular.module('moduleSelector', [

 // all dependent angular modules
 'ngRoute',
 'ngCookies',
 'tracker',
 'moduleList',
 'ngAnimate',
 'trackModules',
 'buildCourse',
 'recommendations',
 'editTags',
 'departmentSelector',
 'createTags',
 'signIn',
 'forgotPassword',
 'resetPassword',
 'createAccount',
 'editProfile',
 'createModule',
 'createModerator',
 'createCourse',
 'deactivateAccount',
 'configuration',
 'navbar',
 'editModule',
 'editCourse',
 'feedback',
 'addModuleToCourse',
 'bulkUpload'
])
    .factory('Store', ($http) => {
        // hold a local copy of the state, setting its defaults
        var state = {
            data: {


            }
        };
        // expose basic getter and setter methods
        return {
            get()  {
                    return state.data;
                },
                set(data) {
                    state.data = data;
                }
        };
    })
    .factory('newTracked', ($http) => {
        // hold a local copy of the state, setting its defaults
        var number = {
            data: {

            },

            newMods: {

            }
        };

        number.data = 0;
        number.newMods = [];
        // expose basic getter and setter methods
        return {
            getNumber()  {
                    return number.data;
                },
                setNumber(input) {
                    number.data = input;
                },
                getNewMods() {
                    return number.newMods;
                },
                setNewMods(input) {
                    number.newMods = input;
                }
        };
    })
    .factory('Faculty', ($http) => {
        // hold a local copy of the state, setting its defaults
        var faculty = {
            data: {

            }
        };

        // expose basic getter and setter methods
        return {
            get()  {
                    var output = localStorage.getItem("token")
                    return output;
                },
                set(input) {
                    localStorage.setItem("token", input)
                }
        };
    })
    .run(function ($rootScope) {
        $rootScope.$on('handleEmit', function (event, args) {
            $rootScope.$broadcast('handleBroadcast', args);
        });
    });

mod.controller('SkinController', function PhoneListController($scope, $cookies, $window) {
    var cookie = $cookies.get("theme");
    if (cookie == null) {
        $scope.name = "default";
    } else {
        $scope.name = cookie;
    }
    
    /*cerates and stores a cookie called "theme" with the given value and an expiry date set to 700 days later*/
    var bakeCookie = function (value) {
        var date = new Date();
        date.setDate(date.getDate() + 700);
        $cookies.put("theme", value, {
            "expires": date
        });
    }
    
    //show the color options when the user hovers over the cog icon
    $("#theme-changer").hover(function () {
        $("#options-container").css("display", "block");
    }, function () {
        $("#options-container").css("display", "none");
    });
     
    //change theme to teal color option
    $("#teal-color").click(function () {
        bakeCookie("teal");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });

    //change theme to default color option
    $("#dark-blue-color").click(function () {
        $cookies.remove("theme");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
    
    //change theme to maroon red color option
    $("#red-color").click(function () {
        bakeCookie("red");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
    
    //change theme to green color option
    $("#green-color").click(function () {
        bakeCookie("green");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
    
    //change theme to purple color option
    $("#purple-color").click(function () {
        bakeCookie("purple");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
    
    //change theme to gray color option
    $("#gray-color").click(function () {
        bakeCookie("gray");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
    
    //change theme to baby blue color option
    $("#baby-blue-color").click(function () {
        bakeCookie("babyblue");
        $("#options-container").css("display", "none");
        $window.location.reload();
    });
});
