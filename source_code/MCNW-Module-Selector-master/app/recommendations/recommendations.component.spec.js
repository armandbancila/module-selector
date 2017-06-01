'use strict';

describe('recommendations', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('recommendations'));
    beforeEach(module('moduleSelector'));

    describe('RecommendationsController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('recommendations',{'$scope': scope});
        }));
        
    });
});