'use strict';

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist',

    connect_port: 9000,
    connect_live_reload: 35729,
    connect_hostname: 'localhost',
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    config: appConfig,

    // ===== //
    // Watch //
    // ===== //
    watch: {
      bower: {
        files: 'bower.json',
        tasks: 'wiredep'
      },
      scripts: {
        files: '<%= config.app %>/scripts/**/*.js',
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= config.connect_live_reload %>'
        }
      },
      styles: {
        files: ['<%= config.app %>/styles/**/*.*ss'],
        tasks: ['newer:copy:styles']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/**/*.html',
          '.tmp/styles/{,**/}*.css',
          '<%= config.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }, // End Watch

    // ======= //
    // Connect //
    // ======= //
    connect: {
      options: {
        port: '<%= config.connect_port %>',
        base: '<%= config.app %>',
        livereload: '<%= config.connect_live_reload %>',
        hostname: '<%= config.connect_hostname %>'
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/app/styles', connect.static('./app/styles')),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    }, // End Connect

    // ========================== //
    // Wire Dependencies of Bower //
    // ========================== //
    wiredep: {
      task: {
        src: ['<%= config.app %>/index.html']
      }
    }, // End Wiredep

    // ======= //
    // JS Hint //
    // ======= //
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: ['Gruntfile.js', '<%= config.app %>/scripts/{,*/}*.js']
      }
    }, // End JSHint
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });
};
