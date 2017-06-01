'use.strict';
angular.
module('departmentSelector', ['ngRoute']).
component('departmentSelector', {
    templateUrl: 'department-selector/department-selector.template.html',
    controller: function DepartmentSelectorController(Faculty) {

        var self = this;
        $("title").html("Select Faculty");

        this.facultys = [{
                Faculty: 'Faculty of Arts & Humanities'
        }, {
                Faculty: 'Dental Institute'
        }, {
                Faculty: 'Faculty of Life Sciences & Medicine'
        }, {
                Faculty: 'Institute of Psychiatry, Psychology & NeuroScience'
        }, {
                Faculty: "The Dickson Poon School of Law"
        }, {
                Faculty: "Faculty of Natural & Mathematical Sciences"
        }, {
                Faculty: "Florence Nightingale Faculty of Nursing & Midwifery"
        }, {
                Faculty: "Faculty of Social Science & Public Policy"
        }];
        
        this.filter = function filter(facultyName) {
            var faculty = facultyName.replace(/&/g, 'and');
            Faculty.set(faculty);
        }

    }

});