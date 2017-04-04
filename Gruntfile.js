module.exports = function(grunt) {
    "use strict";
    var dirConfig = {
        src: "client",
        local: ".local",
        dist: "dist",
        index: "server/views"
    };

    require('time-grunt')(grunt);
    // Load  all grunt plugins
    require("load-grunt-tasks")(grunt);

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // load the package.json
        // specify configuration for each plugin
        dir: dirConfig,
        /**
         * UGLIFY ------------------------------------
         */
        uglify: {
            options: {
                preserveComments: false,
                mangle: true,
                screwIE8: true
            },
            dist: {
                expand: true,
                cwd: "<%= dir.dist %>/scripts",
                dest: "<%= dir.dist %>/scripts",
                src: ["**/*.js"]
            }
        },
        /**
         * BABEL -------------------------------------
         * Transpile the client JavaScript (ES6) to browser-safe JavaScript (ES5)
         */
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "<%= dir.dist %>/scripts/app.js": "<%= dir.dist %>/scripts/app.js"
                }
            },
            dev: {
                expand: true,
                cwd: "<%= dir.src %>/scripts",
                dest: "<%= dir.local %>/scripts",
                src: ["**/*.js"]
            }
        },
        /**
         * COPY --------------------------------------
         */
        copy: {
            dist: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dist %>",
                src: ["index.html", "favicon.ico", "keycloak.json", "apublicfile.txt", "images/**/*", "views/**/*", "fonts/**/*"]
            },
            local: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.local %>",
                src: [ "images/**/*", "favicon.ico", "keycloak.json", "views/**/*", "fonts/**/*" ]
            },
            fa : {
                expand: true,
                cwd: "bower_components/font-awesome/fonts",
                dest: "<%= dir.dist %>/fonts",
                src: ["**/*"]
            },
            ion : {
                expand: true,
                cwd: "bower_components/Ionicons/fonts",
                dest: "<%= dir.dist %>/fonts",
                src: ["**/*"]
            },
            index: {
                src: '<%= dir.dist %>/index.html',
                dest: '<%= dir.index %>/index.ejs',
            },
            indexDev: {
                src: '<%= dir.src %>/index.html',
                dest: '<%= dir.index %>/index-dev.ejs'
            }
        },
        /**
         * CLEAN -------------------------------------
         */
        clean: {
            dist: {
                src: ["<%= dir.dist %>", ".tmp"]
            },
            local: {
                src: ["<%= dir.local %>"]
            },
            tmp: {
                src: ["<%= dir.dist %>/scripts/_tmp"]
            }
        },
        /**
         * ANGULAR ANNOTATE --------------------------
         * ng-annotate tries to make the code safe for minification automatically
         * by using the Angular long form for dependency injection.
         */
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>/scripts',
                    src: '**/*.js',
                    dest: '<%= dir.dist %>/scripts'
                }]
            }
        }, // End Angular Annotate
        /**
         * LESS --------------------------------------
         * Convert LESS stylesheets into regular CSS
         */
        less: {
            dist: {
                options: {
                    cleancss: true
                },
                files: {
                    '<%= dir.src %>/styles/main.css': '<%= dir.src %>/styles/main.less'
                }
            },
            dev: {
                files: {
                    "<%= dir.local %>/styles/main.css": "<%= dir.src %>/styles/main.less",
                }
            }
        }, // End Less
        /**
         * LIBSASS -----------------------------------
         * https://github.com/sindresorhus/grunt-sass
         */
        sass: {
            options: {
                includePaths: [
                    'bower_components'
                ]
            },
            dist: {
                files: {
                    "<%= dir.src %>/styles/main.css": "<%= dir.src %>/styles/main.scss",
                }
            },
            dev: {
                files: {
                    "<%= dir.local %>/styles/main.css": "<%= dir.src %>/styles/main.scss",
                }
            }
        },
        /**
         * POSTCSS Autoprefixer ----------------------
         * https://github.com/postcss/autoprefixer
         */
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 3 versions']
                    })
                ]
            },
            dist: {
                src: [ '<%= dir.dist %>/styles/main.min.css']
            },
            dev: {
                src: [ '<%= dir.src %>/styles/main.css']
            }
        },
        /**
         * PROCESS HTML ------------------------------
         */
        processhtml: {
            options: {},
            files: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dist %>",
                src: ["index.html"]
            }
        },
        /**
         * WATCH -------------------------------------
         */
        watch: {
            options: {
                livereload: 35734
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= dir.src %>/**/*.html',
                    '<%= dir.src %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                ],
                tasks: ['copy:local']
            },
            scripts: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/scripts/**/*.js'],
                tasks: ['babel:dev']
            },
            styles: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/styles/**/*.less'],
                tasks: ['less:dev']
            },
            index: {
                options: {
                    livereload: true
                },
                files: [ '<%= dir.src %>/index.html' ],
                tasks: [ 'copy:indexDev' ]
            }

        }, // End Watch
        /**
         * USEMIN ------------------------------------
         */
        useminPrepare: {
            html: ['<%= dir.src %>/index.html'],
            options: {
                dest: '<%= dir.dist %>',
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
            html: ['<%= dir.dist %>/**/*.html'],
            css: ['<%= dir.dist %>/styles/**/*.css'],
            js: ['<%= dir.dist %>/scripts/**/*.js'],
            options: {
                assetsDirs: [
                    '<%= dir.dist %>',
                    '<%= dir.dist %>/images',
                    '<%= dir.dist %>/styles',
                    '<%= dir.dist %>/scripts'
                ],
                patterns: {
                    js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
                }
            }
        },
        /**
         * CSSMIN ------------------------------------
         * https://github.com/gruntjs/grunt-contrib-cssmin
         */
        cssmin: {
            options: {
                keepSpecialComments: '0'
            }
        },
        /**
         * FILE REVISION -----------------------------
         */
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            source: {
                files: [{
                    src: [
                        '<%= dir.dist %>/scripts/*.js',
                        '<%= dir.dist %>/styles/*.css'
                    ]
                }]
            }
        },
        /**
         * ANGULAR CONSTANT -------------------------- // TODO remove and use config!
         * ng-constant will create an Angular .constant that comprises config variables such as
         * the backend URLs, IDP server location, etc...
         */
        ngconstant: {
            options: {
                name: 'app.config',
                dest: '<%= dir.src %>/scripts/shared/app.config.js',
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
                            'URL': 'https://devapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://devapim.t1t.be/apiengineauth/v1'
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
                            'DISABLE_ANNOUNCEMENTS': false,
                            'DISABLE_SUPPORT': true
                        },
                        'BASE': {
                            'URL': 'https://devapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://devapim.t1t.be/apiengineauth/v1'
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
                            'DISABLE_ANNOUNCEMENTS': false,
                            'DISABLE_SUPPORT': true
                        },
                        'BASE': {
                            'URL': 'https://devapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://devapim.t1t.be/apiengineauth/v1'
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
                            'URL': 'https://devapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://devapim.t1t.be/apiengineauth/v1'
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
                            'URL': 'https://accapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://accapim.t1t.be/apiengineauth/v1'
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
                            'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
                            'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
                            'SP_NAME': 'T1G-ACC',
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
                            'URL': 'https://accapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://accapim.t1t.be/apiengineauth/v1'
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
                            'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
                            'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
                            'SP_NAME': 'T1G-ACC',
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
                            'URL': 'https://accapim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://accapim.t1t.be/apiengineauth/v1'
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
                            'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
                            'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
                            'SP_NAME': 'T1G-ACC',
                            'CLIENT_TOKEN': 'jwt',
                            'WSO2_LOGIN_FIX': false
                        },
                        KONG: {
                            HOST: 'accapim.t1t.be'
                        }
                    }
                }
            },
            t1tprodMkt: {
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
                            'URL': 'https://apim.t1t.be/apiengine/v1',
                            'JWT_HEADER_NAME': 'jwt'
                        },
                        'AUTH': {
                            'URL': 'https://apim.t1t.be/apiengineauth/v1'
                        },
                        'CONSENT': {
                            'URL': ''
                        },
                        'STORAGE': {
                            'LOCAL_STORAGE': 'apim-',
                            'SESSION_STORAGE': 'apim_session_t1tprod-'
                        },
                        'SECURITY': {
                            'REDIRECT_URL': '/login/idp/redirect',
                            'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97p3',
                            'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
                            'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
                            'SP_NAME': 'T1G-PROD',
                            'CLIENT_TOKEN': 'jwt',
                            'WSO2_LOGIN_FIX': false
                        },
                        KONG: {
                            HOST: 'apim.t1t.be'
                        }
                    }
                }
            },
            t1tprodPub: {
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
                            'URL': ''
                        },
                        'STORAGE': {
                            'LOCAL_STORAGE': 'apim-',
                            'SESSION_STORAGE': 'apim_session_t1tprod-'
                        },
                        'SECURITY': {
                            'REDIRECT_URL': '/login/idp/redirect',
                            'API_KEY': '05bac13c95a346cbc6e177d747e038db',
                            'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
                            'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
                            'SP_NAME': 'T1G-PROD',
                            'CLIENT_TOKEN': 'jwt',
                            'WSO2_LOGIN_FIX': false
                        },
                        KONG: {
                            HOST: 'apim.t1t.be'
                        }
                    }
                }
            },
        },
        /**
         * REPLACE ----------------------------------- // TODO remove and use config?
         */
        replace: {
            mkt: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-t1t.less";',
                        to: '//@import "theme-t1t.less";'
                    }
                ]
            },
            pub: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-t1t.less";',
                        to: '@import "theme-override.less";'
                    }
                ]
            },

            t1t: {
                src: ['<%= dir.src %>/styles/main.less'],
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
        /**
         * COMPRESS ---------------------------------- // TODO package correct things
         * create zip file of built artifact
         */
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
                cwd: '<%= dir.dist %>',
                src: ['**/*']
            }
        }, // End Compress
        /**
         * HTMLMIN ----------------------------------- // TODO integrate
         * Remove comments etc from HTML
         */
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
                    cwd: '<%= dir.dist %>',
                    src: ['*.html', 'views/**/*.html'],
                    dest: '<%= dir.dist %>'
                }]
            }
        }, // End HtmlMin
    });
    // Default Task (that can be run by typing only "grunt" in cmd)
    grunt.registerTask("default", 'build');
    grunt.registerTask("cleanBuild", ["clean:dist"]);
    grunt.registerTask("build", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:ion', 'less:dist', 'useminPrepare', 'cssmin', 'postcss', 'concat', 'ngAnnotate', 'babel:dist', 'uglify', 'filerev', 'usemin', 'copy:index']);
    grunt.registerTask("dev", ["less:dev"]);
    grunt.registerTask("html", ["processhtml"]);
    grunt.registerTask('serve', 'Compile then watch for changes to files', function() {
        grunt.task.run(['clean:local', 'copy:local', 'copy:indexDev', 'less:dev', 'babel:dev', 'watch']);
    });

    // grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    //     if (target === 'dist') {
    //         return grunt.task.run(['build', 'connect:dist:keepalive']);
    //     }
    //
    //     if (target === 'mkt') {
    //         return grunt.task.run(['connect:livereload', 'ngconstant:devInt', 'less:dist', 'watch']);
    //     }
    //
    //     grunt.task.run([
    //         'connect:livereload',
    //         'ngconstant:dev',
    //         'less:dist',
    //         'watch'
    //     ]);
    // });

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
        'ngconstant:t1tprodPub',
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
        'ngconstant:t1tprodMkt',
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

    grunt.registerTask('buildAll', [
        't1tAll'
    ]);

    grunt.registerTask('buildAllMkt', [
        'mkt-int',
        'mkt-ext',
        'acc-mkt-int',
        'acc-mkt-ext',
        't1tProdMkt'
    ]);

    grunt.registerTask('buildAllPub', [
        'pub',
        'acc-pub',
        't1tProdPub'
    ]);

    grunt.registerTask('t1tAll', [
        't1tDev', 't1tAcc', 't1tProd'
    ]);

    grunt.registerTask('t1tDev', [
        'mkt-int',
        'mkt-ext',
        'pub'
    ]);

    grunt.registerTask('t1tAcc', [
        'acc-mkt-int',
        'acc-mkt-ext',
        'acc-pub'
    ]);

    grunt.registerTask('t1tProd', [
        't1tProdMkt',
        't1tProdPub'
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




// module.exports = function (grunt) {
//     // Time how long tasks take. Can help when optimizing build times
//     require('time-grunt')(grunt);
//
//     // Automatically load required Grunt tasks
//     require('jit-grunt')(grunt, {
//         useminPrepare: 'grunt-usemin',
//         replace: 'grunt-text-replace',
//         ngconstant: 'grunt-ng-constant'
//     });
//
//     // Configurable paths for the application
//     var appConfig = {
//         app: require('./bower.json').appPath || 'app',
//         dist: 'dist',
//
//         connect_port: 9000,
//         connect_port_test: 9001,
//         connect_live_reload: 35729,
//         connect_hostname: 'localhost',
//     };
//
//     // Define the configuration for all the tasks
//     grunt.initConfig({
//         // Project settings
//         config: appConfig,
//
//         // ===== //
//         // Watch //
//         // ===== //
//         watch: {
//             bower: {
//                 files: 'bower.json',
//                 tasks: 'wiredep'
//             },
//             scripts: {
//                 files: '<%= config.app %>/scripts/**/*.js',
//                 tasks: ['newer:jshint:all'],
//                 options: {
//                     livereload: '<%= config.connect_live_reload %>'
//                 }
//             },
//             less: {
//                 files: ['<%= config.app%>/styles/**/*.less'],
//                 tasks: ['less']
//             },
//             gruntfile: {
//                 files: ['Gruntfile.js']
//             },
//             livereload: {
//                 options: {
//                     livereload: '<%= config.connect_live_reload %>'
//                 },
//                 files: [
//                     '<%= config.app %>/**/*.html',
//                     '<%= config.app %>/styles/main.css',
//                     '<%= config.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
//                 ]
//             }
//         }, // End Watch
//
//         // ======= //
//         // JS Hint //
//         // ======= //
//         jshint: {
//             options: {
//                 jshintrc: '.jshintrc',
//                 reporter: require('jshint-stylish')
//             },
//             all: {
//                 src: ['Gruntfile.js', '<%= config.app %>/scripts/**/*.js']
//             }
//         }, // End JSHint
//
//         // ===== //
//         // Clean //
//         // ===== //
//         clean: {
//             dist: ['dist', '.tmp', 'release.zip']
//         }, // End Clean
//
//         // ====== //
//         // Usemin //
//         // ====== //
//         useminPrepare: {
//             html: '<%= config.app %>/index.html',
//             options: {
//                 dest: '<%= config.dist %>',
//                 flow: {
//                     html: {
//                         steps: {
//                             js: ['concat'],
//                             css: ['cssmin']
//                         },
//                         post: {}
//                     }
//                 }
//             }
//         },
//
//         usemin: {
//             html: ['<%= config.dist %>/**/*.html'],
//             css: ['<%= config.dist %>/styles/**/*.css'],
//             js: ['<%= config.dist %>/scripts/**/*.js'],
//             options: {
//                 assetsDirs: [
//                     '<%= config.dist %>',
//                     '<%= config.dist %>/images',
//                     '<%= config.dist %>/styles',
//                     '<%= config.dist %>/scripts'
//                 ],
//                 patterns: {
//                     js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
//                 }
//             }
//         },// End Usmin
//
//         // ==== //
//         // Copy //
//         // ==== //
//         copy: {
//             dist: {
//                 files: [{
//                     expand: true,
//                     dot: true,
//                     cwd: '<%= config.app %>',
//                     dest: '<%= config.dist %>',
//                     src: [
//                         '*.{ico,png,txt}',
//                         '.htaccess',
//                         '*.html',
//                         'images/**/*.*',
//                         'fonts/**/*.*',
//                         'views/**/*.*',
//                         'scripts/plugins/*.js',
//                         'styles/plugins/swagger/*.css'
//                     ]
//                 }]
//             }
//         }, // End Copy
//
//         // ==== //
//         // Less //
//         // ==== //
//         less: {
//             dist: {
//                 options: {
//                     cleancss: true
//                 },
//                 files: {
//                     'app/styles/main.css': 'app/styles/main.less'
//                 }
//             }
//         }, // End Less
//
//         // ============= //
//         // File Revision //
//         // ============= //
//         filerev: {
//             options: {
//                 encoding: 'utf8',
//                 algorithm: 'md5',
//                 length: 20
//             },
//             source: {
//                 files: [{
//                     src: [
//                         'dist/scripts/*.js',
//                         'dist/styles/*.css'
//                     ]
//                 }]
//             }
//         }, // End FileRev
//
//         // HTML Min //
//         htmlmin: {
//             dist: {
//                 options: {
//                     removeComments: true,
//                     collapseWhitespace: true,
//                     useShortDoctype: true,
//                     removeScriptTypeAttributes: true,
//                     removeStyleLinkTypeAttributes: true
//                 },
//                 files: [{
//                     expand: true,
//                     cwd: '<%= config.dist %>',
//                     src: ['*.html', 'views/**/*.html'],
//                     dest: '<%= config.dist %>'
//                 }]
//             }
//         }, // End HtmlMin
//
//         // ====== //
//         // Uglify //
//         // ====== //
//         uglify: {
//             options: {
//                 preserveComments: false,
//                 mangle: true,
//                 screwIE8: true
//             },
//             dist: {
//                 files: [{
//                     expand: true,
//                     cwd: '<%= config.dist %>/scripts',
//                     src: '**/*.js',
//                     dest: '<%= config.dist %>/scripts'
//                 }]
//             }
//         }, // End Uglify
//
//         // ================ //
//         // Angular Annotate //
//         // ================ //
//         // ng-annotate tries to make the code safe for minification automatically
//         // by using the Angular long form for dependency injection.
//         ngAnnotate: {
//             options: {
//                 singleQuotes: true
//             },
//             dist: {
//                 files: [{
//                     expand: true,
//                     cwd: '<%= config.dist %>/scripts',
//                     src: '**/*.js',
//                     dest: '<%= config.dist %>/scripts'
//                 }]
//             }
//         }, // End Angular Annotate
//
//         // ================ //
//         // Angular Constant //
//         // ================ //
//         // ng-constant will create an Angular .constant that comprises config variables such as
//         // the backend URLs, IDP server location, etc...
//         ngconstant: {
//             options: {
//                 name: 'app.config',
//                 dest: '<%= config.app %>/scripts/shared/app.config.js',
//                 wrap: ';(function(angular){\n"use strict";\n\n{%= __ngModule %} \n\n})(window.angular);',
//                 space: '  '
//             },
//             docker: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': true,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://192.168.99.100/dev/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://192.168.99.100/dev/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=username%20name%20avatar%20email%20phone&redirect_uri=localhost:9000&lng=nl'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_docker-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
//                             'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
//                             'SP_URL': 'http://localhost:8080/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'APIEngine-local',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: '192.168.99.100'
//                         }
//                     }
//                 }
//             },
//             local: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': true,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://devapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://devapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_local-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
//                             'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
//                             'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'APIEngine-DEV',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'devapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             dev: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': true,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': false,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://devapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://devapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tdev-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '05bac13c95a346cbc6e177d747e038db',
//                             'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
//                             'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'APIEngine-DEV',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'devapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             devInt: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': false,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': false,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://devapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://devapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tdev-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
//                             'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
//                             'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'APIEngine-DEV',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'devapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             devExt: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': false,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://devapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://devapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tdev-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
//                             'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
//                             'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'APIEngine-DEV',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'devapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             acc: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': true,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://accapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://accapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tacc-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '05bac13c95a346cbc6e177d747e038db',
//                             'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
//                             'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'T1G-ACC',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'accapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             accInt: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': false,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://accapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://accapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tacc-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
//                             'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
//                             'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'T1G-ACC',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'accapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             accExt: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': false,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://accapim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://accapim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tacc-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
//                             'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
//                             'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'T1G-ACC',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'accapim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             t1tprodMkt: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': false,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://apim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://apim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': ''
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tprod-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97p3',
//                             'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
//                             'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'T1G-PROD',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'apim.t1t.be'
//                         }
//                     }
//                 }
//             },
//             t1tprodPub: {
//                 constants: {
//                     'CONFIG': {
//                         'APP': {
//                             'ORG_FRIENDLY_NAME_ENABLED': true,
//                             'PUBLISHER_MODE': true,
//                             'USE_DIGIPOLIS_CONSENT_PAGE': false,
//                             'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
//                             'DISABLE_ANNOUNCEMENTS': true,
//                             'DISABLE_SUPPORT': true
//                         },
//                         'BASE': {
//                             'URL': 'https://apim.t1t.be/apiengine/v1',
//                             'JWT_HEADER_NAME': 'jwt'
//                         },
//                         'AUTH': {
//                             'URL': 'https://apim.t1t.be/apiengineauth/v1'
//                         },
//                         'CONSENT': {
//                             'URL': ''
//                         },
//                         'STORAGE': {
//                             'LOCAL_STORAGE': 'apim-',
//                             'SESSION_STORAGE': 'apim_session_t1tprod-'
//                         },
//                         'SECURITY': {
//                             'REDIRECT_URL': '/login/idp/redirect',
//                             'API_KEY': '05bac13c95a346cbc6e177d747e038db',
//                             'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
//                             'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
//                             'SP_NAME': 'T1G-PROD',
//                             'CLIENT_TOKEN': 'jwt',
//                             'WSO2_LOGIN_FIX': false
//                         },
//                         KONG: {
//                             HOST: 'apim.t1t.be'
//                         }
//                     }
//                 }
//             },
//         },
//         // ===== //
//         // Karma //
//         // ===== //
//         karma: {
//             unit: {
//                 configFile: 'test/karma.conf.js',
//                 singleRun: true
//             }
//         }, // End Karma
//
//         // ======= //
//         // Replace //
//         // ======= //
//         replace: {
//             // publisherOn: {
//             //   src: ['<%= config.app %>/scripts/shared/app.ctrls.js'],
//             //   overwrite: true,
//             //   replacements: [
//             //     {
//             //       from: /\$scope.publisherMode = false;/g,
//             //       to: '$scope.publisherMode = true;'
//             //     }
//             //   ]
//             // },
//             // publisherOff: {
//             //   src: ['<%= config.app %>/styles/main.less', '<%= config.app %>/scripts/shared/app.ctrls.js'],
//             //   overwrite: true,
//             //   replacements: [
//             //     {
//             //       from: /\$scope.publisherMode = true;/g,
//             //       to: '$scope.publisherMode = false;'
//             //     },
//             //   ]
//             // },
//             mkt: {
//                 src: ['<%= config.app %>/styles/main.less'],
//                 overwrite: true,
//                 replacements: [
//                     {
//                         from: '@import "theme-t1t.less";',
//                         to: '//@import "theme-t1t.less";'
//                     }
//                 ]
//             },
//             pub: {
//                 src: ['<%= config.app %>/styles/main.less'],
//                 overwrite: true,
//                 replacements: [
//                     {
//                         from: '@import "theme-t1t.less";',
//                         to: '@import "theme-override.less";'
//                     }
//                 ]
//             },
//
//             t1t: {
//                 src: ['<%= config.app %>/styles/main.less'],
//                 overwrite: true,
//                 replacements: [
//                     {
//                         from: /\/\/@import "theme-t1t.less";/g,
//                         to: '@import "theme-t1t.less";'
//                     },
//                     {
//                         from: '@import "theme-override.less";',
//                         to: '@import "theme-t1t.less";'
//                     }
//                 ]
//             }
//         }, // End Replace
//
//         // ======== //
//         // Compress //
//         // ======== //
//         compress: {
//             dist: {
//                 options: {
//                     mode: 'zip',
//                     archive: function() {
//                         var date = new Date();
//                         var dateString = date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2)
//                             + "-" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
//                         return global.task + '-' + dateString + '.zip'
//                     }
//                 },
//                 expand: true,
//                 cwd: '<%=config.dist%>',
//                 src: ['**/*']
//             }
//         } // End Compress
//     });
//
//
//     grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
//         if (target === 'dist') {
//             return grunt.task.run(['build', 'connect:dist:keepalive']);
//         }
//
//         if (target === 'mkt') {
//             return grunt.task.run(['connect:livereload', 'ngconstant:devInt', 'less:dist', 'watch']);
//         }
//
//         grunt.task.run([
//             'connect:livereload',
//             'ngconstant:dev',
//             'less:dist',
//             'watch'
//         ]);
//     });
//
//     grunt.registerTask('serveLocal', 'Compile then start a connect web server', function (target) {
//         if (target === 'dist') {
//             return grunt.task.run(['build', 'connect:dist:keepalive']);
//         }
//
//         grunt.task.run([
//             'connect:livereload',
//             'ngconstant:local',
//             'less:dist',
//             'watch'
//         ]);
//     });
//
//     grunt.registerTask('serveDocker', 'Compile then start a connect web server', function (target) {
//         if (target === 'dist') {
//             return grunt.task.run(['build', 'connect:dist:keepalive']);
//         }
//
//         grunt.task.run([
//             'connect:livereload',
//             'ngconstant:docker',
//             'watch'
//         ]);
//     });
//
//     grunt.registerTask('pub', [
//         'clean:dist',
//         'set_global:task:pub',
//         'wiredep',
//         'ngconstant:dev',
//         'replace:pub',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('mkt-int', [
//         'clean:dist',
//         'set_global:task:mkt-int',
//         'wiredep',
//         'ngconstant:devInt',
//         'replace:mkt',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('mkt-ext', [
//         'clean:dist',
//         'set_global:task:mkt-ext',
//         'wiredep',
//         'ngconstant:devExt',
//         'replace:pub',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('acc-pub', [
//         'clean:dist',
//         'set_global:task:acc-pub',
//         'wiredep',
//         'ngconstant:acc',
//         'replace:pub',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('acc-mkt-int', [
//         'clean:dist',
//         'set_global:task:acc-mkt-int',
//         'wiredep',
//         'ngconstant:accInt',
//         'replace:mkt',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('acc-mkt-ext', [
//         'clean:dist',
//         'set_global:task:acc-mkt-ext',
//         'wiredep',
//         'ngconstant:accExt',
//         'replace:pub',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress',
//         'replace:t1t'
//     ]);
//
//     grunt.registerTask('t1tProdPub', [
//         'clean:dist',
//         'set_global:task:t1tProdPub',
//         'wiredep',
//         'ngconstant:t1tprodPub',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress'
//     ]);
//
//     grunt.registerTask('t1tProdMkt', [
//         'clean:dist',
//         'set_global:task:t1tProdMkt',
//         'wiredep',
//         'ngconstant:t1tprodMkt',
//         'less:dist',
//         'useminPrepare',
//         'copy:dist',
//         'concat',
//         'ngAnnotate',
//         'cssmin',
//         'uglify',
//         'filerev',
//         'usemin',
//         'htmlmin',
//         'compress'
//     ]);
//
//     grunt.registerTask('buildAll', [
//         't1tAll'
//     ]);
//
//     grunt.registerTask('buildAllMkt', [
//         'mkt-int',
//         'mkt-ext',
//         'acc-mkt-int',
//         'acc-mkt-ext',
//         't1tProdMkt'
//     ]);
//
//     grunt.registerTask('buildAllPub', [
//         'pub',
//         'acc-pub',
//         't1tProdPub'
//     ]);
//
//     grunt.registerTask('t1tAll', [
//         't1tDev', 't1tAcc', 't1tProd'
//     ]);
//
//     grunt.registerTask('t1tDev', [
//         'mkt-int',
//         'mkt-ext',
//         'pub'
//     ]);
//
//     grunt.registerTask('t1tAcc', [
//         'acc-mkt-int',
//         'acc-mkt-ext',
//         'acc-pub'
//     ]);
//
//     grunt.registerTask('t1tProd', [
//         't1tProdMkt',
//         't1tProdPub'
//     ]);
//
//     grunt.registerTask('test', [
//         'clean',
//         'wiredep',
//         //'concurrent:test',
//         //'autoprefixer',
//         'connect:test',
//         'karma'
//     ]);
//
//     grunt.registerTask('set_global', 'Set a global variable.', function(name, val) {
//         global[name] = val;
//     });
// };
