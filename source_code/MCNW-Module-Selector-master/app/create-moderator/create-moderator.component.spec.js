'use strict';

describe('createModerator', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('createModerator'));
    beforeEach(module('moduleSelector'));

    describe('CreateModeratorController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('createModerator',{'$scope': scope});
        }));
        
    });
});