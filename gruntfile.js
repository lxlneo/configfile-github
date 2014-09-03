var _path = require('path')

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-htmlmin')
    grunt.loadNpmTasks('grunt-usemin')
    grunt.loadNpmTasks('grunt-filerev')
    grunt.loadNpmTasks('klyg-file2head')

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            all: {
                options: {
                    port: 9001,
                    base: __dirname,
                    //directory: 'web',
                    hostname: '*',
                    //keepalive: true,
                    debug: true,
                    middleware: function (connect) {
                        return [
                            require('json-proxy').initialize({
                                proxy: {
                                    forward: {
                                        '/interaction': 'http://find11now.com/',
                                        
                                    },
                                    headers: {
                                        'Host': 'http://find11now.com/',
                                        'Origin': 'http://find11now.com/',
                                        'X-Requested-With': 'XMLHttpRequest'
                                    }
                                }
                            }),
                           /*require('connect-livereload')({
                                port: 35729
                            }),*/
                            connect.static(_path.join(__dirname, 'app'))
                        ]
                    }
                }
            }
        },
        watch: {
            options: {
                //livereload: 35729
            },
            all: {
                files: [__dirname + '/**/*.html', '*/css/*.css', '*/js/**/*.js']
                //tasks: ['livereload']
            }
        },
        file2head:{
            options:{
                tag: "body",
                uri: '/',
                scanSourceFileDir: 'app',
                scanDistFileDir: 'app',
                dist: 'index.html',
                parameters: "?v="+new Date().getTime()+"-<%= pkg.version %>"
            },
            js:{
                src: ['js/services/*', 'js/directive/*/*', 'js/controller/*']
            }
        }
    });

    grunt.registerTask('server', ['connect:all', 'file2head:js', 'watch:all']);
    grunt.registerTask('default', ['server']);
};
