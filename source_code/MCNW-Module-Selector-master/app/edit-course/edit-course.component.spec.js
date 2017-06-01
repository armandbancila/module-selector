'use strict';
describe('editCourse', function () {
    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('editCourse'));
    beforeEach(module('moduleSelector'));
    describe('EditCourseController', function () {
        var $httpBackend, ctrl, scope;
        beforeEach(inject(function ($componentController, _$httpBackend_, $rootScope) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $componentController('editCourse', {
                '$scope': scope
            });
        }));
        it("should define 'degres' with elements after calling 'refreshDegrees()' and expecting GET request '/api/degrees'", function () {
            expect(scope.degrees).toBeUndefined();
            $httpBackend.expectGET('/api/degrees').respond([{
                "DegreeTitle": "BSc Computer Science"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "BSc Computer Science with Management"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "MSci Computer Science"
                , "LengthOfStudy": 4
            }]);
            $httpBackend.flush();
            expect(scope.degrees).toBeDefined();
        })
        it("should expect 'degres' to have 3 elements after calling 'refreshDegrees()' and expecting GET request '/api/degrees'", function () {
            expect(scope.degrees).toBeUndefined();
            $httpBackend.expectGET('/api/degrees').respond([{
                "DegreeTitle": "BSc Computer Science"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "BSc Computer Science with Management"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "MSci Computer Science"
                , "LengthOfStudy": 4
            }]);
            $httpBackend.flush();
            expect(scope.degrees.length).toBe(3);
        })
        it("should expect 'degres' elements to be respectively 'BSc Computer Science', 'BSc Computer Science with Management' and 'MSci Computer Science' after calling 'refreshDegrees()' and expecting GET request '/api/degrees'", function () {
            expect(scope.degrees).toBeUndefined();
            $httpBackend.expectGET('/api/degrees').respond([{
                "DegreeTitle": "BSc Computer Science"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "BSc Computer Science with Management"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "MSci Computer Science"
                , "LengthOfStudy": 4
            }]);
            $httpBackend.flush();
            expect(scope.degrees[0].DegreeTitle).toBe("BSc Computer Science");
            expect(scope.degrees[1].DegreeTitle).toBe("BSc Computer Science with Management");
            expect(scope.degrees[2].DegreeTitle).toBe("MSci Computer Science");
        })
        it("should expect 'paginationLimit' to return  10 after calling function 'refreshDegrees'", function () {
            expect(scope.degrees).toBeUndefined();
            $httpBackend.expectGET('/api/degrees').respond([{
                "DegreeTitle": "BSc Computer Science"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "BSc Computer Science with Management"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "MSci Computer Science"
                , "LengthOfStudy": 4
            }]);
            $httpBackend.flush();
            expect(scope.paginationLimit()).toBe(10);
        })
        
        it("should expect 'hasMoreItemsToShow' to return  false after calling function 'refreshDegrees'", function () {
            expect(scope.degrees).toBeUndefined();
            $httpBackend.expectGET('/api/degrees').respond([{
                "DegreeTitle": "BSc Computer Science"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "BSc Computer Science with Management"
                , "LengthOfStudy": 3
            }, {
                "DegreeTitle": "MSci Computer Science"
                , "LengthOfStudy": 4
            }]);
            $httpBackend.flush();
            expect(scope.hasMoreItemsToShow()).toBe(false);
        })
    });
});