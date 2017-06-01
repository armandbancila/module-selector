'use strict';

describe('createCourse', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('createCourse'));
    beforeEach(module('moduleSelector'));

    describe('CreateCourseController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('createCourse',{'$scope': scope});
        }));
        
        it("should define 'selectedModules' and 'updated' ",function(){
            expect(scope.selectedModules).toBeDefined();
            expect(scope.updated).toBe(false);
        })
        
        it("should expect to define and populate 'modules' after the GET request '/api/modules' ",function(){
            expect(scope.modules).toBeUndefined();
            
            $httpBackend.expectGET('/api/modules').respond({
                "data": [{
                    "ModuleID": "4CCS1DBS",
                    "Name": "Database Systems",
                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
                    "Year": 4,
                    "Credits": 15,
                    "Lecture_day": "Thursday",
                    "Lecture_time": null,
                    "Coursework_percentage": 80
            }, {
                    "ModuleID": "4CCS1LOD",
                    "Name": "Logic Design",
                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
                    "Year": 4,
                    "Credits": 15,
                    "Lecture_day": "Wednesday",
                    "Lecture_time": null,
                    "Coursework_percentage": 15
            }]
            });
            
            $httpBackend.flush();
            
            expect(scope.modules.length).toBe(2);
        })
        
    });
});
