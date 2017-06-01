'use strict';

describe('editTags', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('editTags'));
    beforeEach(module('moduleSelector'));

    describe('EditTagsController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('editTags',{'$scope': scope});
        }));
        
        it("should define 'categories' after the GET request '/api/tags/categories'",function(){
                    
             expect(scope.categories).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
              expect(scope.categories).toBeDefined(); 
            
        })
        
        it("should expect 'categories' to have elements test1 and test2 respectively after the GET request '/api/tags/categories'",function(){
                    
             expect(scope.categories).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
              expect(scope.categories[0].category).toBe('test1'); 
            
             expect(scope.categories[1].category).toBe('test2'); 
            
        })
        
        it("should define 'tags' after the GET request '/api/tags'",function(){
                    
             expect(scope.tags).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
           // scope.refreshTags();
            
              expect(scope.tags).toBeDefined(); 
            
        })
        
        it("should expect 'tags' to have elements test1 and test2 respectively after the GET request '/api/tags/categories'",function(){
                    
             expect(scope.tags).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
              //ctrl.refreshTags();
            
              expect(scope.tags[0].tag).toBe('test1'); 
            
             expect(scope.tags[1].tag).toBe('test2'); 
            
        })
        
        it("should expect 'pagination' to return a value of 18",function(){
                    
             expect(scope.paginationLimit).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
              expect(scope.paginationLimit()).toBe(18); 
            
        })
        
         it("should expect 'hasMoreItemsToShow' to return false",function(){
                    
             expect(scope.hasMoreItemsToShow).toBeUndefined();    

            $httpBackend.expectGET('/api/tags/categories').respond(
                [{"category":"test1"},{"category":"test2"}]);
           
            $httpBackend.expectGET('/api/tags').respond(
                [{"tag":"test1"},{"tag":"test2"}]);
             $httpBackend.flush();
            
              expect(scope.hasMoreItemsToShow()).toBe(false); 
            
        })
        
    });
        
});