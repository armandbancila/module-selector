angular.
module('addModuleToCourse', ['ui.bootstrap', 'ngRoute']).
component('addModuleToCourse', {
  templateUrl: 'add-module-to-course/add-module-to-course.template.html'
  , controller: function AddModuleController($http, $scope) {
    console.log($("option").text().match($scope.moduleCode));
    /*
    $scope.moduleDependencies = [
        {name: '5CCS2OSD', Id: 0},
        {name: '5CCS2SEG', Id: 1},
        {name: '5CCS2PEP', Id: 2},
        {name: '5CCS2INS', Id: 3},
        {name: '5CCS2FC2', Id: 4}
    ];
    */
    
    
  }
});