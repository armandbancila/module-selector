'use strict';

describe('trackModules', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('trackModules'));
    beforeEach(module('moduleSelector'));
    
    describe('TrackModulesController', function () {
        var $httpBackend, ctrl;
        
         beforeEach(inject(function ($componentController, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
             
              $httpBackend.expectGET('/logged_in').respond({
                "UserID": "irid94@gmail.com",
                "FName": "Irid",
                "LName": "Kotoni",
                "AccessGroup": 2
            });
            $httpBackend.expectGET('/api/users/irid94@gmail.com/modules').respond({
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
            
             $httpBackend.expectGET('/api/modules/tags?module=4CCS1DBS&module=4CCS1LOD&').respond({
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
//            $httpBackend.expectGET('/api/modules/tags?').respond(
//               [{"TagName":"Astrology","Category":"Careers"},{"TagName":"BSc","Category":null}]
//            );
//             
//             $httpBackend.expectGET('/api/modules/tags?').respond(
//               [{"TagName":"Astrology","Category":"Careers"},{"TagName":"BSc","Category":null}]
//            );
             
             ctrl = $componentController('trackModules');
         }));
        
        it("should define 'user' as 'irid94@gmail.com' after the GET request", function () {
            expect(ctrl.user).toBeUndefined();
            
            $httpBackend.flush();
            
            expect(ctrl.user).toBeDefined();
            expect(ctrl.user).toBe('irid94@gmail.com');
               
        });
        
        it("should define 'tModules' and have a length of 2 after the GET request /api/users/irid94@gmail.com/modules", function () {
            expect(ctrl.tModules).toBeUndefined();
            
            $httpBackend.flush();
            
            expect(ctrl.tModules).toBeDefined();
            expect(ctrl.tModules.length).toBe(2);
               
        });
        
         it("should define 'tCategoryToTag' and 'tTagCategories' and expect tTagCategories lenght to be 1", function () {
            expect(ctrl.tCategoryToTag).toBeUndefined();
             expect(ctrl.tTagCategories).toBeUndefined();
            
            $httpBackend.flush();
            
            expect(ctrl.tCategoryToTag).toBeDefined();
             
            expect(ctrl.tTagCategories.length).toBe(1); 
             
             expect(ctrl.tTagCategories).toBeDefined();
             
        });
        
        it("should expect 'tTagCategories' lenght to be 1", function () {
             expect(ctrl.tTagCategories).toBeUndefined();
            
            $httpBackend.flush();
             
            expect(ctrl.tTagCategories.length).toBe(1); 
             
        });
        
        it("should populate 'tModules' with all modules with 'All' tag", function () {
             expect(ctrl.tModules).toBeUndefined();
            
            $httpBackend.flush();
            
            ctrl.pressedTag('All');
             
            expect(ctrl.tModules.length).toBe(2); 
             
        });
        
        it("should expect tModules to have length of 2 after calling tracked()", function () {
             expect(ctrl.tModules).toBeUndefined();
            
            $httpBackend.flush();
            
            ctrl.tracked();
             
            expect(ctrl.tModules.length).toBe(2); 
             
        });
        
    });
});