angular.
module('tracker').
component('tracker', {
    templateUrl: 'tracker/tracker.template.html',
    controller: function TrackerController($http) {
        this.greeting = "<Header/Navbar Placeholder>";

        this.selected = function selected(iD) {
            if (iD == 'track') {
                document.getElementById('buildContainer').classList.remove("underline");
                document.getElementById('trackContainer').classList.add('underline');
            } else {
                document.getElementById('buildContainer').classList.add("underline");
                document.getElementById('trackContainer').classList.remove('underline');
            }
        }
    }
})