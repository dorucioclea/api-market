// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-07-28 using
// generator-karma 1.0.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        // as well as any additional frameworks (requirejs/chai/sinon/...)
        frameworks: [
            'jasmine'
        ],

        // list of files / patterns to load in the browser
        files: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-aria/angular-aria.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-clipboard/angular-clipboard.js',
            'bower_components/angular-fullscreen/src/angular-fullscreen.js',
            'bower_components/angular-loading-bar/build/loading-bar.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-media-queries/match-media.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/angular-relative-date/angular-relative-date.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/tv4/tv4.js',
            'bower_components/objectpath/lib/ObjectPath.js',
            'bower_components/angular-schema-form/dist/schema-form.js',
            'bower_components/angular-schema-form/dist/bootstrap-decorator.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/underscore/underscore.js',
            'bower_components/backbone/backbone.js',
            'bower_components/d3/d3.js',
            'bower_components/c3/c3.js',
            'bower_components/c3-angular/c3-angular.min.js',
            'bower_components/handlebars/handlebars.js',
            'bower_components/marked/lib/marked.js',
            'bower_components/flow.js/dist/flow.js',
            'bower_components/ng-flow/dist/ng-flow.js',
            'bower_components/ng-tags-input/ng-tags-input.min.js',
            'bower_components/ngstorage/ngStorage.js',
            'bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.js',
            'bower_components/perfect-scrollbar/js/perfect-scrollbar.js',
            'bower_components/rangy/rangy-core.js',
            'bower_components/rangy/rangy-classapplier.js',
            'bower_components/rangy/rangy-highlighter.js',
            'bower_components/rangy/rangy-selectionsaverestore.js',
            'bower_components/rangy/rangy-serializer.js',
            'bower_components/rangy/rangy-textrange.js',
            'bower_components/textAngular/dist/textAngular.js',
            'bower_components/textAngular/dist/textAngular-sanitize.js',
            'bower_components/textAngular/dist/textAngularSetup.js',
            'bower_components/highlight/src/highlight.js',
            'app/scripts/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [
        ],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            'PhantomJS'
        ],

        // Which plugins to enable
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-bamboo-reporter'
        ],

        // Report test results to bamboo
        reporters: ['bamboo'],
        bambooReporter:{
            filename: 'mocha.json' //optional, defaults to "mocha.json"
        },

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};
