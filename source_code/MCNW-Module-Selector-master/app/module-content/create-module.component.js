var content = {
    controller: function ($http, $window, $scope) {
        var tagged = [];

        $scope.back = function () {
            $window.history.back();
        };

        $("title").html("Create Module");

        $('#create_module_btn').html("Create Module");

        $("#selector").click(function () {
            $("#tag_assign_label").attr("disabled", true);
        });

        $("#select-year").click(function () {
            $("#year_label").attr("disabled", true);
        });

        $("#select_credits").click(function () {
            $("#credit_label").attr("disabled", true);
        });

        $("#select_day").click(function () {
            $("#day_label").attr("disabled", true);
        });

        $http.get('/api/tags').then(function (response) {
            $scope.tags = response.data;
        });

        /**
        *Called when the user wishes to submit the new module they have created. Function validates the input and if succeeded pushes the data to the database.
        */
        $("#create_module_btn").click(function () {
            var code = $.trim($("#module_code").val());
            var name = $.trim($('#module_name').val());
            var descr = $.trim($("#description_box").val());
            var year = $.trim($("#select_year option:selected").text());
            var credits = $.trim($("#select_credits option:selected").text());
            var day = $.trim($("#select_day option:selected").text());
            var time = $.trim($("#time_input").val());
            var cw = $.trim($("#cw_perc_input").val());
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

            var exam = $("#exam_perc_input").val();
            var faculty = $("#select_faculty option:selected").text();

            if (code.length == 0) {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Module Code </p>");
            } else if (name.length == 0) {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Module Name </p>");
            } else if (descr.length == 0) {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Enter a Description </p>");
            } else if (year == "Level") {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select a Module Level </p>");
            } else if (credits == "Credits") {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select Credits </p>");
            } else if (!(new RegExp("^((([01]{1}[0-9]{1})|([2]{1}[0-3]{1}))([:]?[0-5]{1}[0-9]{1}){2})$").test(time))) {
                $("#alert_place").html("<p class='alert'> <i class='glyphicon glyphicon-warning-sign'></i> Wrong Time Format.  <br/> Please Enter Lecture Time following the pattern HH:MM:SS. </p>");
            } else if (faculty == "Faculty") {
                $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select Faculty </p>");
            } else {
                $http.post("/api/modules", {
                    "moduleID": code,
                    "moduleName": name,
                    "year": year,
                    "credits": credits,
                    "lectureDay": day,
                    "lectureTime": time,
                    "description": descr,
                    "courseworkPercentage": cw,
                    "faculty": faculty
                }).then(function successCallback(response) {
                    for (var i = 0; i < tagged.length; i++) {
                        $http.post("/api/modules/" + code + "/tags", {
                            "tagName": tagged[i].substring(1, tagged[i].length - 1)
                        }).then(function (response) {});
                    }

                    $("#module-content-span").html("<center><p style='width:30%;margin-top:15%' class='alert success'>Course " + code + " Has Been Added Successfully <p/><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Add Another Module </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script><center>");

                }, function errorCallback(response) {
                    console.log(response.data);
                    $("#alert_place").html("<p class='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Make Sure You Have Provided Correct Input </p>");
                });
            }
        });

        /**
        *If a tag is selected from the dropdown, it is removed from the list of options and added to the tag span as well as 
        *the list of tags to add to this module. If the cross on a tag is clicked, removes the tag from the span of tags as well as 
        *the list of tags to add to this module and puts it back into the dropdown.
        */
        $scope.moveTags = function () {
            var pan = document.getElementById("tag_bed");
            var selector = document.getElementById("selector");
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
    },
    templateUrl: "module-content/module-content.template.html"
}

angular.module('createModule', ['ngRoute']).component('moduleContent', content);