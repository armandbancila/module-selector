'use strict';

describe('navbar', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('navbar'));
    beforeEach(module('moduleSelector'));

    describe('NavbarController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
             $httpBackend.expectGET('/logged_in').respond({
                "UserID": "tawil.hani@gmail.com",
                "FName": "Hani",
                "LName": "Tawil",
                "AccessGroup": 2
            });
            
            scope = $rootScope.$new();
            ctrl = $componentController('navbar',{'$scope': scope});
        }));
            
        it("should expect 'isMod', 'isAdmin', 'loggedIn'",function(){
            
            expect(scope.isMod).toBe(false);
            expect(scope.isAdmin).toBe(false);
            expect(scope.loggedIn).toBe(false);
            
        })
          
    });
});