var createCourse = angular.module('createCourse', ['ui.bootstrap', 'ngRoute']).
component('createCourse', {
    templateUrl: "create-course/create-course.template.html",
    controller: function CreateCourseController($http, $window, $scope, $uibModal) {
        var tagged = [];
        $scope.selectedModules = [];
        $("title").html("Create Course");
        $scope.updated = false;
        $http.get('/api/modules').then(function (response) {
            $scope.modules = response.data.data;
        });
        
        /**
        *Called when the user wishes to submit the course they have just created. Code validates that all of the fields
        *have been inputted correctly and if done so correctly, retrieves the data and pushes it to the database.
        */
        $("#create_course_btn").click(function () {
            var courseName = $('#course_name').val();
            var courseYear = $.trim($("#select_year option:selected").text());
            if (courseName.length == 0) {
                $("#cc-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Enter A Course Name</p>");
            } else if (courseYear.includes("Length")) {
                $("#cc-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Select A Year</p>");
            } else {
                $http.post("/api/degrees", {
                    "degreeTitle": courseName,
                    "lengthOfStudy": courseYear
                }).then(function successCallback(response) {
                    // add dependencies, if they exist
                    for (var i = 0; i < $scope.selectedModules.length; ++i) {
                        var dependencies = $scope.selectedModules[i].dependencies;
                        var recommendations = $scope.selectedModules[i].recommendations;
                        $http.post('/api/degrees/' + courseName + '/modules', {
                            "moduleID": $scope.selectedModules[i].ID,
                            "isOptional": $scope.selectedModules[i].isOptional,
                            "dependentIDArray": dependencies,
                            "recommendedIDArray": recommendations
                        }).then(function successCallback(response) {
                        }, function errorCallback(response) {
                            console.log("ERROR! Could not add module.");
                            console.log(response.data);
                        });
                    }
                    $("#create-course-span").html("<p style='width:30%;margin-top:15%' class='alert success'> Course " + courseName + " Has Been Added Successfully </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Add Another Course </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");
                }, function errorCallback(response) {
                    $("#cc-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Course Name Already Exists, Please Try Again</p>");
                });
            }
        });
        
        /**
        *Called when a user wishes to deselect a module from the course they are creating.
        *@param {event} event - takes the event to interact with the location of the modules after it is deselected.
        */
        $scope.deselectModule = function (event) {
            var moduleName = $.trim($(event.target).parent().text());
            var index = $scope.selectedModules.map(function (module) {
                return module.ID;
            }).indexOf(moduleName);
            $scope.selectedModules.splice(index, 1);
        };
        
        $scope.moveModules = function () {
            var dropdownModuleIndex = $scope.selectedModules.map(function (module) {
                return module.ID;
            }).indexOf($.trim($scope.dropdownModule));
            if (dropdownModuleIndex == -1) {
                $scope.selectedModules.push({
                    "ID": $.trim(selector.value),
                    "dependencies": [],
                    "recommendations": [],
                    "isOptional": "0"
                });
            }
        };
        
        /**
        *Called when a user clicks on a module to further edit its status in the course.
        *@param {event} event - event used to retrieve which module the user has selected. 
        */
        $scope.open = function (event) {
            $scope.moduleCode = $(event.target).text();
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'add-module-to-course/add-module-to-course.template.html',
                controller: 'AddModuleToCourseController',
                scope: $scope
            });
        };
    }
});

createCourse.controller('AddModuleToCourseController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    
    $scope.myFilter = function (item) {
        return (item.ModuleID) != $scope.excludedModule;
    };
    
    $scope.excludedModule = $.trim($scope.moduleCode);
    
    var excludedModuleIndex = $scope.selectedModules.map(function (module) {
        return module.ID;
    }).indexOf($scope.excludedModule);
    
    $scope.selectedDependencies = $scope.selectedModules[excludedModuleIndex].dependencies;
    $scope.selectedRecommendations = $scope.selectedModules[excludedModuleIndex].recommendations;
    $scope.selectedOptionality = $scope.selectedModules[excludedModuleIndex].isOptional;
    
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
            $scope.$modalInstance.close();
        }
    };
    
    $scope.save = function () {
        var type = $.trim($("#type-select option:selected").text());
        var isOptional = "0";
        if (type == "Optional") {
            isOptional = "1";
        }
        $scope.selectedModules[excludedModuleIndex].dependencies = $scope.selectedDependencies;
        $scope.selectedModules[excludedModuleIndex].recommendations = $scope.selectedRecommendations;
        $scope.selectedModules[excludedModuleIndex].isOptional = isOptional;
        $scope.close();
    };
}]);