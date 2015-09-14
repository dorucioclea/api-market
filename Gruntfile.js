'use strict';

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  });

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist',

    connect_port: 9000,
    connect_port_test: 9001,
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
      less: {
        files: ['<%= config.app%>/styles/**/*/*.less'],
        tasks: ['less']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= config.connect_live_reload %>'
        },
        files: [
          '<%= config.app %>/**/*.html',
          '<%= config.app %>/styles/main.css',
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
      test: {
        options: {
          port: '<%= config.connect_port_test %>',
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/app/styles', connect.static('./app/styles')),
              connect.static(appConfig.app)
            ];
          }
        }
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

    // ===== //
    // Clean //
    // ===== //
    clean: {
      dist: ["dist", ".tmp"]
    }, // End Clean

    // ====== //
    // Usemin //
    // ====== //
    useminPrepare: {
      html: '<%= config.app %>/index.html',
      options: {
        dest: '<%= config.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css'],
      js: ['<%= config.dist %>/scripts/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles'
        ],
        patterns: {
          js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
        }
      }
    },// End Usmin

    // ==== //
    // Copy //
    // ==== //
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'images/{,*/}*.*',
            'fonts/**/*.*',
            'views/**/*.*'
          ]
        }]
      }
    }, // End Copy

    // ==== //
    // Less //
    // ==== //
    less: {
      dist: {
        options: {
          cleancss: true
        },
        files: {
          'app/styles/main.css': 'app/styles/main.less'
        }
      }
    }, // End Less

    // ============= //
    // File Revision //
    // ============= //
    filerev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 20
      },
      source: {
        files: [{
          src: [
            'dist/scripts/*.js',
            'dist/styles/*.css'
          ]
        }]
      }
    }, // End FileRev

    // HTML Min //
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          useShortDoctype: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: ['*.html', 'views/**/*.html'],
          dest: '<%= config.dist %>'
        }]
      }
    }, // End HtmlMin

    // ====== //
    // Uglify //
    // ====== //
    uglify: {
      options: {
        mangle: {
          except: ['angular']
        }
      }
    }, // End Uglify

    // ================ //
    // Angular Annotate //
    // ================ //
    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    }, // End Angular Annotate
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

  grunt.registerTask('dist', [
    'clean:dist',
    'wiredep',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    //'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('test', [
    'clean',
    'wiredep',
    //'concurrent:test',
    //'autoprefixer',
    'connect:test',
    'karma'
  ]);
};
