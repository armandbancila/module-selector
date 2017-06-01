var editMod = angular.
module('editModule', ['ngRoute', 'ui.bootstrap']);
editMod.component('editModule', {
    templateUrl: 'module-content/edit-module.template.html',
    controller: function EditModuleController($http, $scope, $uibModal, $window) {
        $("title").html("Edit Module");
        $scope.updated = false;
        $scope.getExam = function (cw) {
                return 100 - cw;
            }
            /**
             *Delete a module with the given id if permission is granted in a confim dialog.
             */
        $scope.remove = function (id) {
            var confirmed = confirm("Permanently Delete Module " + id + "?");
            if (confirmed) {
                $http.delete("/api/modules/" + id).then(function successCallback(response) {
                    $window.location.reload();
                }, function errorCallback(response) {
                    alert("Something Went Wrong");
                });
            }
        }
        $http.get('/api/modules').then(function (response) {
            $scope.modules = response.data.data;
            //pagination
            var pagesShown = 1;
            var pageSize = 5;
            $scope.paginationLimit = function (data) {
                return pageSize * pagesShown;
            };
            $scope.hasMoreItemsToShow = function () {
                return pagesShown < ($scope.modules.length / pageSize);
            };
            $scope.showMoreItems = function () {
                pagesShown = pagesShown + 1;
            };
        });

        /**
         *Reload page
         */
        $scope.refresh = function () {
            $window.location.reload();
        }

        /**
         *Open modal window
         */
        $scope.open = function (id, name, descr, cw, credits, time, day, year, fac) {
            $scope.id = id;
            $scope.name = name;
            $scope.descr = descr;
            $scope.cw = cw;
            $scope.credits = credits;
            $scope.lectureTime = time;
            $scope.lectureDay = day;
            $scope.year = year;
            $scope.faculty = fac;
            $("#module_code").val(id);
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'module-content/edit-module-modal.template.html',
                controller: 'ModalContorller',
                scope: $scope
            });
        }
    }
});
editMod.controller('ModalContorller', ['$scope', '$http', function ($scope, $http) {
    var tagsChanged = false;
    /** 
     *year options 
     */
    $scope.yearOptions = [{
        name: "4"
    }, {
        name: "5"
    }, {
        name: "6"
    }, {
        name: "7"
    }, {
        name: "8"
    }];
    for (var i = 0; i < $scope.yearOptions.length; ++i) {
        if ($scope.yearOptions[i].name == $scope.year) {
            $scope.yearSelectedOption = $scope.yearOptions[i];
            break;
        }
    }
    /**
     *credit options 
     */
    $scope.creditOptions = [{
        name: "15"
    }, {
        name: "30"
    }];
    for (var i = 0; i < $scope.creditOptions.length; ++i) {
        if ($scope.creditOptions[i].name == $scope.credits) {
            $scope.creditSelectedOption = $scope.creditOptions[i];
            break;
        }
    }
    /**
     *day options 
     */
    $scope.dayOptions = [{
        name: "Monday"
    }, {
        name: "Tuesday"
    }, {
        name: "Wednesday"
    }, {
        name: "Thursday"
    }, {
        name: "Friday"
    }];
    for (var i = 0; i < $scope.dayOptions.length; ++i) {
        if ($scope.dayOptions[i].name == $scope.lectureDay.substr(1) || $scope.dayOptions[i].name == $scope.lectureDay) {
            $scope.daySelectedOption = $scope.dayOptions[i];
            break;
        }
    }
    var tagged = [];
    var initialSetUnchanged = [];
    var mod_assignments = "/api/modules/tags?" + "module=" + $scope.id;
    $http.get(mod_assignments).then(function successCallback(response) {
        var assignedTags = response.data;
        var pan = document.getElementById("tag_bed");
        var selector = document.getElementById("tag_selector");
        for (var i = 0; i < assignedTags.length; ++i) {
            tagsChanged = true;
            var name = assignedTags[i].TagName;
            var thing = document.createElement('span');
            var glyph = document.createElement('i');
            glyph.setAttribute("class", "glyphicon glyphicon-remove");
            glyph.setAttribute("id", name);
            glyph.addEventListener('click', function () {
                var clicked = event.target;
                var option = document.createElement('option');
                var text = clicked.getAttribute("id");
                option.appendChild(document.createTextNode(text));
                selector.appendChild(option);
                tagged.splice(tagged.indexOf(clicked.id + ""), 1);
                pan.removeChild(clicked.parentElement);
            });
            tagged.push(name);
            initialSetUnchanged.push(name);
            thing.setAttribute("class", "label label-default");
            var m = document.createTextNode(name);
            thing.appendChild(m);
            thing.appendChild(glyph);
            if (tagged.length % 2 == 0) {
                var br = document.createElement("br");
                thing.appendChild(br);
            }
            pan.appendChild(thing);

        }
        $http.get('/api/tags').then(function (response) {
            var tags = response.data;
            var tagNs = [];
            for (var i = 0; i < tags.length; ++i) {
                tagNs.push(tags[i].TagName);
            }

            $scope.tagNames = arrayDifference(tagNs, initialSetUnchanged);
        });
    }, function errorCallback(response) {
        alert("This Did Not Work, Please Try Again");
    });

    /*
     *Returns all elements in array A that are not in array B.
     *@param {array} A
     *@param {array} B 
     */
    var arrayDifference = function (A, B) {
        return A.filter(function (x) {
            return B.indexOf(x) < 0
        });
    };

    /**
    If a tag is selected from the dropdown, it is removed from the list of options and added to the tag span as well as 
    *the list of tags to add to this module. If the cross on a tag is clicked, removes the tag from the span of tags as well as 
    *the list of tags to add to this module and puts it back into the dropdown.
    */
    $scope.moveTags = function () {
        tagsChanged = true;
        var pan = document.getElementById("tag_bed");
        var selector = document.getElementById("tag_selector");
        var thing = document.createElement('span');
        var glyph = document.createElement('i');
        tagged.push(selector.value);
        glyph.setAttribute("class", "glyphicon glyphicon-remove");
        glyph.setAttribute("id", selector.value);
        glyph.addEventListener('click', function () {
            var clicked = event.target;
            var option = document.createElement('option');
            var text = clicked.getAttribute("id");
            option.appendChild(document.createTextNode(text));
            selector.appendChild(option);
            tagged.splice(tagged.indexOf(clicked.id + ""), 1);
            pan.removeChild(clicked.parentElement);
        });
        thing.setAttribute("class", "label label-default");
        var v = selector.value;
        var m = document.createTextNode(v);
        thing.appendChild(m);
        thing.appendChild(glyph);
        if (tagged.length % 2 == 0) {
            var br = document.createElement("br");
            thing.appendChild(br);
        }
        selector.remove(selector.selectedIndex);
        pan.appendChild(thing);
    }
    $scope.facultyOptions = [{
        name: "Faculty of Arts and Humanities"
    }, {
        name: "Dental Institute"
    }, {
        name: "Faculty of Life Sciences and Medicine"
    }, {
        name: "Institute of Psychiatry, Psychology and Neuroscience"
    }, {
        name: "The Dickson Poon School of Law"
    }, {
        name: "Faculty of Natural and Mathematical Sciences"
    }, {
        name: "Florence Nightingale Faculty of Nursing and Midwifery"
    }, {
        name: "Faculty of Social Science and Public Policy"
    }];
    for (var i = 0; i < $scope.facultyOptions.length; ++i) {
        if ($scope.facultyOptions[i].name == $scope.faculty) {
            $scope.facultySelectedOption = $scope.facultyOptions[i];

            break;
        }
    }
    $scope.close = function () {
        if ($scope.updated) {
            $scope.refresh();
        } else {
            $scope.$modalInstance.close();
        }
    };
    /** 
     *Update module in the database if the new values for the attributes are acceptable input.
     */
    $scope.updateModule = function () {
        var code = $.trim($("#module_code").val());
        var name = $.trim($('#module_name').val());
        var descr = $.trim($("#description_box").val());
        var year = $.trim($("#select_year option:selected").text());
        var credits = $.trim($("#select_credits option:selected").text());
        var day = $.trim($("#select_day option:selected").text());
        var time = $.trim($("#input_time").val());
        var cw = $.trim($("#cw_perc_input").val());
        var faculty = $.trim($("#select_faculty option:selected").text());
        if (day == "Day of Lecture") {
            day = "";
        }
        if (time.length == 0) {
            time = "00:00:00";
        }
        if (cw.length == 0) {
            cw = "0";
        }
        if (cw.includes("%")) {
            cw = cw.replace("%", "");
        }

        if (code.length == 0) {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Module Code </p>");
        } else if (name.length == 0) {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Module Name </p>");
        } else if (descr.length == 0) {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Description </p>");
        } else if (year == "Level") {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select a Module Level </p>");
        } else if (credits == "Credits") {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select Credits </p>");
        } else if (!(new RegExp("^((([01]{1}[0-9]{1})|([2]{1}[0-3]{1}))([:]?[0-5]{1}[0-9]{1}){2})$").test(time))) {
            $("#error_reporter").html("<p class='alert'> <i class='glyphicon glyphicon-warning-sign'></i> Wrong Time Format.  <br/> Please Enter Lecture Time following the pattern HH:MM:SS. </p>");
        } else if (faculty == "Faculty") {
            $("#error_reporter").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select Faculty </p>");
        } else {
            if (tagsChanged) {
                var toAdd = arrayDifference(tagged, initialSetUnchanged);
                var toDelete = arrayDifference(initialSetUnchanged, tagged);
                for (var i = 0; i < toAdd.length; ++i) {
                    var tag = toAdd[i].trim();
                    $http.post("/api/modules/" + code + "/tags", {
                        "tagName": tag
                    }).then(function successCallback(response) {}, function errorCallback(response) {
                        console.log("Failed To Unassign " + tag + " From Module " + code);
                    });
                }
                for (var i = 0; i < toDelete.length; ++i) {
                    var tag = toDelete[i].trim();
                    var method = "/api/modules/" + code + "/tags/" + tag;
                    $http.delete(method).then(function successCallback(response) {}, function errorCallback(response) {});
                }
            }
            $http.put("/api/modules/" + $scope.id, {
                "moduleID": code,
                "moduleName": name,
                "year": parseInt(year),
                "credits": parseInt(credits),
                "lectureDay": day,
                "lectureTime": time,
                "description": descr,
                "courseworkPercentage": parseFloat(cw),
                "faculty": faculty
            }).then(function successCallback(response) {
                $scope.updated = true;
                window.setTimeout(function () {
                    location.reload()
                }, 1800);
                $("#error_reporter").html("<p style='width:80%' class='alert success'>Module " + code + " Successfully Updated <p/>");

            }, function errorCallback() {
                $("#error_reporter").html("<p style='width:80%' class='alert'>Something went wrong... <p/>");
            });

        }
    }
}]);