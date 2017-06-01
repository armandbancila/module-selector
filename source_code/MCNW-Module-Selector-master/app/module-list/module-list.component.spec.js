'use strict';

describe('moduleList', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('moduleList'));
    beforeEach(module('moduleSelector'));

    describe('ModuleListController', function () {
        var $httpBackend, ctrl;

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service and assign it to a variable with the same name
        // as the service while avoiding a name conflict.
        beforeEach(inject(function ($componentController, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            
            $httpBackend.expectGET('/api/modules?per_page=5&page=0').respond({
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
            
             $httpBackend.expectGET('/api/modules?').respond({
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
            
            $httpBackend.expectGET('/logged_in').respond({
                "UserID": "tawil.hani@gmail.com",
                "FName": "Hani",
                "LName": "Tawil",
                "AccessGroup": 2
            });
            
              $httpBackend.expectGET('/api/modules?').respond({
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




            ctrl = $componentController('moduleList');
        }));

        it('should create a `modules` property with 2 modules fetched with `$http`', function () {
            expect(ctrl.modules).toBeUndefined();

            $httpBackend.flush();
            expect(ctrl.modules.length).toBe(2);
        });

        it('should set a default value for the `orderProp` property', function () {
            expect(ctrl.orderProp).toBe('Name');
        });
        
        describe('Filtering via tags, level, search and credits', function(){
            
            it('should collect the correct amount of credits', function() {
                expect(ctrl.allCredits).toEqual([]);
                $httpBackend.flush();
                expect(ctrl.allCredits.length).toBe(1);
            })
            
            it('should display the correct amount of years', function(){
                expect(ctrl.year4).toBe(false);
                expect(ctrl.year5).toBe(false);
                expect(ctrl.year7).toBe(false);
                expect(ctrl.year8).toBe(false);
                
                $httpBackend.flush();
                expect(ctrl.year4).toBe(false);
                expect(ctrl.year5).toBe(true);
                expect(ctrl.year7).toBe(true);
                expect(ctrl.year8).toBe(true);
                
            })
            
             it("should populate 'gQuery' after function 'pressedTag()' is called ", function () {
            expect(ctrl.gQuery).toBe('');
                 $httpBackend.flush();
                 ctrl.pressedTag();
                 expect(ctrl.gQuery).not.toBe('');
        });
            
            it("should populate 'yearQuery' after function 'filterYear()' is called ", function () {
            expect(ctrl.yearQuery).toBe('');
                 $httpBackend.flush();
                 ctrl.filterYear();
                 expect(ctrl.yearQuery).not.toBe('');
        });
            
             it("should populate 'creditQuery' after function 'filterCredit()' is called ", function () {
            expect(ctrl.creditQuery).toBe('');
                 $httpBackend.flush();
                 ctrl.filterCredit();
                 expect(ctrl.creditQuery).not.toBe('');
        });
            
             it("should keep 'facultyQuery' and myFaculty empty since no faculty was selected", function () {
            expect(ctrl.facultyQuery).toBe('');
                 expect(ctrl.myFaculty).toBe(null);
                 $httpBackend.flush();
                 
                 expect(ctrl.facultyQuery).toBe('');
                 expect(ctrl.myFaculty).toBe(null);
        });
            
            it("should decrement 'currentPage' when 'prev()' function is called", function () {
            expect(ctrl.currentPage).toBe(1);
                 $httpBackend.flush();
                 ctrl.prev();
                 expect(ctrl.currentPage).toBe(0);
        });
            it("should increment 'currentPage' when 'next()' function is called", function () {
            expect(ctrl.currentPage).toBe(1);
                 $httpBackend.flush();
                 ctrl.next();
                 expect(ctrl.currentPage).toBe(2);
        });
            
            
            
            it("should define 'tagCategories' after calling the GET request api/modules?null ", function(){
            expect(ctrl.tagCategories).toBeUndefined();
               
                $httpBackend.flush();
                            
            $httpBackend.expectGET('/api/modules?null').respond(
            []
            );
                
                 
                
                expect(ctrl.tagCategories).toBeDefined();
            })
            
            
             it("should define 'categoryToTag' after calling the GET request api/modules?null ", function(){
            expect(ctrl.categoryToTag).toBeUndefined();
               
                $httpBackend.flush();
                            
            $httpBackend.expectGET('/api/modules?null').respond(
            []
            );
                
                 
                
                expect(ctrl.categoryToTag).toBeDefined();
            })
           
            
        })


    });

});