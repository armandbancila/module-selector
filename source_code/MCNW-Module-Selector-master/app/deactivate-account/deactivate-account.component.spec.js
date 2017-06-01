'use strict';

describe('deactivateAccount', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('deactivateAccount'));
    beforeEach(module('moduleSelector'));

    describe('DeactivateAccountController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('deactivateAccount',{'$scope': scope});
        }));
        
        it("should expect to have default value of 'usefulness_rating' to be 0",function(){
            expect(scope.usefulness_rating).toBe(0);
        })
        
         it("should expect to have default value of 'usability_rating' to be 0",function(){
            expect(scope.usability_rating).toBe(0);
         })
         
         it("should expect to have default value of 'informativeness_rating' to be 0",function(){
            expect(scope.informativeness_rating).toBe(0);
         })
         
          it("should expect to have default value of 'security_rating' to be 0",function(){
            expect(scope.security_rating).toBe(0);
         })
          
          it("should expect to have default value of 'accessibility_rating' to be 0",function(){
            expect(scope.accessibility_rating).toBe(0);
         })
    });
});