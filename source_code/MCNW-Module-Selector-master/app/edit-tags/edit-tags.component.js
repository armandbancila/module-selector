var editTags = angular.
module('editTags', ['ngRoute']);
editTags.component('editTags', {
    templateUrl: 'edit-tags/edit-tags.template.html',
    controller: function EditTagsController($http, $scope, $uibModal, $window) {
        $("title").html("Edit Tags");
        var self = this;
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
        $http.get('/api/tags/categories').then(function (response) {
            $scope.categories = response.data;
        });

        function refreshTags() {
            $http.get("/api/tags").success(function (data) {
                $scope.tags = data;
                //pagination
                var pagesShown = 1;
                var pageSize = 18;
                $scope.paginationLimit = function (data) {
                    return pageSize * pagesShown;
                };
                $scope.hasMoreItemsToShow = function () {
                    return pagesShown < ($scope.tags.length / pageSize);
                };
                $scope.showMoreItems = function () {
                    pagesShown = pagesShown + 1;
                };
            }).error(function (response, status) {
                console.log("The Request Failed With Response " + response + " And Status Code " + status);
            })
        }

        refreshTags();

        this.removeTag = function (event) {
            var name = $(event.target).parent().children("span").text();
            var confrimed = confirm("Permanently Delete Tag " + name + "?");
            if (confrimed) {
                // get the parent of this icon, which is the tag container
                // now get the child of it that's a span (which contains the tag name)
                // get its text content, which is the TagName property of this tag
                $.ajax({
                    url: 'api/tags/' + name,
                    type: 'DELETE',
                    success: function (result) {
                        refreshTags();
                    }
                });
                refreshTags();
            }
        };

        this.createTagButton = function () {
            addTag(this.tagName);
            refreshTags();
            $("#create-tag-button").blur(); // now the buttons won't stay pressed after you click on them once
        };
        // catch event, do something
        $scope.$on('ngRepeatFinished', function () {
            $scope.equalizeHeights(".module-style-tag");
        });

        $scope.open = function (tag, category) {
            $scope.tagname = tag;
            $scope.tagcategory = category;
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'edit-tags/edit-tag-modal.template.html',
                controller: 'ModalController',
                scope: $scope
            });
        }
    }
});

/**
 *$timeout is the way to execute stuff after angular is done with the view
 *I tried $last but that one was stopping right before the {{code}} parts were about to be executed.
 */
editTags.directive('afterNgRepeat', function ($timeout) {
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

editTags.controller('ModalController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    var counter = 0;
    var initalTagName = '';
    $scope.tester = '';
    $scope.mouseDown = function () {
        if (counter == 0) {
            initalTagName = $("#tag_name").val();
        }
        counter++;
    }

    $scope.test = function () {
        if ($scope.tester == 'new') {
            $("#category").css("visibility", "visible");
            $(".create_req_btn").css("margin-top", "2em");
        } else {
            $("#category").css("visibility", "hidden");
            $(".create_req_btn").css("margin-top", "0em");
        }
    };

    $scope.close = function () {
        $scope.$modalInstance.close();
    };

    /**
     *Update tag category. 
     */
    $scope.updateTag = function () {
        var tag = $("#tag_name").val();
        var cat = $("#tag_category option:selected").text();
        var newCat = $("#new-category-name").val();
        $http.put("/api/tags/" + tag, {
            "tagName": tag,
            "category": cat
        }).then(function successCallback(response) {
            $("#tag-message-alert").html("<p style='width:100%;margin-top:5%' class='alert success'> " + tag + " Has Been Added To Category " + cat + "  </p>");
            window.setTimeout(function () {
                location.reload()
            }, 2500)
        }, function errorCallback(response) {
            $("#tag-message-alert").html("<p class='alert'><i style='padding-right:15px' class='glyphicon glyphicon-warning-sign'></i>Please Try Again</p>");
        });
    }
}]);