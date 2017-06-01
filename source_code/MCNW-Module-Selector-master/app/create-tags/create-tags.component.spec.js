'use strict';

describe('createTags', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('createTags'));
    beforeEach(module('moduleSelector'));

    describe('CreateTagsController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('createTags',{'$scope': scope});
        }));
        
        it("should define 'categories' after the GET request '/api/tags/categories", function(){
            expect(scope.categories).toBeUndefined();
            
             $httpBackend.expectGET('/api/tags/categories').respond([{"Category":"Careers"},{"Category":"Degree"},{"Category":"Skills"}]);
            
        
        $httpBackend.flush();
            
            expect(scope.categories).toBeDefined();
        })
        
        it("should populate 'categories' after the GET request '/api/tags/categories", function(){

            $httpBackend.expectGET('/api/tags/categories').respond([{"Category":"Careers"},{"Category":"Degree"},{"Category":"Skills"}]);
            
        
            $httpBackend.flush();
            
            expect(scope.categories[0].Category).toBe('Careers');
            expect(scope.categories[1].Category).toBe('Degree');
            
            expect(scope.categories[2].Category).toBe('Skills');
        })
    });
});