module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './',
                    hostname: 'localhost',
                    // remove next from params
                    middleware: function(connect, options) {
                        return [
                            function(req, res, next) {
                                res.setHeader('Access-Control-Allow-Origin', '*');
                                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                                // don't just call next() return it
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
                src: 'js/app.js',
                options: {
                    specs: 'spec/*.js',
                    helpers: 'spec/*Helper.js',
                    vendor: ['src/test/lib/jquery-2.1.1.min.js']
                }
            }
        }
    });

    grunt.registerTask('test', ['typescript', 'jasmine']);
    grunt.registerTask('default', ['typescript', 'connect', 'open', 'watch']);
}
