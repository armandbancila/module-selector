angular.
module('feedback', []).
component('feedback', {
    templateUrl: 'feedback/feedback.template.html',
    controller: function FeedbackController($http, $scope, $window) {
        $("title").html("Student Feedback");
        
        /**
        *Retrieves the data of all the feedback when the page is first loaded up.
        */
        $scope.downloadFeedback = function () {
            var a = document.createElement("a"),
                file = new Blob([JSON.stringify($scope.feedback)], {
                    type: 'application/json'
                });
            if ($window.navigator.msSaveOrOpenBlob)
                $window.navigator.msSaveOrOpenBlob(file, "feedback.json");
            else {
                var url = URL.createObjectURL(file);
                a.href = url;
                a.download = "feedback.json";
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    $window.URL.revokeObjectURL(url);
                }, 0);
            }
        }

        /** 
        *Returns only the first 10 characters of a string.
        */
        $scope.removeTimeFromDate = function (str) {
            return str.substr(0, 10);
        }

        /**
        *Deletes the feedback from the database.
        */
        $scope.clearAllFeedback = function () {
            var confirmed = confirm("Are You Sure You Want To Permanently Delete All Feedback?");
            if (confirmed) {
                var noReps = [];
                for (var i = 0; i < $scope.feedback.length; ++i) {
                    var day = $scope.feedback[i].Day;
                    if (!noReps.includes(day)) {
                        noReps.push(day);
                    }
                }
                for (var i = 0; i < noReps.length; ++i) {
                    $http.delete("/api/users/feedback/?before_date=" + noReps[i].substr(0, 10));
                }
                $window.location.reload();
            }
        }

        $http.get("/api/users/feedback").then(
            function successCallBack(response) {
                $scope.feedback = response.data;
                if ($scope.feedback.length == 0) {
                    $("#no-feedback-mesage").css("display", "block");
                    $("#feedback-section").css("display", "none");
                } else {
                    $("#feedback-section").css("display", "block");
                    $("#no-feedback-mesage").css("display", "none");
                }
            },
            function errorCallBack(response) {
                alert("Make Sure You Have Permission To View This Page");
            });
    }
});