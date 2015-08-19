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
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/modernizr/modernizr.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/matchMedia/matchMedia.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-fullscreen/src/angular-fullscreen.js',
      'bower_components/angular-loading-bar/build/loading-bar.js',
      'bower_components/skycons/skycons.js',
      'bower_components/angular-skycons/angular-skycons.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
      'bower_components/moment/moment.js',
      'bower_components/fullcalendar/dist/fullcalendar.js',
      'bower_components/angular-ui-calendar/src/calendar.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/ng-tags-input/ng-tags-input.min.js',
      'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
      'bower_components/jquery-bridget/jquery.bridget.js',
      'bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js',
      'bower_components/rangy/rangy-core.js',
      'bower_components/rangy/rangy-classapplier.js',
      'bower_components/rangy/rangy-highlighter.js',
      'bower_components/rangy/rangy-selectionsaverestore.js',
      'bower_components/rangy/rangy-serializer.js',
      'bower_components/rangy/rangy-textrange.js',
      'bower_components/textAngular/src/textAngular.js',
      'bower_components/textAngular/src/textAngular-sanitize.js',
      'bower_components/textAngular/src/textAngularSetup.js',
      'bower_components/flow.js/dist/flow.js',
      'bower_components/ng-flow/dist/ng-flow.js',
      'bower_components/ng-img-crop/compile/minified/ng-img-crop.js',
      'bower_components/angular-mask/dist/ngMask.js',
      'bower_components/requirejs/require.js',
      'bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.js',
      'bower_components/ngmap/build/scripts/ng-map.js',
      'bower_components/ocLazyLoad/dist/ocLazyLoad.min.js',
      'bower_components/fastclick/lib/fastclick.js',
      'bower_components/select2/select2.js',
      'bower_components/ui-select/src/select3.js',
      'bower_components/perfect-scrollbar/src/perfect-scrollbar.js',
      'bower_components/d3/d3.js',
      'bower_components/ngstorage/ngStorage.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/less/dist/less.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
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
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

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
