angular.
module('navbar', ['ngRoute', 'ngCookies']).
component('navbar', {
    templateUrl: 'navbar/navbar.template.html',
    controller: function NavbarController(newTracked, $http, $scope, $window, $cookies) {
        var self = this;

        this.newTracks = newTracked.getNumber();

        $scope.$on('handleBroadcast', function (event, args) {
            self.newTracks = args.number;
        });
        /**
        *Flag indicates whether mod options should be shown
        */
        $scope.isMod = false;
        /**
        *Flag indicates whether admin options should be shown
        */
        $scope.isAdmin = false;
        /**
        *Flag indicates whether profile/account options should be shown
        */
        $scope.loggedIn = false;
        var cookie = $cookies.get("selector_user");
        if (cookie != undefined) {
            var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
            var fName = cookiedata.FName;
            if (fName != undefined) {
                $scope.loggedIn = true;
                var accessGroup = cookiedata.AccessGroup;
                if (accessGroup === 0) {
                    $scope.isAdmin = true;
                }
                if (accessGroup === 0 || accessGroup === 1) {
                    $scope.isMod = true;
                }
                var lName = cookiedata.LName
                $scope.greeting = fName + " " + lName;
                $scope.loggedIn = true;
            } else {
                $http.get("/logged_in").then(function successCallback(response) {
                    if (response.data.AccessGroup === 0 || response.data.AccessGroup === 1) {
                        $scope.isMod = true;
                    }
                    if (response.data.AccessGroup === 0) {
                        $scope.isAdmin = true;
                    }
                    if (response.data.FName != undefined) {
                        $scope.greeting = response.data.FName + " " + response.data.LName;
                        $scope.loggedIn = true;
                    }
                }, function errorCallback(response) {});
            }
        }

        /**
        *Removes the cookie with the session for this user from the browser and ensures that the user/admin options disappear from the navbar by setting *the flags to false
        */
        $scope.logOut = function () {
             $http.get("/logout").success(function(){
							$scope.isMod = false;
							$scope.isAdmin = false;
							$scope.loggedIn = false;
							$window.location.href = "/#!/department-selector";
						});
        }
    }
});