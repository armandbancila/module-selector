'use strict';


angular.
module('buildCourse').
component('buildCourse', {
    templateUrl: 'build-course/build-course.template.html',
    controller: function BuildCourseController(newTracked, $uibModal, $cookies, $timeout, $http, $scope, Store) {
				
				/**
				*@module Build Course Controller
				*/
			
        var self = this;
        this.degree = '';
        this.courses = [];
        this.dueTo = [];
        this.cache = [];

        /**
         *Retrieves the select element from a page and applies the select2 js scripts and styling to it
         *Select allows for a cleaner looking select element as well providing it with a built in seach tool.
         */
        $(document).ready(function () {
            $("title").html("Build Course");
            $(".select-degree").on("select2:select", function (e) {
                self.degree = e.params.data.text;
            });
        })

        /**
         *Called when a user clicks on a module div in the page. It opens a pop window which displays information of 
         *the module selected which is pulled from the database. It creates a scope which is used to store functions
         *which are used to handle tracking within the website.
         *@param {string} $code - The code of the module which is being selected. Used to retrieve further information
         *of the module from the database.
         */
        $scope.open = function ($code) {
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'modal-instance/modal-instance.template.html',
                scope: $scope
            });
            /*close modal window*/
            $scope.close = function () {
                $scope.$modalInstance.close();
            };

            //Retrieve data about the module with the given module $code
            $http.get('/api/modules/' + $code).then(function (response) {
                $scope.code = $code;
                $scope.name = response.data[0].Name;
                $scope.description = response.data[0].Description;
                $scope.cw = response.data[0].CourseworkPercentage;
                var exam = 100 - $scope.cw;
                $scope.credits = response.data[0].Credits;
                $scope.exam = exam;
            })

            /*Checks whether a module with the given moduleID exists in the list of tracked modules and returns 1 if it does, 0 otherwise */
            $scope.isTracked = function isTracked(moduleID) {
                var exists = 0;
                var helper = Store.get();
                for (var key in helper) {
                    if (helper.hasOwnProperty(key)) {
                        if (helper[key].ModuleID == moduleID) {
                            exists = 1;
                            break;
                        }
                    }
                }
                return exists;
            }

            /*Checks whether a module with the given moduleID is not in the list of tracked modules and returns 1 if it does not, 0 otherwise */
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

            /*Adds a module with the given moduleID to the list of tracked if the module is not already tracked and deletes that module from the list if it is tracked */
            $scope.tracked = function tracked(moduleID) {
                getUser((userID) => {
                    if ($scope.isTracked(moduleID)) {
                        $http.delete('/api/users/' + userID + '/modules/' + moduleID).then(function (response) {
                            $http.get('/api/users/' + userID + '/modules').then(function (response1) {
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
                            "userID": userID,
                            "moduleID": moduleID
                        }).then(function (response) {
                            $http.get('/api/users/' + userID + '/modules').then(function (response1) {
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
                })
            };
        }

        /**
         *Called to retrieve the userID of the user currently using the website.
         */
        var getUser = function (done) {
            var user = $cookies.get('selector_user');
            if (user) return done(JSON.parse(user.substring(2, user.length)).UserID);
            $http.get("/logged_in").then(function (response) {
                self.user = response.data;
                done(response.data.UserID);
            });
        }

        getUser((userID) => {
            $http.get('/api/users/' + userID + '/modules').then(function (response) {
                Store.set(response.data.data);
            })
        });

        /**
         *Used within the controller to retrieve all of the modules that are taught within a course.
         *@param {string} template - The name of the degree you wish to pull modules from.
         */
        var getDegreeModules = function (template, done) {
            var cached = self.cache[template];
            if (cached) return done(cached);
            $http.get("/api/degrees/" + template + "/modules").then((resp) => {
                self.cache[template] = resp.data;
                self.cache[template].startingYear = Math.min.apply(Math, resp.data.map(function (module) {
                    return module.Year;
                }))
                done(resp.data);
            });
        }

        /**
         *Calculates the total number of credits that a user has added modules for in a build vs the allowed creditLimit for that degree 
         *@param {string} build - the build in which you wish to calculate the credit totals for.
         *param {int} yearIndex - the year the credits belong to.
         *param {int} level - the level of the year you are calculating for.
         */
        var calculateTotals = function (build, yearIndex, level) {
            var creditLimit;

            switch (level) {
            case 8:
                creditLimit = 360;
                break;
            case 7:
                creditLimit = 180;
                break;
            default:
                creditLimit = 120;
                break;
            }

            var sum = build['years'][yearIndex].reduce((a, module) => {
                return a + Number(module.Credits);
            }, 0);
            if (!build['yearCredits']) build['yearCredits'] = [];
            build['yearCredits'][yearIndex] = sum + '/' + creditLimit;
        }

        /**
         *Pulls data from the database and then sorts the build into a structure which can be used to display information in the html file.
         *@param {Object} builds - Object pulled from the database which stores the build options of a degree.
         */
        var parseBuilds = function (builds) {
            for (var key in builds) {
                ((keyCopy) => getDegreeModules(builds[keyCopy].template, function (modules) {
                    $http.get("/api/degrees/" + builds[keyCopy].template).then(function (response) {
                        var course = {
                            buildID: builds[keyCopy].buildID,
                            years: [],
                            options: [],
                            chosenCount: [],
                            IsDrawOpen: []
                        };
                        for (var i = 0; i < response.data[0].LengthOfStudy; ++i) {
                            course['IsDrawOpen'][i] = false;
                            var selected = 0;
                            course['years'][i] = builds[keyCopy].components.filter((module) => {
                                var year = Number(module.Year) == i + modules.startingYear;
                                if (year && module.Evaluated != 'Compulsory') ++selected;
                                return year;
                            });
                            course['options'][i] = modules.filter((module) => {
                                return (Number(module.Year)) == i + modules.startingYear && module.IsOptional;
                            });
                            course['chosenCount'][i] = selected;
                            calculateTotals(course, i, modules.startingYear + i);
                        }
                        course['recommended'] = builds[keyCopy].recommended;
                        course.template = builds[keyCopy].template;
                        self.courses.push(course);
                    })
                }))(key)
            }
        }

        /**
         *Pulls data from the database and then sorts the build into a structure which can be used to display information in the html file.
         *Similar to the parseBuilds function but used to parse for a single build.
         *@param {Object} builds - Object pulled from the database which stores the build options of a degree.
         */
        var parseBuild = function (build) {
            getDegreeModules(build.template, function (modules) {
                $http.get("/api/degrees/" + build.template).then(function (response) {

                    var course = {
                        buildID: build.buildID,
                        years: [],
                        options: [],
                        chosenCount: [],
                        IsDrawOpen: []
                    };

                    for (var i = 0; i < response.data[0].LengthOfStudy; ++i) {
                        course['IsDrawOpen'][i] = false;
                        var selected = 0;
                        course['years'][i] = build.components.filter((module) => {
                            var year = Number(module.Year) == i + modules.startingYear;
                            if (year && module.Evaluated != 'Compulsory') ++selected;
                            return year;
                        });
                        course['options'][i] = modules.filter((module) => {
                            return (Number(module.Year)) == i + modules.startingYear && module.IsOptional;
                        });
                        course['chosenCount'][i] = selected
                        calculateTotals(course, i, modules.startingYear + i);
                    }
                    course['recommended'] = build.recommended;
                    course.template = build.template;
                    self.courses.push(course);
                });
            });
        }

        /**
         *Used to recalculate the builds in a page to correctly display data after the user has interacted with a build.
         */
        var refresh = function () {
            self.courses = [];
            getUser((userID) => {
                $http.get("/api/users/" + userID + "/degrees").then(function (response) {
                    self.userDegrees = response.data;

                    var degrees = [];

                    self.userDegrees.forEach(function (item, array) {
                        degrees.push(item.DegreeTitle);
                    })

                    $(document).ready(function () {
                        if ($(".select-degree").length > 0) {
                            $(".select-degree").select2({
                                allowClear: true,
                                placeholder: "Select a degree",
                                data: degrees
                            });
                        }
                    })
                });

                $http.get("/api/users/" + userID + "/builds").then(function (response) {
                    parseBuilds(response.data);
                });
            });
        }

        refresh();


        /**
         *Deletes a modules from a course.
         */
        var erase = function (buildID) {
            self.courses = self.courses.filter((course) => {
                return course.buildID != buildID
            });
        }

        /**
         *Called to collapse the option menu of modules in a given degree year.
         *@param {int} buildID - The build ID of a build
         *@param {int} year - The year which you are shrinking the option menu from.
         *@param {int} height - The height of the div you are shrinking.
         */
        var shrink = function (buildID, year, height) {
            var growDiv = document.getElementById('grow-' + buildID + '-' + year);
            if (growDiv) growDiv.style.height = height;
        }

        /**
         *Called to collapse the option menu of modules in a given degree year.
         *@param {int} buildID - The build ID of a build
         *@param {int} year - The year which you are shrinking the option menu from.
         *@param {int} height - The height of the div you are shrinking.
         */
        var refreshOptions = function (build, year, height) {
            var growDiv = document.getElementById('grow-' + build.buildID + '-' + year);
            if (growDiv && build['IsDrawOpen'][year - 1]) growDiv.style.height = height;
        }

        /**
         *Called to update a build after a user has interacted with it.
         *@param {Object} build - The build in which you wish to update.
         */
        var update = function (build) {
            $http.get("/api/users/builds/" + build.buildID).then(function (response) {

                var updatedBuild = response.data;
                build.recommended = updatedBuild.recommended;
                getDegreeModules(build.template, function (modules) {
                    for (var i = 0; i < build.years.length; ++i) {
                        var selected = 0;
                        build['years'][i] = updatedBuild.components.filter((module) => {
                            var sameYear = module.Year == i + modules.startingYear;
                            if (sameYear && module.Evaluated != 'Compulsory') ++selected;
                            return sameYear;
                        });
                        build['chosenCount'][i] = selected;
                        refreshOptions(build, i + 1, (build['options'][i].length - selected) * 80 + 'px');
                        calculateTotals(build, i, modules.startingYear + i);
                    }
                });
            });
        }

        /**
         *Returns true if a module with the given moduleID is chosen in this build and false otherwise
         *@param {Object} build - The build which contains the moduleID in question.
         *@param {string} moduleID - The module ID which is being checked.
         */
        var isNotChosen = function (build, moduleID) {
            for (var i = 0; i < build['years'].length; ++i) {
                for (var j = 0; j < build['years'][i].length; ++j)
                    if (build['years'][i][j].ModuleID == moduleID) return false;
            }

            return true;
        }

        /** 
         *Deletes a user build.
         */
        this.remove = function remove(buildID) {
            getUser((userID) => $http.delete("/api/users/builds/" + buildID).then(() => erase(buildID)));
        }

        /** 
         *Removes a module from a build and updates component. 
         */
        this.removeComponent = function remove(build, moduleID) {
            getUser((userID) => $http.delete("/api/users/builds/" + build.buildID + "/modules/" + moduleID).then(() => update(build)));
        }

        /** 
        Adds a module a build and updates component. 
        */
        this.addComponent = function add(build, moduleID) {
            getUser((userID) => $http.put("/api/users/builds/" + build.buildID + "/modules/", {
                "moduleID": moduleID
            }).then(() => update(build)));
        }

        /** 
         *Returns true if options for that build and year exist and false otherwise. If not options are found, shrinks the build.
         */
        this.hasOptions = function (build, year) {
            var options = build['options'][year - 1];

            if (!options || options.length == 0) {
                shrink(build.buildID, year, 0);
                return false;
            }
            for (var key in options) {
                if (options[key].ModuleID && isNotChosen(build, options[key].ModuleID)) return true;
            }

            shrink(build.buildID, year, 0);
            return false;
        }

        /**
         *Change html so that options for a particular build and year show.
         */
        this.showOptions = function showOptions(build, year) {
            var growDiv = document.getElementById('grow-' + build.buildID + '-' + year);
            var divHeight = parseInt(growDiv.style.height, 10);
            if (divHeight == 0 || !divHeight) {

                var height = (build['options'][year - 1].length - Number(build['chosenCount'][year - 1])) * 80;
                growDiv.style.height = height + 'px';
            } else {
                growDiv.style.height = 0;
            }

            build['IsDrawOpen'][year - 1] = !build['IsDrawOpen'][year - 1];

        }

        this.notChosen = isNotChosen;

        this.isOpen = function (build, year) {
            return build['IsDrawOpen'][year];
        }

        /** 
         *Splits the input string into two parts and returns true if the number in the first part of the string is greater than the second and false otherwise. 
         */
        this.exceeded = function exceeded(input) {

            var working = input.split('/');

            return Number(working[0]) > Number(working[1]);
        }

        /**
         *Sets the name of the degree.
         */
        this.setDegree = function setDegree(inDegree) {
            self.degree = inDegree;
        }

        /**
         *Sends a post request to the server that is supposed to save the global degree for the global user.
         */
        this.buildMe = function buildMe() {
            getUser((userID) =>
                $http.post("/api/users/builds", {
                    "userID": userID,
                    "degreeTitle": self.degree
                }).success(function (data, status, headers, config) {
                    $http.get(headers('Location')).then(function (response) {
                        parseBuild(response.data);
                    })
                })
            );
        }

        /** 
         *Returns true if a module with the given moduleID is recommended in relation to this build. 
         */
        this.isRecommended = function (build, moduleID) {
            var dueTo;
            for (var i = 0; i < build['recommended'].length; ++i) {
                var entry = build['recommended'][i];
                if (entry.Recommendation == moduleID) {
                    dueTo = entry.DueTo;;
                    break;
                }
            }
            if (!dueTo) return false;
            if (isNotChosen(build, dueTo)) return false;
            if (self.dueTo[build.buildID])
                self.dueTo[build.buildID][moduleID] = dueTo;
            else {
                self.dueTo[build.buildID] = {};
                self.dueTo[build.buildID][moduleID] = dueTo;
            }
            return true;
        }
    }
});