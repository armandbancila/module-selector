//jshint strict: false
module.exports = function (config) {
    config.set({

        basePath: './app',

        files: [
        'https://code.jquery.com/jquery-1.11.2.min.js',
             '/select2/dist/js/select2.min.js',
      '../bower_components/angular/angular.js',
      '../bower_components/angular-route/angular-route.js',
      '../bower_components/angular-animate/angular-animate.js',
      '../bower_components/angular-mocks/angular-mocks.js',
      '../bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      '../bower_components/angular-cookies/angular-cookies.js',
      '../bower_components/a0-angular-storage/karma-*',
      '**/*.module.js',
      '*!(.module|.spec).js',
      '!(bower_components)/**/*!(.module|.spec).js',
      '**/*.spec.js'
    ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
      'karma-chrome-launcher',
      'karma-jasmine'
    ]

    });
};