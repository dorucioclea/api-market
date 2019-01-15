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
                src: ["index.html", "favicon.ico", "apublicfile.txt", "images/**/*", "views/**/*", "fonts/**/*"]
            },
            local: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.local %>",
                src: [ "images/**/*", "favicon.ico", "views/**/*", "fonts/**/*" ]
            },
            fa : {
                expand: true,
                cwd: "node_modules/font-awesome/fonts",
                dest: "<%= dir.dist %>/fonts",
                src: ["**/*"]
            },
            ion : {
                expand: true,
                cwd: "node_modules/ionicons/fonts",
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
                    'node_modules'
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
                src: [ '<%= dir.dist %>/styles/app.min.css']
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
        replace: {
            t1t: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-optipost.less";',
                        to: '@import "theme-t1t.less";'
                    }
                ]
            },
            optipost: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-t1t.less";',
                        to: '@import "theme-optipost.less";'
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
         * HTMLMIN -----------------------------------
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
    grunt.registerTask("build-t1t", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:ion', 'replace:t1t', 'less:dist', 'useminPrepare', 'cssmin', 'postcss:dist', 'concat', 'ngAnnotate', 'babel:dist', 'uglify', 'filerev', 'usemin', 'htmlmin', 'copy:index']);
    grunt.registerTask("build-optipost", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:ion', 'replace:optipost', 'less:dist', 'useminPrepare', 'cssmin', 'postcss:dist', 'concat', 'ngAnnotate', 'babel:dist', 'uglify', 'filerev', 'usemin', 'htmlmin', 'copy:index']);
    grunt.registerTask("dev", ["less:dev"]);
    grunt.registerTask("html", ["processhtml"]);
    grunt.registerTask('serve-t1t', 'Compile then watch for changes to files', function() {
        grunt.task.run(['clean:local', 'copy:local', 'copy:indexDev', 'replace:t1t', 'less:dev', 'babel:dev', 'watch']);
    });
    grunt.registerTask('serve-optipost', 'Compile then watch for changes to files', function() {
        grunt.task.run(['clean:local', 'copy:local', 'copy:indexDev', 'replace:optipost','less:dev', 'babel:dev', 'watch']);
    });
};