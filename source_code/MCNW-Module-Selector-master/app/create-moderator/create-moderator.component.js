var content = {
    controller: function ($http, $window, $scope) {
        $http.get('/api/users').then(function (response) {
            $scope.users = response.data;
        });

        $("title").html("Update Access Group");

        /**
        *Called when the user wishes to submit the access group changes. Function validates the input and if succeeded pushes the data to the database.
        */
        $("#create_moderator_btn").click(function () {
            var user = $("#user option:selected").text();
            var access_group = $("#access_group option:selected").text();
            var access_group_value;

            if (access_group == "Administrator") {
                access_group_value = 0;
            } else if (access_group == "Moderator") {
                access_group_value = 1;
            } else {
                access_group_value = 2;
            }

            if (user == "Select User") {
                $("#create-mod-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Select A User</p>");
            } else if (access_group == "Select User Access Group") {
                $("#create-mod-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Select A User Access Group</p>");
            } else {
                $http.put("/reset_access_group", {
                    "userID": user.match(/\(([^)]+)\)/)[1],
                    "accessGroup": access_group_value
                }).then(function successCallback(response) {
                    $("#create-mod-span").html("<p style='width:30%;margin-top:15%' class='alert success'> " + user.match(/([^)]+)\(/)[1] + "'\s Access Group Has Been Updated To " + access_group + "  </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Update Another Access Group </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");
                }, function errorCallback(response) {
                    $("#create-mod-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Something went wrong</p>");
                });
            }
        });
    },
    templateUrl: "create-moderator/create-moderator.template.html"
}

angular.module('createModerator', ['ngRoute']).component('createModerator', content);