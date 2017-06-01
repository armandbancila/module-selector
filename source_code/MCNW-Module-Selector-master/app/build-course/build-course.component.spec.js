'use strict';

describe('buildCourse', function () {


    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('buildCourse'));
    beforeEach(module('moduleSelector'));

    describe('BuildCourseController', function () {
        var $httpBackend, ctrl, scope, controller;

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service and assign it to a variable with the same name
        // as the service while avoiding a name conflict.
        beforeEach(inject(function ($componentController, _$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();

            ctrl = $componentController('buildCourse', {
                '$scope': scope
            });
        }));

        describe('User tawil.hani@gmail.com using build course page', function () {

            beforeEach(inject(function ($componentController, _$httpBackend_) {
                $httpBackend.expectGET('/logged_in').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                });

                $httpBackend.expectGET('/logged_in').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                });

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/modules').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                })

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/degrees').respond([
                    {
                        "DegreeTitle": "BSc Computer Science"
                    },
                    {
                        "DegreeTitle": "BSc Computer Science with Management"
                    },
                    {
                        "DegreeTitle": "MSci Computer Science"
                    }
                ])

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/builds').respond([
                    {
                        "components": [
                            {
                                "ModuleID": "4CCS1FC1",
                                "Evaluated": "Compulsory",
                                "Name": "Foundations of Computing 1",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 4,
                                "Credits": 15,
                                "LectureDay": "Monday",
                                "LectureTime": "14:00:00",
                                "CourseworkPercentage": 0,
                                "Faculty": "Faculty of Natural and Mathematical Sciences"
                            },
                            {
                                "ModuleID": "4SSMN110",
                                "Evaluated": "Compulsory",
                                "Name": "Economics",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 4,
                                "Credits": 15,
                                "LectureDay": "Tuesday",
                                "LectureTime": "13:00:00",
                                "CourseworkPercentage": 40,
                                "Faculty": "Faculty of Social Science and Public Policy"
                            },
                            {
                                "ModuleID": "5CCS2SEG",
                                "Evaluated": "Compulsory",
                                "Name": "Software Engineering Group Project",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 5,
                                "Credits": 30,
                                "LectureDay": "Monday",
                                "LectureTime": "12:00:00",
                                "CourseworkPercentage": 85,
                                "Faculty": "Faculty of Natural and Mathematical Sciences"
                            },
                            {
                                "ModuleID": "5SSMN210",
                                "Evaluated": "Compulsory",
                                "Name": "Accounting",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 5,
                                "Credits": 15,
                                "LectureDay": "Friday",
                                "LectureTime": "09:00:00",
                                "CourseworkPercentage": 20,
                                "Faculty": "Faculty of Social Science and Public Policy"
                            }
                         ],
                        "buildID": 39,
                        "template": "BSc Computer Science with Management",
                        "recommended": []
                        }
                    ]);

                $httpBackend.expectGET('/api/degrees/BSc Computer Science with Management/modules').respond([
                    {
                        "ModuleID": "4CCS1FC1",
                        "IsOptional": 0,
                        "Name": "Foundations of Computing 1",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 4,
                        "Credits": 15,
                        "LectureDay": "Monday",
                        "LectureTime": "14:00:00",
                        "CourseworkPercentage": 0,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "4SSMN110",
                        "IsOptional": 0,
                        "Name": "Economics",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 4,
                        "Credits": 15,
                        "LectureDay": "Tuesday",
                        "LectureTime": "13:00:00",
                        "CourseworkPercentage": 40,
                        "Faculty": "Faculty of Social Science and Public Policy"
                    },
                    {
                        "ModuleID": "5CCS1INS",
                        "IsOptional": 1,
                        "Name": "Internet Systems",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 15,
                        "LectureDay": "Thursday",
                        "LectureTime": "13:00:00",
                        "CourseworkPercentage": 20,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "5CCS2SEG",
                        "IsOptional": 0,
                        "Name": "Software Engineering Group Project",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 30,
                        "LectureDay": "Monday",
                        "LectureTime": "12:00:00",
                        "CourseworkPercentage": 85,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "5SSMN210",
                        "IsOptional": 0,
                        "Name": "Accounting",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 15,
                        "LectureDay": "Friday",
                        "LectureTime": "09:00:00",
                        "CourseworkPercentage": 20,
                        "Faculty": "Faculty of Social Science and Public Policy"
                    },
                    {
                        "ModuleID": "BlahBig",
                        "IsOptional": 1,
                        "Name": "blah",
                        "Description": null,
                        "Year": 5,
                        "Credits": 200,
                        "LectureDay": null,
                        "LectureTime": null,
                        "CourseworkPercentage": null,
                        "Faculty": null
                    }
                ])

                $httpBackend.expectGET('/api/degrees/BSc Computer Science with Management').respond([
                    {
                        "DegreeTitle": "BSc Computer Science with Management",
                        "LengthOfStudy": 3
                    }
                ])
            }));

            it('should have user logged in as tawil.hani@gmail.com', function () {
                expect(ctrl.user).toBeUndefined();

                $httpBackend.flush();

                expect(ctrl.user.UserID).toBe('tawil.hani@gmail.com');
            })

            it('should have the list of degrees be of size 3', function () {
                expect(ctrl.userDegrees).toBeUndefined();

                $httpBackend.flush();

                expect(ctrl.userDegrees.length).toBe(3);
            })

            describe('the correct parsing of a degree', function () {

                it('should return the correct number of modules in the BSc Computer Science with Management degree', function () {
                    expect(ctrl.cache['BSc Computer Science with Management']).toBeUndefined();

                    $httpBackend.flush();
                    expect(ctrl.cache['BSc Computer Science with Management'].length).toBe(6);
                })

                it('should calculate the correct starting level of the BSc Computer Science degree with Management', function () {
                    expect(ctrl.cache['BSc Computer Science with Management']).toBeUndefined();

                    $httpBackend.flush();
                    expect(ctrl.cache['BSc Computer Science with Management'].startingYear).toBe(4);
                })

                it('should have all drawers shut and set to false when the page is opened', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].IsDrawOpen[0]).toBe(false);
                    expect(ctrl.courses[0].IsDrawOpen[1]).toBe(false);
                    expect(ctrl.courses[0].IsDrawOpen[2]).toBe(false);
                })

                it('should have all chosen counts set to 0', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].chosenCount[0]).toBe(0);
                    expect(ctrl.courses[0].chosenCount[1]).toBe(0);
                    expect(ctrl.courses[0].chosenCount[2]).toBe(0);
                })

                it('should contain 2 options in the second year and no options in any other year', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].options[0].length).toBe(0);
                    expect(ctrl.courses[0].options[1].length).toBe(2);
                    expect(ctrl.courses[0].options[2].length).toBe(0);
                })

                it('should contain the correct options for the second year', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].options[1]).toEqual([Object({
                        ModuleID: '5CCS1INS',
                        IsOptional: 1,
                        Name: 'Internet Systems',
                        Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.',
                        Year: 5,
                        Credits: 15,
                        LectureDay: 'Thursday',
                        LectureTime: '13:00:00',
                        CourseworkPercentage: 20,
                        Faculty: 'Faculty of Natural and Mathematical Sciences'
                    }), Object({
                        ModuleID: 'BlahBig',
                        IsOptional: 1,
                        Name: 'blah',
                        Description: null,
                        Year: 5,
                        Credits: 200,
                        LectureDay: null,
                        LectureTime: null,
                        CourseworkPercentage: null,
                        Faculty: null
                    })]);
                })

                it('should contain no recommended modules', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].recommended).toEqual([]);
                })

                it('should have the template of that build to be the same as the name of the degree', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].template).toBe('BSc Computer Science with Management');
                })

                it('should sum the cumpolsury modules in the new build as well as compare it to the correct credit limit of that year', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].yearCredits[0]).toBe('30/120');
                    expect(ctrl.courses[0].yearCredits[1]).toBe('45/120');
                    expect(ctrl.courses[0].yearCredits[2]).toBe('0/120');
                })

                it('should organise the modules in correct years', function () {
                    expect(ctrl.courses[0]).toBeUndefined();

                    $httpBackend.flush();

                    expect(ctrl.courses[0].years[0].length).toBe(2);
                    expect(ctrl.courses[0].years[1].length).toBe(2);
                    expect(ctrl.courses[0].years[2].length).toBe(0);
                    expect(ctrl.courses[0].years[0][0].ModuleID).toBe('4CCS1FC1');
                    expect(ctrl.courses[0].years[0][1].ModuleID).toBe('4SSMN110');
                    expect(ctrl.courses[0].years[1][0].ModuleID).toBe('5CCS2SEG');
                    expect(ctrl.courses[0].years[1][1].ModuleID).toBe('5SSMN210');
                })
                
                it('test', function () {
                    expect(scope.hani).toBe('Hani');
                })
                
                

        })

        describe('interacting with module options', function () {

            beforeEach(inject(function ($componentController, _$httpBackend_) {
                $httpBackend.expectGET('/logged_in').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                });

                $httpBackend.expectGET('/logged_in').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                });

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/modules').respond({
                    "UserID": "tawil.hani@gmail.com",
                    "FName": "Hani",
                    "LName": "Tawil",
                    "AccessGroup": 0
                })

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/degrees').respond([
                    {
                        "DegreeTitle": "BSc Computer Science"
                    },
                    {
                        "DegreeTitle": "BSc Computer Science with Management"
                    },
                    {
                        "DegreeTitle": "MSci Computer Science"
                    }
                ])

                $httpBackend.expectGET('/api/users/tawil.hani@gmail.com/builds').respond([
                    {
                        "components": [
                            {
                                "ModuleID": "4CCS1FC1",
                                "Evaluated": "Compulsory",
                                "Name": "Foundations of Computing 1",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 4,
                                "Credits": 15,
                                "LectureDay": "Monday",
                                "LectureTime": "14:00:00",
                                "CourseworkPercentage": 0,
                                "Faculty": "Faculty of Natural and Mathematical Sciences"
                            },
                            {
                                "ModuleID": "4SSMN110",
                                "Evaluated": "Compulsory",
                                "Name": "Economics",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 4,
                                "Credits": 15,
                                "LectureDay": "Tuesday",
                                "LectureTime": "13:00:00",
                                "CourseworkPercentage": 40,
                                "Faculty": "Faculty of Social Science and Public Policy"
                            },
                            {
                                "ModuleID": "5CCS2SEG",
                                "Evaluated": "Compulsory",
                                "Name": "Software Engineering Group Project",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 5,
                                "Credits": 30,
                                "LectureDay": "Monday",
                                "LectureTime": "12:00:00",
                                "CourseworkPercentage": 85,
                                "Faculty": "Faculty of Natural and Mathematical Sciences"
                            },
                            {
                                "ModuleID": "5SSMN210",
                                "Evaluated": "Compulsory",
                                "Name": "Accounting",
                                "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                                "Year": 5,
                                "Credits": 15,
                                "LectureDay": "Friday",
                                "LectureTime": "09:00:00",
                                "CourseworkPercentage": 20,
                                "Faculty": "Faculty of Social Science and Public Policy"
                            }
                         ],
                        "buildID": 39,
                        "template": "BSc Computer Science with Management",
                        "recommended": []
                        }
                    ]);

                $httpBackend.expectGET('/api/degrees/BSc Computer Science with Management/modules').respond([
                    {
                        "ModuleID": "4CCS1FC1",
                        "IsOptional": 0,
                        "Name": "Foundations of Computing 1",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 4,
                        "Credits": 15,
                        "LectureDay": "Monday",
                        "LectureTime": "14:00:00",
                        "CourseworkPercentage": 0,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "4SSMN110",
                        "IsOptional": 0,
                        "Name": "Economics",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 4,
                        "Credits": 15,
                        "LectureDay": "Tuesday",
                        "LectureTime": "13:00:00",
                        "CourseworkPercentage": 40,
                        "Faculty": "Faculty of Social Science and Public Policy"
                    },
                    {
                        "ModuleID": "5CCS1INS",
                        "IsOptional": 1,
                        "Name": "Internet Systems",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 15,
                        "LectureDay": "Thursday",
                        "LectureTime": "13:00:00",
                        "CourseworkPercentage": 20,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "5CCS2SEG",
                        "IsOptional": 0,
                        "Name": "Software Engineering Group Project",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 30,
                        "LectureDay": "Monday",
                        "LectureTime": "12:00:00",
                        "CourseworkPercentage": 85,
                        "Faculty": "Faculty of Natural and Mathematical Sciences"
                    },
                    {
                        "ModuleID": "5SSMN210",
                        "IsOptional": 0,
                        "Name": "Accounting",
                        "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nisl ex, euismod in aliquam eu, efficitur ac risus. Aliquam consectetur mauris eget dui ornare, vel fringilla tortor consectetur. Nunc amet.",
                        "Year": 5,
                        "Credits": 15,
                        "LectureDay": "Friday",
                        "LectureTime": "09:00:00",
                        "CourseworkPercentage": 20,
                        "Faculty": "Faculty of Social Science and Public Policy"
                    },
                    {
                        "ModuleID": "BlahBig",
                        "IsOptional": 1,
                        "Name": "blah",
                        "Description": null,
                        "Year": 5,
                        "Credits": 200,
                        "LectureDay": null,
                        "LectureTime": null,
                        "CourseworkPercentage": null,
                        "Faculty": null
                    }
                ])

                $httpBackend.expectGET('/api/degrees/BSc Computer Science with Management').respond([
                    {
                        "DegreeTitle": "BSc Computer Science with Management",
                        "LengthOfStudy": 3
                    }
                ])
            }));

        })

    });

});
});