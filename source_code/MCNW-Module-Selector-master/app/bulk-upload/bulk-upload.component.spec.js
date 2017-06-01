'use strict';

describe('bulkUpload', function () {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(module('bulkUpload'));
    beforeEach(module('moduleSelector'));

    describe('BulkUploadController', function () {
        var $httpBackend, ctrl, scope;
        
        beforeEach(inject(function ($componentController, _$httpBackend_,$rootScope) {
            $httpBackend = _$httpBackend_;
            
            scope = $rootScope.$new();
            ctrl = $componentController('bulkUpload',{'$scope': scope});
        }));
        
        it("should expect the length of 'dataOptions' to be 8",function(){
            expect(scope.dataOptions.length).toBe(8);
        })
        
        it("should expect 'method' to be empty since no data is selected",function(){
           
            expect(scope.method).toBe("");
          
        })
    });
});