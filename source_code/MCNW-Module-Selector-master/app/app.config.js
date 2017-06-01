angular.module('configuration', ['ngRoute']).config(['$locationProvider', '$routeProvider',
 function config($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.
  when('/sign-in', {
   template: '<navbar></navbar><sign-in></sign-in>'
  }).
  when('/index', {
   template: '<navbar></navbar><module-list></module-list>'
  }).
  when('/edit-tags', {
   template: '<navbar></navbar><edit-tags></edit-tags>'
  }).
  when('/create-tags', {
   template: '<navbar></navbar><create-tags></create-tags>'
  }).
  when('/assign-tags-upload', {
   template: '<navbar></navbar><upload-tag-assignment></upload-tag-assignment>'
  }).
  when('/edit-course', {
   template: '<navbar></navbar><edit-course></edit-course>'
  }).
  when('/create-module', {
   template: '<navbar></navbar><module-content></module-content>'
  }).
  when('/upload-modules', {
    template: '<navbar></navbar><upload-modules></upload-modules>'
  }).
  when('/upload-tags', {
    template: '<navbar></navbar><upload-tags></upload-tags>'
  }).
  when('/upload-courses', {
    template: '<navbar></navbar><upload-courses></upload-courses>'
  }).
  when('/create-account', {
   template: '<navbar></navbar><account-form></account-form>'
  }).
  when('/edit-profile', {
   template: '<navbar></navbar><edit-profile></edit-profile>'
  }).
  when('/deactivate-account', {
   template: '<navbar></navbar><deactivate-account></deactivate-account>'
  }).
  when('/create-moderator', {
   template: '<navbar></navbar><create-moderator></create-moderator>'
  }).
  when('/forgot-password', {
   template: '<navbar></navbar><forgot-password></forgot-password>'
  }).
  when('/reset-password/:token', {
   template: '<navbar></navbar><reset-password></reset-password>'
  }).
  when('/create-course', {
   template: '<navbar></navbar><create-course></create-course>'
  }).
  when('/create-moderator', {
   template: '<navbar></navbar><create-moderator></create-moderator>'
  }).
  when('/edit-module', {
   template: '<navbar></navbar><edit-module></edit-module>'
  }).
  when('/track', {
   template: '<navbar></navbar><track-modules></track-modules>'
  }).
  when('/build', {
   template: '<navbar></navbar><build-course></build-course>'
  }).
  when('/feedback', {
   template: '<navbar></navbar><feedback></feedback>'
 }).
  when('/bulk-upload', {
   template: '<navbar></navbar><bulk-upload></bulk-upload>'
  }).
  when('/select-faculty', {
   template: '<navbar></navbar><department-selector></department-selector>'
  }).
  otherwise({
   redirectTo: ('/select-faculty')
  });
 }
]);
