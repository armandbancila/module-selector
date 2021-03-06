//'use strict';
//
//describe('editModule', function () {
//
//    // Load the module that contains the `phoneList` component before each test
//    beforeEach(module('moduleList'));
//    beforeEach(module('moduleSelector'));
//
//    describe('EditModuleController', function () {
//        var $httpBackend, ctrl;
//
//        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
//        // This allows us to inject a service and assign it to a variable with the same name
//        // as the service while avoiding a name conflict.
//        beforeEach(inject(function ($componentController, _$httpBackend_) {
//            $httpBackend = _$httpBackend_;
//            
//                        
//            $httpBackend.expectGET('/api/modules').respond({
//                "data": [{
//                    "ModuleID": "4CCS1DBS",
//                    "Name": "Database Systems",
//                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
//                    "Year": 4,
//                    "Credits": 15,
//                    "Lecture_day": "Thursday",
//                    "Lecture_time": null,
//                    "Coursework_percentage": 80
//            }, {
//                    "ModuleID": "4CCS1LOD",
//                    "Name": "Logic Design",
//                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
//                    "Year": 4,
//                    "Credits": 15,
//                    "Lecture_day": "Wednesday",
//                    "Lecture_time": null,
//                    "Coursework_percentage": 15
//            }]
//            });
//            
//                                   
//           
//         
//         
////            $httpBackend.expectGET('/api/modules').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }, {
////                    "ModuleID": "4CCS1LOD",
////                    "Name": "Logic Design",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Wednesday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 15
////            }]
////            });
////
////            $httpBackend.expectGET('/api/modules?per_page=5&page=0').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }, {
////                    "ModuleID": "4CCS1LOD",
////                    "Name": "Logic Design",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Wednesday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 15
////            }]
////            });
////            
////            $httpBackend.expectGET('/api/modules').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }, {
////                    "ModuleID": "4CCS1LOD",
////                    "Name": "Logic Design",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Wednesday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 15
////            }]
////            });
////            
////            $httpBackend.expectGET('/logged_in').respond({
////                "UserID": "tawil.hani@gmail.com",
////                "FName": "Hani",
////                "LName": "Tawil",
////                "AccessGroup": 2
////            });
////            
//
////            
////            $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/modules').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }]
////            });
////            
////            $httpBackend.expectGET('/api/modules?per_page=5&faculty=null&page=0').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }, {
////                    "ModuleID": "4CCS1LOD",
////                    "Name": "Logic Design",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Wednesday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 15
////            }]
////            });
////            
////            $httpBackend.expectGET('/api/modules?per_page=5&faculty=null&page=0').respond({
////                "data": [{
////                    "ModuleID": "4CCS1DBS",
////                    "Name": "Database Systems",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pellentesque ligula vitae ligula accumsan tincidunt. In sagittis lacus nibh, non consectetur nisi convallis non. Morbi ultrices pretium risus sit metus.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Thursday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 80
////            }, {
////                    "ModuleID": "4CCS1LOD",
////                    "Name": "Logic Design",
////                    "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sem tellus, pellentesque nec placerat sit amet, convallis id orci. Cras posuere suscipit magna, sed vestibulum enim.",
////                    "Year": 4,
////                    "Credits": 15,
////                    "Lecture_day": "Wednesday",
////                    "Lecture_time": null,
////                    "Coursework_percentage": 15
////            }]
////            });
//
//
//
//            //            $httpBackend.expectGET('/api/tags').respond([{
//            //                Name: "BCs"
//            //        }, {
//            //                Name: "MSc"
//            //        }]);
//
//            ctrl = $componentController('editModule');
//        }));
//
//        it('should create a `modules` property with 2 modules fetched with `$http`', function () {
//            expect(ctrl.modules).toBeUndefined();
//
//            $httpBackend.flush();
//            expect(ctrl.modules.length).toBe(2);
//        });
//
//        it('should set a default value for the `orderProp` property', function () {
//            expect(ctrl.orderProp).toBe('Name');
//        });
//
//        //    it('can get an instance of my factory', inject(function (Store) {
//        //        expect(myFactory).toBeDefined();
//        //    }));
//        //});
//    });
//
//});