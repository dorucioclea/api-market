'use strict';

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    replace: 'grunt-text-replace',
    ngconstant: 'grunt-ng-constant'
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
        files: ['<%= config.app%>/styles/**/*.less'],
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
        src: ['Gruntfile.js', '<%= config.app %>/scripts/**/*.js']
      }
    }, // End JSHint

    // ===== //
    // Clean //
    // ===== //
    clean: {
      dist: ['dist', '.tmp', 'release.zip']
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
              js: ['concat'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: ['<%= config.dist %>/**/*.html'],
      css: ['<%= config.dist %>/styles/**/*.css'],
      js: ['<%= config.dist %>/scripts/**/*.js'],
      options: {
        assetsDirs: [
          '<%= config.dist %>',
          '<%= config.dist %>/images',
          '<%= config.dist %>/styles',
          '<%= config.dist %>/scripts'
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
            'images/**/*.*',
            'fonts/**/*.*',
            'views/**/*.*',
            'scripts/plugins/*.js',
            'styles/plugins/swagger/*.css'
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
        preserveComments: false,
        mangle: true,
        screwIE8: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/scripts',
          src: '**/*.js',
          dest: '<%= config.dist %>/scripts'
      }]
      }
    }, // End Uglify

    // ================ //
    // Angular Annotate //
    // ================ //
    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/scripts',
          src: '**/*.js',
          dest: '<%= config.dist %>/scripts'
        }]
      }
    }, // End Angular Annotate

    // ================ //
    // Angular Constant //
    // ================ //
    // ng-constant will create an Angular .constant that comprises config variables such as
    // the backend URLs, IDP server location, etc...
    ngconstant: {
      options: {
        name: 'app.config',
        dest: '<%= config.app %>/scripts/shared/app.config.js',
        wrap: ';(function(angular){\n"use strict";\n\n{%= __ngModule %} \n\n})(window.angular);',
        space: '  '
      },
      docker: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://192.168.99.100/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://192.168.99.100/dev/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=username%20name%20avatar%20email%20phone&redirect_uri=localhost:9000&lng=nl'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_docker-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://localhost:8080/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-local',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: '192.168.99.100'
            }
          }
        }
      },
      local: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_local-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-DEV',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'devapim.t1t.be'
            }
          }
        }
      },
      dev: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tdev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-DEV',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'devapim.t1t.be'
            }
          }
        }
      },
      devInt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tdev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-DEV',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'devapim.t1t.be'
            }
          }
        }
      },
      devExt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tdev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-DEV',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'devapim.t1t.be'
            }
          }
        }
      },
      acc: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://accapim.t1t.be/acc/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://accapim.t1t.be/acc/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngineACC/protocol/saml',
              'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-ACC',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'accapim.t1t.be'
            }
          }
        }
      },
      accInt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://accapim.t1t.be/acc/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://accapim.t1t.be/acc/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngineACC/protocol/saml',
              'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-ACC',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'accapim.t1t.be'
            }
          }
        }
      },
      accExt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://accapim.t1t.be/acc/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://accapim.t1t.be/acc/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngineACC/protocol/saml',
              'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-ACC',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'accapim.t1t.be'
            }
          }
        }
      },
      t1tprod: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://apim.t1t.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://apim.t1t.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_t1tprod-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c2',
              'IDP_URL': 'https://idp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': false
            },
            KONG: {
              HOST: 'apim.t1t.be'
            }
          }
        }
      },
      digiDevPub: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digidev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-o.antwerpen.be'
            }
          }
        }
      },
      digiDevMkt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digidev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-o.antwerpen.be'
            }
          }
        }
      },
      digiDevMktInt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digidev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-o.antwerpen.be'
            }
          }
        }
      },
      digiDevMktExt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': true,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digidev-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback/astad',
              'SP_NAME': 'apiengine-astad',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-o.antwerpen.be'
            }
          }
        }
      },
      digiAccPub: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-a.antwerpen.be'
            }
          }
        }
      },
      digiAccMkt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-a.antwerpen.be'
            }
          }
        }
      },
      digiAccMktInt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-a.antwerpen.be'
            }
          }
        }
      },
      digiAccMktExt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': true,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2-a.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiacc-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback/astad',
              'SP_NAME': 'apiengine-astad',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-a.antwerpen.be'
            }
          }
        }
      },
      digiProdPub: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': true,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiprod-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-p.antwerpen.be'
            }
          }
        }
      },
      digiProdMkt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiprod-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-p.antwerpen.be'
            }
          }
        }
      },
      digiProdMktInt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': false,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiprod-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-p.antwerpen.be'
            }
          }
        }
      },
      digiProdMktExt: {
        constants: {
          'CONFIG': {
            'APP': {
              'ORG_FRIENDLY_NAME_ENABLED': true,
              'PUBLISHER_MODE': false,
              'USE_DIGIPOLIS_CONSENT_PAGE': true,
              'SHOW_API_DEVELOPER_NAME_IN_STORE': false,
              'DISABLE_ANNOUNCEMENTS': true,
              'DISABLE_SUPPORT': true
            },
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'CONSENT': {
              'URL': 'https://api-oauth2.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session_digiprod-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt',
              'WSO2_LOGIN_FIX': true
            },
            KONG: {
              HOST: 'api-gw-p.antwerpen.be'
            }
          }
        }
      }
    },
    // ===== //
    // Karma //
    // ===== //
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }, // End Karma

    // ======= //
    // Replace //
    // ======= //
    replace: {
      // publisherOn: {
      //   src: ['<%= config.app %>/scripts/shared/app.ctrls.js'],
      //   overwrite: true,
      //   replacements: [
      //     {
      //       from: /\$scope.publisherMode = false;/g,
      //       to: '$scope.publisherMode = true;'
      //     }
      //   ]
      // },
      // publisherOff: {
      //   src: ['<%= config.app %>/styles/main.less', '<%= config.app %>/scripts/shared/app.ctrls.js'],
      //   overwrite: true,
      //   replacements: [
      //     {
      //       from: /\$scope.publisherMode = true;/g,
      //       to: '$scope.publisherMode = false;'
      //     },
      //   ]
      // },
      mkt: {
        src: ['<%= config.app %>/styles/main.less'],
        overwrite: true,
        replacements: [
          {
            from: '@import "theme-t1t.less";',
            to: '//@import "theme-t1t.less";'
          }
        ]
      },
      pub: {
        src: ['<%= config.app %>/styles/main.less'],
        overwrite: true,
        replacements: [
          {
            from: '@import "theme-t1t.less";',
            to: '@import "theme-override.less";'
          }
        ]
      },

      t1t: {
        src: ['<%= config.app %>/styles/main.less'],
        overwrite: true,
        replacements: [
          {
            from: /\/\/@import "theme-t1t.less";/g,
            to: '@import "theme-t1t.less";'
          },
          {
            from: '@import "theme-override.less";',
            to: '@import "theme-t1t.less";'
          }
        ]
      }
    }, // End Replace

    // ======== //
    // Compress //
    // ======== //
    compress: {
      dist: {
        options: {
          mode: 'zip',
          archive: function() {
            var date = new Date();
            var dateString = date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2)
                + "-" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
            return global.task + '-' + dateString + '.zip'
          }
        },
        expand: true,
        cwd: '<%=config.dist%>',
        src: ['**/*']
      }
    } // End Compress
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    if (target === 'mkt') {
      return grunt.task.run(['connect:livereload', 'ngconstant:devInt', 'less:dist', 'watch']);
    }

    grunt.task.run([
      'connect:livereload',
      'ngconstant:dev',
      'less:dist',
      'watch'
    ]);
  });

  grunt.registerTask('serveLocal', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'ngconstant:local',
      'less:dist',
      'watch'
    ]);
  });

  grunt.registerTask('serveDocker', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'ngconstant:docker',
      'watch'
    ]);
  });

  grunt.registerTask('pub', [
    'clean:dist',
    'set_global:task:pub',
    'wiredep',
    'ngconstant:dev',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('mkt-int', [
    'clean:dist',
    'set_global:task:mkt-int',
    'wiredep',
    'ngconstant:devInt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('mkt-ext', [
    'clean:dist',
    'set_global:task:mkt-ext',
    'wiredep',
    'ngconstant:devExt',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('acc-pub', [
    'clean:dist',
    'set_global:task:acc-pub',
    'wiredep',
    'ngconstant:acc',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('acc-mkt-int', [
    'clean:dist',
    'set_global:task:acc-mkt-int',
    'wiredep',
    'ngconstant:accInt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('acc-mkt-ext', [
    'clean:dist',
    'set_global:task:acc-mkt-ext',
    'wiredep',
    'ngconstant:accExt',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('t1tProdPub', [
    'clean:dist',
    'set_global:task:t1tProdPub',
    'wiredep',
    'ngconstant:t1tprod',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress'
  ]);

  grunt.registerTask('t1tProdMkt', [
    'clean:dist',
    'set_global:task:t1tProdMkt',
    'wiredep',
    'ngconstant:t1tprod',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress'
  ]);

  grunt.registerTask('digiDevPub', [
    'clean:dist',
    'set_global:task:digiDevPub',
    'wiredep',
    'ngconstant:digiDevPub',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiDevMkt', [
    'clean:dist',
    'set_global:task:digiDevMkt',
    'wiredep',
    'ngconstant:digiDevMkt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiDevMkt-int', [
    'clean:dist',
    'set_global:task:digiDevMkt-int',
    'wiredep',
    'ngconstant:digiDevMktInt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiDevMkt-ext', [
    'clean:dist',
    'set_global:task:digiDevMkt-ext',
    'wiredep',
    'ngconstant:digiDevMktExt',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiAccPub', [
    'clean:dist',
    'set_global:task:digiAccPub',
    'wiredep',
    'ngconstant:digiAccPub',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiAccMkt', [
    'clean:dist',
    'set_global:task:digiAccMkt',
    'wiredep',
    'ngconstant:digiAccMkt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiAccMkt-int', [
    'clean:dist',
    'set_global:task:digiAccMkt-int',
    'wiredep',
    'ngconstant:digiAccMktInt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiAccMkt-ext', [
    'clean:dist',
    'set_global:task:digiAccMkt-ext',
    'wiredep',
    'ngconstant:digiAccMktExt',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiProdPub', [
    'clean:dist',
    'set_global:task:digiProdPub',
    'wiredep',
    'ngconstant:digiProdPub',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiProdMkt', [
    'clean:dist',
    'set_global:task:digiProdMkt',
    'wiredep',
    'ngconstant:digiProdMkt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiProdMkt-int', [
    'clean:dist',
    'set_global:task:digiProdMkt-int',
    'wiredep',
    'ngconstant:digiProdMktInt',
    'replace:mkt',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('digiProdMkt-ext', [
    'clean:dist',
    'set_global:task:digiProdMkt-ext',
    'wiredep',
    'ngconstant:digiProdMktExt',
    'replace:pub',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('testBuildPub', [
    'clean:dist',
    'set_global:task:testBuildPub',
    'wiredep',
    'ngconstant:dev',
    'replace:pub',
    'connect:test',
    'karma',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t'
  ]);

  grunt.registerTask('testBuildMkt', [
    'clean:dist',
    'set_global:task:testBuildMkt',
    'wiredep',
    'ngconstant:dev',
    'replace:mkt',
    'connect:test',
    'karma',
    'less:dist',
    'useminPrepare',
    'copy:dist',
    'concat',
    'ngAnnotate',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress',
    'replace:t1t' 
  ]);

  grunt.registerTask('test', [
    'clean',
    'wiredep',
    //'concurrent:test',
    //'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('set_global', 'Set a global variable.', function(name, val) {
    global[name] = val;
  });
};
