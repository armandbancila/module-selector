'use strict';


angular.
module('trackModules').
component('trackModules', {
        templateUrl: 'track-modules/track-modules.template.html',
        controller: function HelloTestController($uibModal, newTracked, $timeout, $http, $scope, Store) {

            var self = this;
            var tagSet = [];

            $("title").html("Tracked Modules");

            if ($('#tfilters').is(":visible")) {
                this.filtersHidden = false;

            } else {
                this.filtersHidden = true;
                $('#tfilters').addClass('slidable');
                $('#tfilters').addClass('view');
            }

            newTracked.setNumber(0);
            $scope.$emit('handleEmit', {
                number: 0
            });

            $scope.$on('updateTracked', function (event, args) {
                self.tModules = Store.get();
                self.updateTags();
            });


            /**
             *Opens modal window with information about tracked modules
             */
            $scope.open = function ($code, $name, $description, $cw, $credits) {
                var exam = 100 - $cw;
                $scope.$modalInstance = $uibModal.open({
                    templateUrl: 'modal-instance/modal-instance.template.html',
                    scope: $scope
                });
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
                                Store.set(response1.data.data);

                                $scope.$emit('updateTracked');
                            })
                        })
                    } else {
                        $http.post('/api/users/modules', {
                            "userID": self.user,
                            "moduleID": moduleID
                        }).then(function (response) {
                            $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                                Store.set(response1.data.data);

                                $scope.$emit('updateTracked');
                            })
                        })
                    }
                };
            }

            $http.get('/logged_in').then(function (response) {
                self.user = response.data.UserID;
                $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                    Store.set(response1.data.data);
                    self.tModules = Store.get();

                    //Displaying tags
                    self.tCategoryToTag = new Map();
                    self.tTagCategories = [];
                    var tModuleIDs = [];
                    var tModuleTags = [];

                    for (var key in self.tModules) {
                        if (self.tModules.hasOwnProperty(key)) {
                            tModuleIDs.push('module=' + self.tModules[key].ModuleID);
                        }
                    }

                    var query = '';
                    tModuleIDs.forEach(function (item, array) {
                        query += item + '&';
                    });

                    $http.get('/api/modules/tags?' + query).then(function (response) {
                        tModuleTags = response.data;
                        for (var key in tModuleTags) {
                            if (tModuleTags.hasOwnProperty(key)) {
                                if (self.tTagCategories.indexOf(tModuleTags[key].Category) == -1) {
                                    self.tTagCategories.push(tModuleTags[key].Category);
                                }
                            }
                        };

                        self.tTagCategories.splice(self.tTagCategories.indexOf(null), 1);
                        self.tTagCategories.push(null);
                        self.tTagCategories.forEach(function (item, array) {
                            var name = item;
                            var inCategory = [];
                            for (var key in tModuleTags) {
                                if (tModuleTags.hasOwnProperty(key)) {
                                    if (tModuleTags[key].Category == name) {
                                        inCategory.push(tModuleTags[key].TagName);
                                    }
                                }
                            }
                            self.tCategoryToTag.set(name, inCategory);
                        });

                    })
                })
                $timeout(function () {
                    $scope.$apply();
                })
            });

            self.pressedTag = function pressedTag(tagName) {
                if (tagName == 'All') {
                    tagSet = [];
                    query = 'api/users/' + self.user + '/modules';
                } else if (tagSet.indexOf('tag=' + tagName) > -1) {
                    tagSet.splice(tagSet.indexOf('tag=' + tagName), 1);
                    if (tagSet.length == 0) {
                        query = 'api/users/' + self.user + '/modules';
                    } else {
                        query = '';
                        tagSet.forEach(function (item, array) {
                            query += item + '&';
                        });
                        query = 'api/users/' + self.user + '/modules/?' + query;
                    }
                } else {
                    var query = 'tag=' + tagName;
                    query.replace(' ', '%20');
                    tagSet.push(query);
                    query = '';
                    tagSet.forEach(function (item, array) {
                        query += item + '&';
                    });
                    query = 'api/users/' + self.user + '/modules/?' + query;

                }
                $http.get(query).then(function (response) {
                    self.tModules = response.data.data;
                    self.updateTags();
                });
            }

            self.updateTags = function updateTags() {
                self.tCategoryToTag = new Map();
                self.tTagCategories = [];
                var tModuleIDs = [];
                var tModuleTags = [];

                for (var key in self.tModules) {
                    if (self.tModules.hasOwnProperty(key)) {
                        tModuleIDs.push('module=' + self.tModules[key].ModuleID);
                    }
                }

                var query = '';
                tModuleIDs.forEach(function (item, array) {
                    query += item + '&';
                });

                $http.get('/api/modules/tags?' + query).then(function (response) {
                    tModuleTags = response.data;
                    for (var key in tModuleTags) {
                        if (tModuleTags.hasOwnProperty(key)) {
                            if (self.tTagCategories.indexOf(tModuleTags[key].Category) == -1) {
                                self.tTagCategories.push(tModuleTags[key].Category);
                            }
                        }
                    };

                    var indexOfNull = self.tTagCategories.indexOf(null);

                    if (indexOfNull != -1) {
                        self.tTagCategories.splice(self.tTagCategories.indexOf(null), 1);
                        self.tTagCategories.push(null);
                    }

                    self.tTagCategories.sort();

                    self.tTagCategories.forEach(function (item, array) {
                        var name = item;
                        var inCategory = [];
                        for (var key in tModuleTags) {
                            if (tModuleTags.hasOwnProperty(key)) {
                                if (tModuleTags[key].Category == name) {
                                    inCategory.push(tModuleTags[key].TagName);
                                }
                            }
                        }
                        self.tCategoryToTag.set(name, inCategory);
                    });

                })
            }

            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                tagSet.forEach(function (item, array) {
                    document.getElementById(item.substr(4, item.length)).style.color = 'white';
                })
                if (tagSet.length == 0) {
                    document.getElementById('All').style.color = 'white';
                } else {
                    document.getElementById('All').style.color = '#4395B4';
                }
            });


            self.tracked = function tracked(moduleID) {

                $http.delete('/api/users/' + self.user + '/modules/' + moduleID).then(function (response) {
                    $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                        Store.set(response1.data.data)
                        self.tModules = Store.get();
                        self.updateTags();
                    })
                })

                $timeout(function () {
                    $scope.$apply();
                })
            };

        }

    })
    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    });