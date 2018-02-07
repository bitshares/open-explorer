(function () {
    "use strict";
    var LIVERELOAD_PORT, lrSnippet, mountFolder;
    var serveStatic = require('serve-static');

    LIVERELOAD_PORT = 35729;

    lrSnippet = require("connect-livereload")({
        port: LIVERELOAD_PORT
    });

    mountFolder = function(connect, dir) {
        return serveStatic(require("path").resolve(dir));
    };

    module.exports = function(grunt) {
        var yeomanConfig;
        require("load-grunt-tasks")(grunt);
        require("time-grunt")(grunt);

        /* configurable paths */
        yeomanConfig = {
            app: "app",
            dist: "dist"
        };
        try {
            yeomanConfig.app = require("./bower.json").appPath || yeomanConfig.app;
        } catch (_error) {}
        grunt.initConfig({
            yeoman: yeomanConfig,
            watch: {
                compass: {
                    files: ["<%= yeoman.app %>/styles/**/*.{scss,sass}"],
                    tasks: ["compass:server"]
                },
                less: {
                    files: ["<%= yeoman.app %>/styles-less/**/*.less"],
                    tasks: ["less:server"]
                },
                gruntfile: {
                    files: ['Gruntfile.js']
                },
                livereload: {
                    options: {
                        livereload: LIVERELOAD_PORT
                    },
                    files: [
                        "<%= yeoman.app %>/index.html",
                        "<%= yeoman.app %>/sections/**/*.html",
                        "<%= yeoman.app %>/sections/**/*.js",
                        "<%= yeoman.app %>/styles/**/*.scss",
                        "<%= yeoman.app %>/styles-less/**/*.less",
                        ".tmp/styles/**/*.css",
                        "<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}"
                    ]
                }
            },
            connect: {
                options: {
                    port: 8000,
                    hostname: "localhost"
                },
                livereload: {
                    options: {
                        middleware: function(connect) {
                            return [lrSnippet, mountFolder(connect, ".tmp"), mountFolder(connect, yeomanConfig.app)];
                        }
                    }
                },
                dist: {
                    options: {
                        middleware: function(connect) {
                            return [mountFolder(connect, yeomanConfig.dist)];
                        }
                    }
                }
            },
            open: {
                server: {
                    url: "http://localhost:<%= connect.options.port %>"
                }
            },
            clean: {
                dist: {
                    files: [
                        {
                            dot: true,
                            src: [".tmp", "<%= yeoman.dist %>/*", "!<%= yeoman.dist %>/.git*"]
                        }
                    ]
                },
                all: [
                    "readme.md",
                    ".tmp",
                    ".DS_Store",
                    ".sass-cache",
                    "app/bower_components",
                    "node_modules",
                    ".git"
                ],
                server: ".tmp"
            },
            jshint: {
                options: {
                    jshintrc: ".jshintrc"
                },
                all: ["Gruntfile.js", "<%= yeoman.app %>/scripts/**/*.js"]
            },
            injector: {
                options: {
                    relative: true
                },
                local_dependencies: {
                    files: {
                        "<%= yeoman.app %>/index.html": [
                            "<%= yeoman.app %>/app/*.module.js",
                            "<%= yeoman.app %>/app/**/*.js",
                            "!" + "<%= yeoman.app %>/**/*.spec.js"
                        ]
                    }
                },
            },
            compass: {
                options: {
                    sassDir: "<%= yeoman.app %>/styles",
                    cssDir: ".tmp/styles",
                    generatedImagesDir: ".tmp/styles/ui/images/",
                    imagesDir: "<%= yeoman.app %>/styles/ui/images/",
                    javascriptsDir: "<%= yeoman.app %>/scripts",
                    fontsDir: "<%= yeoman.app %>/fonts",
                    importPath: "<%= yeoman.app %>/bower_components",
                    httpImagesPath: "styles/ui/images/",
                    httpGeneratedImagesPath: "styles/ui/images/",
                    httpFontsPath: "fonts",
                    relativeAssets: true
                },
                dist: {
                    options: {
                        outputStyle: 'compressed',
                        debugInfo: false,
                        noLineComments: true,
                        sourcemap: false
                    }
                },
                server: {
                    options: {
                        noLineComments: true,
                        sourcemap: true,
                        debugInfo: true
                    }
                },
                forvalidation: {
                    options: {
                        debugInfo: false,
                        noLineComments: false
                    }
                },
            },
            less: {
                server: {
                    options: {
                        strictMath: true,
                        dumpLineNumbers: true,
                        sourceMap: true,
                        sourceMapRootpath: "",
                        outputSourceFiles: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: "<%= yeoman.app %>/styles-less",
                            src: "main.less",
                            dest: ".tmp/styles",
                            ext: ".css"
                        }
                    ]
                },
                dist: {
                    options: {
                        cleancss: true,
                        report: 'min'
                    },
                    files: [
                        {
                            expand: true,
                            cwd: "<%= yeoman.app %>/styles-less",
                            src: "main.less",
                            dest: ".tmp/styles",
                            ext: ".css"
                        }
                    ]
                }
            },
            useminPrepare: {
                html: "<%= yeoman.app %>/index.html",
                options: {
                    dest: "<%= yeoman.dist %>",
                    flow: {
                        steps: {
                            js: ["concat", "uglifyjs"],
                            css: ["cssmin"]
                        },
                        post: []
                    }
                }
            },
            usemin: {
                html: ["<%= yeoman.dist %>/**/*.html", "!<%= yeoman.dist %>/bower_components/**"],
                css: ["<%= yeoman.dist %>/styles/**/*.css"],
                options: {
                    dirs: ["<%= yeoman.dist %>"]
                }
            },
            htmlmin: {
                dist: {
                    options: {},
                    files: [
                        {
                            expand: true,
                            cwd: "<%= yeoman.app %>",
                            src: ["sections/*.html", "views/*.html"],
                            dest: "<%= yeoman.dist %>"
                        }
                    ]
                }
            },
            copy: {
                dist: {
                    files: [
                        {
                            expand: true,
                            dot: true,
                            cwd: "<%= yeoman.app %>",
                            dest: "<%= yeoman.dist %>",
                            src: [
                                "favicon.ico",
                                "bower_components/components-font-awesome/css/*",
                                "bower_components/components-font-awesome/fonts/*",
                                //"bower_components/themify-icons/css/*",
                                "bower_components/angular-loading-bar/build/*.css",
                                "fonts/**/*",
                                "i18n/**/*",
                                "images/**/*",
                                "sections/**/*.html",
                                "charting_library/**/*.*"
                            ]
                        }, {
                            expand: true,
                            cwd: ".tmp",
                            dest: "<%= yeoman.dist %>",
                            src: ["styles/**", "assets/**"]
                        }, {
                            expand: true,
                            cwd: ".tmp/images",
                            dest: "<%= yeoman.dist %>/images",
                            src: ["generated/*"]
                        }
                    ]
                },
                styles: {
                    expand: true,
                    cwd: "<%= yeoman.app %>/styles",
                    dest: ".tmp/styles/",
                    src: "**/*.css"
                }
            },
            concurrent: {
                server: ["compass:server", "copy:styles"],
                dist: ["compass:dist", "copy:styles", "htmlmin"],
                lessServer: ["less:server", "copy:styles"],
                lessDist: ["less:dist", "copy:styles", "htmlmin"]
            },
            cssmin: {
                options: {
                    keepSpecialComments: '0'
                },
                dist: {}
            },
            concat: {
                options: {
                    separator: grunt.util.linefeed + ';' + grunt.util.linefeed
                },
                dist: {}
            },
            uglify: {
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                },
                dist: {}
            }
        });
        grunt.registerTask("server", function(target) {
            grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        });
        grunt.registerTask("serve", function(target) {
            if (target === "dist") {
                return grunt.task.run(["build", "open", "connect:dist:keepalive"]);
            }
            return grunt.task.run(["clean:server", "concurrent:server", "connect:livereload", "open", "watch"]);
        });

        grunt.registerTask("lessServer", function(target) {
            grunt.log.warn('The `lessServer` task has been deprecated. Use `grunt lessServe` to start a server.');
        });
        grunt.registerTask("lessServe", function(target) {
            if (target === "dist") {
                return grunt.task.run(["lessBuild", "open", "connect:dist:keepalive"]);
            }
            return grunt.task.run(["clean:server", "concurrent:lessServer", "connect:livereload", "open", "watch"]);
        });

        grunt.registerTask("build", ["clean:dist", "useminPrepare", "concurrent:dist", "copy:dist", "cssmin", "concat", "uglify", "usemin"]);
        grunt.registerTask("lessBuild", ["clean:dist", "useminPrepare", "concurrent:lessDist", "copy:dist", "cssmin", "concat", "uglify", "usemin"]);
        return grunt.registerTask("default", ["serve"]);
    };
})();
