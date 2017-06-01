'use strict';

describe('departmentSelector', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('departmentSelector'));
    beforeEach(module('moduleSelector'));

    describe('DepartmentSelectorController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('departmentSelector',{'$scope': scope});
        }));
        
//        it("should populate the 'facultys' with 8 elements", function(){
//            expect(scope.facultys.lenght).toBe(8);
//        })
//        
//         it("should replace '&' with 'and' in 'facultys'", function(){
//            ctrl.filter('Faculty of Arts & Humanities');
//            expect(scope.facultys[0].Faculty).toBe('Faculty of Arts and Humanities');
//        })
        
    });
});