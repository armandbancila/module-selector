angular.
module('recommendations').
component('recommendations', {
    templateUrl: 'recommendations/recommendations.template.html',
    controller: function RecommendationsController($cookies, $uibModal, newTracked, $scope, $http, Store) {

        var self = this;

        var cookie = $cookies.get("selector_user");
        if (cookie != undefined) {
            var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
            if (cookiedata != null) {
                if (cookiedata.FName != undefined) {
                    self.user = cookiedata.UserID;
                }
            }
        } else {
            $http.get('/logged_in').then(function successCallback(response) {
                self.user = response.data.UserID;

            }, function errorCallback() {


            });
        }
        /**
         *Opens modal window
         */
        $scope.open = function ($code, $name, $description, $cw, $credits) {
            var exam = 100 - $cw;
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'modal-instance/modal-instance.template.html',
                scope: $scope
            });
            /**
             *Closes modal window
             */
            $scope.close = function () {
                $scope.$modalInstance.close();
            };

            $scope.code = $code;
            $scope.name = $name;
            $scope.description = $description;
            $scope.cw = $cw;
            $scope.credits = $credits;
            $scope.exam = exam;

            $scope.isTracked = function isTracked(moduleID) {
                var exists = 0;
                for (var key in Store.get()) {
                    if (Store.get().hasOwnProperty(key)) {
                        if (Store.get()[key].ModuleID == moduleID) {
                            exists = 1;
                            break;
                        }
                    }
                }
                return exists;
            }
            $scope.isNotTracked = function isNotTracked(moduleID) {
                var exists = 1;
                for (var key in Store.get()) {
                    if (Store.get().hasOwnProperty(key)) {
                        if (Store.get()[key].ModuleID == moduleID) {
                            exists = 0;
                            break;
                        }
                    }
                }
                return exists;
            }
            $scope.tracked = function tracked(moduleID) {
                if ($scope.isTracked(moduleID)) {
                    $http.delete('/api/users/' + self.user + '/modules/' + moduleID).then(function (response) {
                        $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                            Store.set(response1.data.data)

                            if (newTracked.getNewMods().indexOf(moduleID) > -1) {

                                var newTrack = newTracked.getNumber();
                                if (newTrack != 0) {
                                    newTrack = newTrack - 1;
                                }
                                newTracked.setNumber(newTrack);
                                $scope.$emit('handleEmit', {
                                    number: newTrack
                                });
                            }

                        })
                    })
                } else {
                    var newModsTracked = newTracked.getNewMods();
                    newModsTracked.push(moduleID);
                    newTracked.setNewMods(newModsTracked);

                    $http.post('/api/users/modules', {
                        "userID": self.user,
                        "moduleID": moduleID
                    }).then(function (response) {
                        $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                            Store.set(response1.data.data)
                            var newTrack = newTracked.getNumber();
                            newTrack = newTrack + 1;
                            newTracked.setNumber(newTrack);
                            $scope.$emit('handleEmit', {
                                number: newTrack
                            });
                        })
                    })
                }
            };
        }

        if (self.user != null) {
            $http.get('/api/users/' + self.user + '/modules/recommended').then(function (response) {
                self.rModules = response.data;
                if (self.rModules.length == 0) {
                    self.emptyRecommendations = 1;
                } else {
                    self.emptyRecommendations = 0;
                }
            })
        } else {
            self.emptyRecommendations = 1;
        }

        self.isTracked = function isTracked(moduleID) {
            var exists = 0;

            for (var key in Store.get()) {
                if (Store.get().hasOwnProperty(key)) {
                    if (Store.get()[key].ModuleID == moduleID) {
                        exists = 1;
                        break;
                    }
                }
            }

            return exists;
        }

        self.isNotTracked = function isNotTracked(moduleID) {

            var exists = 1;

            for (var key in Store.get()) {
                if (Store.get().hasOwnProperty(key)) {
                    if (Store.get()[key].ModuleID == moduleID) {
                        exists = 0;
                        break;
                    }
                }
            }

            return exists;
        }

        self.tracked = function tracked(moduleID) {
            if (self.isTracked(moduleID)) {
                $http.delete('/api/users/' + self.user + '/modules/' + moduleID).then(function (response) {
                    $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                        Store.set(response1.data.data)

                        //                        var newModsTracked = newTracked.getNewMods;

                        if (newTracked.getNewMods().indexOf(moduleID) > -1) {

                            var newTrack = newTracked.getNumber();
                            if (newTrack != 0) {
                                newTrack = newTrack - 1;
                            }
                            newTracked.setNumber(newTrack);
                            $scope.$emit('handleEmit', {
                                number: newTrack
                            });
                        }
                    })
                })
            } else {

                var tagsSelected = [];

                var newModsTracked = newTracked.getNewMods();
                newModsTracked.push(moduleID);
                newTracked.setNewMods(newModsTracked);

                $http.post('/api/users/modules', {
                    "userID": self.user,
                    "moduleID": moduleID,
                    "tagIDArray": tagsSelected
                }).then(function (response) {
                    $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                        Store.set(response1.data.data)
                        var newTrack = newTracked.getNumber();
                        newTrack = newTrack + 1;
                        newTracked.setNumber(newTrack);
                        $scope.$emit('handleEmit', {
                            number: newTrack
                        });
                    })
                })
            }
        };
    }
});