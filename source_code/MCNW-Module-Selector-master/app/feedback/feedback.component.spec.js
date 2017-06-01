'use strict';

describe('feedback', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('feedback'));
    beforeEach(module('moduleSelector'));

    describe('FeedbackController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            scope= $rootScope.$new();
           
        
            ctrl = $componentController('feedback',{
                '$scope':scope
            });
        }));
        
        it("should expect to return the first 10 character of th string '0123456789ABCDEF",function(){
            
            expect(scope.removeTimeFromDate('0123456789ABCDEF')).toBe('0123456789');
        })
        
        it("should define 'feedback' after the GET request",function(){
            
        expect(scope.feedback).toBeUndefined();    
            
            $httpBackend.expectGET('/api/users/feedback').respond(
                {"MSG":"This is a test"});
             $httpBackend.flush();
            
            expect(scope.feedback).toBeDefined(); 
        
        
        })
        
         it("should expect 'feedback' to have length of 1 after the GET request",function(){
            
        expect(scope.feedback).toBeUndefined();    
            
            $httpBackend.expectGET('/api/users/feedback').respond(
                [{"MSG":"This is a test"}]);
             $httpBackend.flush();
            
            expect(scope.feedback.length).toBe(1); 
              expect(scope.feedback[0].MSG).toBe('This is a test'); 
        
        
        })
        
         it("should expect 'feedback' message to be 'This is a test'after the GET request",function(){
            
        expect(scope.feedback).toBeUndefined();    
            
            $httpBackend.expectGET('/api/users/feedback').respond(
                [{"MSG":"This is a test"}]);
             $httpBackend.flush();
            
              expect(scope.feedback[0].MSG).toBe('This is a test'); 
        
        
        })
         
         
            
//        it("should expect 'isMod', 'isAdmin', 'loggedIn'",function(){
//            
//            expect(ctrl.tags).toBeUndefined();
//            
//            $httpBackend.flush();
//            
//            expect(ctrl.tags).toBeDefined();
//            
//        })
//          
    });
});