'use strict';

describe('createModule', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('createModule'));
    beforeEach(module('moduleSelector'));

    describe('createModuleController', function () {
        var $httpBackend, ctrl;
        
        beforeEach(inject(function ($componentController, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            
            $httpBackend.expectGET('/api/tags').respond(
                [{"TagName":"Astrology","Category":"Careers"}, {"TagName":"BSc Computer Science","Category":"Degree"}
                ]);
            
        
            ctrl = $componentController('createModule');
        }));
            
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