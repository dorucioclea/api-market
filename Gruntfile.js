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
            'BASE': {
              'URL': 'https://192.168.99.100/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://192.168.99.100/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://localhost:8080/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine-local',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c2',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://devapim.t1t.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://devapim.t1t.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
              'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt'
            },
            KONG: {
              HOST: 'devapim.t1t.be'
            }
          }
        }
      },
      t1tprod: {
        constants: {
          'CONFIG': {
            'BASE': {
              'URL': 'https://apim.t1t.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://apim.t1t.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c2',
              'IDP_URL': 'https://idp.t1t.be/auth/realms/APIEngine/protocol/saml',
              'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'APIEngine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-o.antwerpen.be/dev/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver-o.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-o.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-a.antwerpen.be/rte/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver-a.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-a.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '05bac13c95a346cbc6e177d747e038db',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f72',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f71',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
            'BASE': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengine/v1',
              'JWT_HEADER_NAME': 'jwt'
            },
            'AUTH': {
              'URL': 'https://api-gw-p.antwerpen.be/apiengineauth/v1'
            },
            'STORAGE': {
              'LOCAL_STORAGE': 'apim-',
              'SESSION_STORAGE': 'apim_session-'
            },
            'SECURITY': {
              'REDIRECT_URL': '/login/idp/redirect',
              'API_KEY': '229e2ea08ba94919c9d221cdf3be1f73',
              'IDP_URL': 'https://identityserver.antwerpen.be/samlsso',
              'SP_URL': 'https://api-engine-p.antwerpen.be/API-Engine-auth/v1/login/idp/callback',
              'SP_NAME': 'apiengine',
              'CLIENT_TOKEN': 'jwt'
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
      publisherOn: {
        src: ['<%= config.app %>/scripts/shared/app.ctrls.js'],
        overwrite: true,
        replacements: [
          {
            from: /\$scope.publisherMode = false;/g,
            to: '$scope.publisherMode = true;'
          }
        ]
      },
      publisherOff: {
        src: ['<%= config.app %>/styles/main.less', '<%= config.app %>/scripts/shared/app.ctrls.js'],
        overwrite: true,
        replacements: [
          {
            from: /\$scope.publisherMode = true;/g,
            to: '$scope.publisherMode = false;'
          },
        ]
      },
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
            from: /\$scope.publisherMode = false;/g,
            to: '$scope.publisherMode = true;'
          },
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
          archive: 'release.zip'
        },
        expand: true,
        cwd: '<%=config.dist%>',
        src: ['**/*']
      }
    } // End Compresss
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'ngconstant:dev',
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

  grunt.registerTask('mkt', [
    'clean:dist',
    'wiredep',
    'ngconstant:dev',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('mkt-int', [
    'clean:dist',
    'wiredep',
    'ngconstant:devInt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('mkt-ext', [
    'clean:dist',
    'wiredep',
    'ngconstant:devExt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('t1tProdPub', [
    'clean:dist',
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
    'wiredep',
    'ngconstant:t1tprod',
    'replace:publisherOff',
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
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiDevPub', [
    'clean:dist',
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
    'wiredep',
    'ngconstant:digiDevMkt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiDevMkt-int', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiDevMktInt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiDevMkt-ext', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiDevMktExt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiAccPub', [
    'clean:dist',
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
    'wiredep',
    'ngconstant:digiAccMkt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiAccMkt-int', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiAccMktInt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiAccMkt-ext', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiAccMktExt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiProdPub', [
    'clean:dist',
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
    'wiredep',
    'ngconstant:digiProdMkt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiProdMkt-int', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiProdMktInt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('digiProdMkt-ext', [
    'clean:dist',
    'wiredep',
    'ngconstant:digiProdMktExt',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
  ]);

  grunt.registerTask('testBuildPub', [
    'clean:dist',
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
    'wiredep',
    'ngconstant:dev',
    'replace:mkt',
    'replace:publisherOff',
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
    'replace:t1t',
    'replace:publisherOn'
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
