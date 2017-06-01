var editCourse = angular.
module('editCourse').
component('editCourse', {
    templateUrl: 'edit-course/edit-course.template.html',
    controller: function EditCourseController($http, $scope, $uibModal, $window) {
        $http.get('/api/modules').then(function (response) {
            $scope.modules = response.data.data;
        });
        var self = this;
        $scope.selectedModules = [];
        $("title").html("Edit Course");
        $scope.equalizeHeights = function (selector) {
            var heights = new Array();
            // Loop to get all element heights
            $(selector).each(function () {
                // Then add size (no units) to array
                heights.push($(this)[0].offsetHeight);
            });
            // Find max height of all elements
            var max = Math.max.apply(Math, heights);
            // Set all heights to max height
            $(selector).each(function () {
                $(this).css('height', max + 'px');
            });
        }

        function refreshDegrees() {
            $http.get("/api/degrees").success(function (data) {
                $scope.degrees = data;
                //pagination
                var pagesShown = 1;
                var pageSize = 10;
                $scope.paginationLimit = function (data) {
                    return pageSize * pagesShown;
                };
                $scope.hasMoreItemsToShow = function () {
                    return pagesShown < ($scope.degrees.length / pageSize);
                };
                $scope.showMoreItems = function () {
                    pagesShown = pagesShown + 1;
                };
            }).error(function (response, status) {
                console.log("The Request Failed With Response " + response + " And Status Code " + status);
            });
        }
        refreshDegrees();
        this.removeDegree = function (event) {
            var name = $(event.target).parent().children("span").text();
            var confirmed = confirm("Permanently Delete Course " + name + "?");
            if (confirmed) {
                // get the parent of this icon, which is the tag container
                // now get the child of it that's a span (which contains the tag name)
                // get its text content, which is the TagName property of this tag
                $.ajax({
                    url: 'api/degrees/' + name,
                    type: 'DELETE',
                    success: function (result) {
                        refreshDegrees();
                    }
                });
            }
        };
        this.createDegreeButton = function () {
            addDegree(this.degreeTitle);
            refreshDegrees();
            $("#create-degree-button").blur(); // now the buttons won't stay pressed after you click on them once
        };
        // catch event, do something
        $scope.$on('ngRepeatFinished', function () {
            $scope.equalizeHeights(".module-style-tag");
        });


        $scope.open = function (courseName, courseYear, modulesInCourse) {
            $scope.coursename = courseName;
            $scope.courseYear = courseYear;
            $scope.modulesincourse = modulesInCourse;
            $scope.courseModelInstance = $uibModal.open({
                templateUrl: 'edit-course/edit-course-modal.template.html',
                controller: 'CourseController',
                scope: $scope
            });
        }

        $scope.addModuleOpen = function (event) {
            $scope.moduleCode = $(event.target).text();
            $scope.$uibModalInstance = $uibModal.open({
                templateUrl: 'add-module-to-course/add-module-to-course.template.html',
                controller: 'AddModuleOpenController',
                scope: $scope
            });
        };
    }
});
// $timeout is the way to execute stuff after angular is done with the view
// I tried $last but that one was stopping right before the {{code}} parts were about to be executed 
angular.module('editCourse').directive('afterNgRepeat', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

editCourse.controller('CourseController', ['$scope', '$http', '$window', '$q', function ($scope, $http, $window, $q) {
    tagsChanged = false;
    $scope.moduleNames = [];
    $scope.selectRecommendations = [];
    /* Year Options */
    $scope.yearOptions = [{
        name: "1"
    }, {
        name: "2"
    }, {
        name: "3"
    }, {
        name: "4"
    }, {
        name: "5"
    }, {
        name: "6"
    }];

    for (var i = 0; i < $scope.yearOptions.length; ++i) {
        if ($scope.yearOptions[i].name == $scope.courseYear) {
            $scope.yearSelectedOption = $scope.yearOptions[i];
            break;
        }
    }
    var tagged = [];
    var recommendationsTagged = [];
    var initialSetUnchanged = [];
    var mod_assignments = "/api/degrees/" + $scope.coursename + "/modules";
    var dependencies = "/api/degrees/" + $scope.coursename + "/modules/dependencies";
    var recommendations = "/api/degrees/" + $scope.coursename + "/modules/recommendations";
    var arrayDifference = function (A, B) {
        return A.filter(function (x) {
            return B.indexOf(x.ModuleID) < 0
        });
    };
    $http.get(mod_assignments).then(function successCallback(response) {
        var assignedModules = response.data;
        var pan = document.getElementById("module_bed");
        var selector = document.getElementById("module_selector");
        $scope.selectedModules = assignedModules;
        $scope.unselectedModules = arrayDifference($scope.modules, assignedModules.map((module) => {
            return module.ModuleID;
        }));
    })
    $http.get(dependencies).then(function successCallback(response) {
        var dependencyArray = [];
        for (var key in response.data) {
            var dependency = response.data[key];
            if (!dependencyArray[dependency.Dependency]) dependencyArray[dependency.Dependency] = [];
            dependencyArray[dependency.Dependency].push(dependency.Parent);
        }

        $http.get(recommendations).then(function successCallback(response) {
            var recommendationArray = [];
            for (var key in response.data) {
                var recommendation = response.data[key];
                if (!recommendationArray[recommendation.ModuleID]) recommendationArray[recommendation.ModuleID] = [];
                recommendationArray[recommendation.ModuleID].push(recommendation.Recommendation);
            }
            for (var key in $scope.selectedModules) {
                var name = $scope.selectedModules[key].ModuleID;
                if (dependencyArray[name]) $scope.selectedModules[key].dependencies = dependencyArray[name];
                else $scope.selectedModules[key].dependencies = [];

                if (recommendationArray[name]) $scope.selectedModules[key].recommendations = recommendationArray[name];
                else $scope.selectedModules[key].recommendations = [];
                $scope.$parent.selectedModules = $scope.selectedModules;
            }
        });
    });


    $scope.deselectModule = function (event) {
        var moduleName = $.trim($(event.target).parent().text());
        var index = $scope.selectedModules.map(function (module) {
            return module.ModuleID;
        }).indexOf(moduleName);
        if ($scope.selectedModules[index].isNew != "1") {
            $scope.selectedModules[index].deleted = "1";
            $scope.unselectedModules = arrayDifference($scope.modules, $scope.selectedModules.map((module) => {
                return (module.deleted == "1") ? "cantbeamodulecantbeamodulecantbeamodule" : module.ModuleID;
            }));
        } else {
            $scope.selectedModules.splice(index, 1);
            $scope.unselectedModules = arrayDifference($scope.modules, $scope.selectedModules.map((module) => {
                return module.ModuleID;
            }));
        }


    };
    $scope.moveModules = function () {
        var selector = document.getElementById("selector");
        var index = $scope.selectedModules.map(function (module) {
            return module.ModuleID;
        }).indexOf($.trim(selector.value));
        if (index == -1) {
            $scope.selectedModules.push({
                "ModuleID": $.trim(selector.value),
                "dependencies": [],
                "recommendations": [],
                "IsOptional": "0",
                "isNew": "1",
                "deleted": "0",
                "isModified": "0"
            });
            $scope.$parent.selectedModules = $scope.selectedModules;
        } else {
            $scope.selectedModules[index].deleted = "0";
        }

        $scope.unselectedModules = arrayDifference($scope.modules, $scope.selectedModules.map((module) => {
            return module.ModuleID;
        }));
        $scope.selectedItem = "";
    };

    $http.get('/api/modules').then(function (response) {
        $scope.recommendations = response.data.data;
    });
    $scope.close = function () {
        $scope.courseModelInstance.close();
    };

    /**
     *Called when the user wishes to submit changes to a course. Function validates the input and if succeeded pushes the data to the database.
     */
    $scope.updateCourse = function () {
        var name = $("#course_name").val();
        var year = $.trim($("#course_year option:selected").text());
        if (year.includes(" ")) {
            $("#cc-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Select A Year</p>");
        }
        $http.put("/api/degrees/" + name, {
            "degreeTitle": name,
            "lengthOfStudy": year
        }).then(function successCallback(response) {
            var promises = [];
            for (var j = 0; j < $scope.selectedModules.length; ++j) {
                promises.push(((i) => {
                    var moduleCode = $scope.selectedModules[i].ModuleID;
                    var dependency = $scope.selectedModules[i].dependencies;
                    var recommend = $scope.selectedModules[i].recommendations;

                    if ($scope.selectedModules[i].isNew == "1") {
                        return $http.post("/api/degrees/" + name + "/modules/", {
                            "moduleID": moduleCode,
                            "isOptional": $scope.selectedModules[i].IsOptional,
                            "dependentIDArray": dependency,
                            "recommendedIDArray": recommend
                        }).then(function successCallback(response) {}, function errorCallback(response) {
                            console.log(moduleCode + " Could not be added to Course " + name);
                        });
                    } else if ($scope.selectedModules[i].deleted == "1") {
                        return $http.delete("/api/degrees/" + name + "/modules/" + moduleCode).then(function successCallback(response) {
                            $window.location.reload();
                        }, function errorCallback(response) {
                            alert("Something Went Wrong");
                        });
                    } else {

                        return $http.put("/api/degrees/" + name + "/modules/" + moduleCode, {
                            "isOptional": $scope.selectedModules[i].IsOptional
                        }).then(function successCallback(response) {
                            return $http.put("/api/degrees/" + name + "/modules/" + moduleCode + "/dependencies", {
                                "dependentIDArray": dependency
                            }).then(function successCallback(response) {
                                return $http.put("/api/degrees/" + name + "/modules/" + moduleCode + "/recommendations", {
                                    "recommendedIDArray": recommend
                                }).then(function successCallback(response) {
                                    return response
                                }, function errorCallback(response) {
                                    console.error(response.data);
                                    return $q.reject();
                                });
                            }, function errorCallback(response) {
                                console.log(moduleCode + " Dependencies Could not be added to Course " + name);
                                console.error(response.data);
                                return $q.reject();
                            });
                        }, function errorCallback(response) {
                            console.log(moduleCode + " Could not be added to Course " + name);
                            console.error(response.data);
                            return $q.reject();
                        });
                    }
                })(j));
            }
            $q.all(promises).then((response) => {
                $("#edit_course_span").html("<p style='width:50%;margin-top:5%' class='alert success'> Course " + name + " Has Been Updated</p><br/>");
                $window.setTimeout(function () {
                    location.reload()
                }, 1100);
            }).catch((err) => {
                console.error(err);
                $("#edit_course_span").html("<p style='width:80%' class='alert'>Something went wrong... <p/>");
            });
        });
        $("#edit_course_span").html("<p style='width:50%;margin-top:5%' class='alert success'>UPDATING....</p><br/>");
    }
}]);

editCourse.controller('AddModuleOpenController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.myFilter = function (item) {
        return (item.ModuleID) != $scope.excludedModule;
    };
    $scope.excludedModule = $.trim($scope.moduleCode);
    var excludedModuleIndex = $scope.selectedModules.map(function (module) {
        return module.ModuleID;
    }).indexOf($scope.excludedModule);
    $scope.selectedDependencies = $scope.selectedModules[excludedModuleIndex].dependencies;
    $scope.selectedRecommendations = $scope.selectedModules[excludedModuleIndex].recommendations;
    $scope.selectedOptionality = $scope.selectedModules[excludedModuleIndex].IsOptional;

    $scope.moveDependency = function () {
        var selectedDependencyIndex = $scope.selectedDependencies.map(function (module) {
            return module;
        }).indexOf($.trim($scope.selectedDependency.ModuleID));
        if (selectedDependencyIndex == -1) {
            $scope.selectedDependencies.push($scope.selectedDependency.ModuleID);
        }
    };
    $scope.deselectDependency = function (event) {
        var index = $scope.selectedDependencies.indexOf($(event.target).parent().text());
        $scope.selectedDependencies.splice(index, 1);
    };
    $scope.moveRecommendation = function () {
        var selectedRecommendationIndex = $scope.selectedRecommendations.map(function (module) {
            return module;
        }).indexOf($.trim($scope.selectedRecommendation.ModuleID));
        if (selectedRecommendationIndex == -1) {
            $scope.selectedRecommendations.push($scope.selectedRecommendation.ModuleID);
        }
    };
    $scope.deselectRecommendation = function (event) {
        var index = $scope.selectedRecommendations.indexOf($(event.target).parent().text());
        $scope.selectedRecommendations.splice(index, 1);
    };

    $scope.close = function () {
        if ($scope.updated) {
            $window.location.reload();
        } else {
            $scope.$uibModalInstance.close();
        }
    };
    $scope.save = function () {
        var type = $.trim($("#type-select option:selected").text());
        var isOptional = "0";
        var isOptional = "0";
        if (type == "Optional") {
            isOptional = "1";
        }
        $scope.$parent.selectedModules[excludedModuleIndex].dependencies = $scope.selectedDependencies;
        $scope.$parent.selectedModules[excludedModuleIndex].recommendations = $scope.selectedRecommendations;
        $scope.$parent.selectedModules[excludedModuleIndex].IsOptional = isOptional;
        $scope.close();
    };
}]);