angular.
  module('tracker').
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/tracked', {
          template: '<track-modules></track-modules>'
        }).
        when('/buildme', {
          template: '<build-course></build-course>'
        }).
        otherwise('/tracked');
    }
  ]);