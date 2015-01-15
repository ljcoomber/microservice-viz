module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["js/", "spec/"],
        copy: {
            main: {
                files: [ { expand: true, src: ['src/main/lib/*js'], dest: 'js/', filter: 'isFile', flatten: true }]
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './',
                    hostname: 'localhost',
                    middleware: function(connect, options) {
                        return [
                            function(req, res, next) {
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET');
                                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                                if(req.url.indexOf('error=true') > -1) {
                                    res.statusCode = 503;
                                }

                                return next();
                            },

                            connect.static(require('path').resolve('.'))
                        ];
                    }
                }
            }
        },
        typescript: {
            main: {
                src: ['src/main/typescript/app.ts'],
                dest: 'js/app.js',
                options: {
                    module: 'amd',
                    target: 'es5'
                }
            },
            test: {
                src: ['src/test/typescript/**/*.ts'],
                dest: 'spec/specs.js',  // TODO: Put somewhere that can be easily cleaned
                options: {
                    module: 'amd',
                    target: 'es5'
                }
            }
        },
        watch: {
            files: 'src/main/typescript/**/*.ts',
            tasks: ['typescript']
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            }
        },
        jasmine: {
            test: {
                src: 'js/*.js',
                options: {
                    specs: 'spec/*.js'
                }
            }
        }
    });

    grunt.registerTask('test', ['typescript', 'copy', 'connect', 'jasmine']);
    grunt.registerTask('default', ['typescript', 'copy', 'connect', 'open', 'watch']);
}
