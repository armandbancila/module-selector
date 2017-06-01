'use strict';

describe('editProfile', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('editProfile'));
    beforeEach(module('moduleSelector'));

    describe('EditProfileController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('editProfile',{'$scope': scope});
        }));
        
        it("should expect 'logged_in' to be defined after the GET request '/logged_in'",function(){
            expect(scope.logged_in).toBeUndefined();
            
             $httpBackend.expectGET('/logged_in').respond({
                "UserID": "irid94@gmail.com",
                "FName": "Irid",
                "LName": "Kotoni",
                "AccessGroup": 2
            });
            $httpBackend.flush();
            
            expect(scope.logged_in).toBeDefined();
        })
        
        it("should expect 'logged_in' UserID, Fname, Lname to be irid94@gmail.com, Irid, Kotoni, respectively after the GET request '/logged_in'",function(){
            expect(scope.logged_in).toBeUndefined();
            
             $httpBackend.expectGET('/logged_in').respond({
                "UserID": "irid94@gmail.com",
                "FName": "Irid",
                "LName": "Kotoni",
                "AccessGroup": 2
            });
            $httpBackend.flush();
            
            expect(scope.logged_in.UserID).toBe("irid94@gmail.com");
            expect(scope.logged_in.FName).toBe("Irid");
            expect(scope.logged_in.LName).toBe("Kotoni");
        })
        
        
    });
});