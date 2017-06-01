var content = {
    controller: function ($http, $window, $scope) {
        $http.get('/api/tags/categories').then(function (response) {
            $scope.categories = response.data;
        });

        $("title").html("Create Tags");

        $("#select_category").change(function () {
            var get_category = $("#select_category option:selected").text();
            if (get_category == "New Category") {
                $("#category").css("visibility", "visible");
                $(".create_req_btn").css("margin-top", "2em");
            } else {
                $("#category").css("visibility", "hidden");
                $(".create_req_btn").css("margin-top", "0em");
            }
        });

        /**
        *Used to capitalise the tags to make sure they all look uniform.
        *@param {string} tag - The string in which you want to capitalize;
        */
        function capitalize(tag) {
            return tag.toLowerCase().replace(/\b./g, function (a) {
                return a.toUpperCase();
            });
        };

        /**
        *Called when the user wishes to submit the new tag. Function validates the input and if succeeded pushes the data to the database.
        */
        $("#create-tag-button").click(function () {
            var tag_name = $('#tag-name').val();
            var _category = $("#select_category option:selected").text();
            var newCategory = $("#new-category-name").val();

            if (tag_name.length == 0) {
                $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Enter A Tag Name</p>");
            } else if (_category == "New Category" && newCategory.length == 0) {
                $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Create A Tag Category</p>");
            } else if (newCategory.length != 0) {
                $http.post("/api/tags", {
                    "tagName": tag_name,
                    "category": newCategory,
                }).then(function successCallback(response) {
                    $("#create-tags-span").html("<p style='width:30%;margin-top:15%' class='alert success'> " + capitalize(tag_name) + " Has Been Added To Category " + newCategory + "  </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Add Another Tag </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");
                }, function errorCallback(response) {
                    $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Tag Name Already Exists, Please Try Again</p>");
                });
            } else if (_category == "Category") {
                $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Select A Category</p>");
            } else {
                $http.post("/api/tags", {
                    "tagName": tag_name,
                    "category": _category,
                }).then(function successCallback(response) {
                    $("#create-tags-span").html("<p style='width:30%;margin-top:15%' class='alert success'> " + capitalize(tag_name) + " Has Been Added To Category " + _category + "  </p><br/> <label style='width:260px !important' class='btn submit_req_btn' id='reloadBtn'> Add Another Tag </label><script>$('#reloadBtn').click(function(){window.location.reload();});</script>");
                }, function errorCallback(response) {
                    $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Tag Name Already Exists, Please Try Again</p>");
                });
            }
        });
    },
    templateUrl: "create-tags/create-tags.template.html"
}

angular.module('createTags', ['ngRoute']).component('createTags', content);