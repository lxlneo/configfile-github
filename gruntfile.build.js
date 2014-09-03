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
                                        '/interaction': 'http://find11now.com/'
                                        
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
                            connect.static(_path.join(__dirname, 'build'))
                        ]
                    }
                }
            }
        },
        watch: {
            options: {
                livereload: 35729
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
                scanSourceFileDir: 'build',
                scanDistFileDir: 'build',
                dist: 'index.html',
                parameters: "?v="+new Date().getTime()+"-<%= pkg.version %>"
            },
            clear_build:{
              tasks:['js'],
              src:['index.html'],
              dist:['head link', 'head script','body script']
            },
            build_js:{
              src:['js/lib.min.js','js/app.min.js']
            },
            build_css:{
              src:['css/main.css'],
              tag: 'head'
            }
        },

        clean: {
            build: ['tmp/*', 'build/*'],
            finish: ['tmp']
        },
        //连接文件
        concat: {
          service:{
            src:['app/js/services/*.js'],
            dest:'tmp/service.js'
          },
          controller:{
            src: ['app/js/controller/*.js'],
            dest: 'tmp/controller.js'
          },
          directive:{
            src: ['app/js/directive/*/*.js'],
            dest: 'tmp/directive.js'
          },
          app:{
            src: ['app/js/lib/app.source.js', 'tmp/*.js'],
            dest: 'tmp/app.js'
          },
          lib:{
            src:[
              'app/js/lib/jquery.source.js',
              'app/js/lib/angular.source.js',
              'app/js/lib/angular-route.source.js',
              'app/js/lib/tvKey.source.js',
              'app/js/lib/starcor-ext.source.js'
            ],
            dest: 'tmp/lib.js'
          },
          css:{
            src: ['app/css/base.css', 'app/css/all/all.css', 'app/css/all/vote-tc.css', 'app/css/custom-defined.css'],
            dest: 'tmp/main.css'
          }
        },
        uglify:{
          options:{
            report: 'mini',
            mangle: false,
            compress: {
              drop_console: true
            },
            sourceMap: true
          },
          angular:{
            files:[{
              src: 'tmp/app.js',
              dest:'build/js/app.min.js'
            }]
          },
          lib:{
            files:[{
              src: 'tmp/lib.js',
              dest: 'build/js/lib.min.js'
            }]
          }
        },
        cssmin:{
          all_css:{
            expand: true,
            cwd: 'app/css/all',
            src: ['*.css'],
            dest: 'build/css/all/',
            ext: '.css'
          },
          part_css:{
            expand: true,
            cwd: 'app/css',
            src: ['*.css'],
            dest: 'build/css/',
            ext: '.css'
          },
          main_css:{
            expand: true,
            cwd: 'tmp',
            src: ['main.css'],
            dest: 'build/css/',
            ext: '.css'
          }
        },
        copy:{
          html:{
            expand: true,
            files:[{
                expand: true,
                cwd: 'app',
                src: ["index.html","views/{,*/}*.html"],
                dest: "build/"
              },{
                expand: true,
                cwd: 'app',
                src: ["views/directive/{,*/}*.html"],
                dest: "build/"
            }]
          },
          image:{
            expand: true,
            files:[{
              expand: true,
              cwd: 'app',
              src: ["image/{,*/}*"],
              dest: "build/"
            }]
          }
        }
    });

    grunt.registerTask('server', ['connect:all', 'file2head:js', 'watch:all']);
    grunt.registerTask('default', ['server']);

    grunt.registerTask('build-server', ['connect:all',  'watch:all']);
    grunt.registerTask('build-prepare', ['clean:build']);
    grunt.registerTask('build-js', ['concat', 'uglify:angular', 'uglify:lib']);
    grunt.registerTask('build-css', ['cssmin']);
    grunt.registerTask('build-html',[
      'copy:html',
      'file2head:clear_build',
      'file2head:build_js',
      'file2head:build_css'
    ]);
    grunt.registerTask('build-image', ['copy:image']);
    grunt.registerTask('build-finish', ['clean:finish']);
    grunt.registerTask('build-all',[
      'build-prepare',
      'build-js',
      'build-css',
      'build-html',
      'build-image',
      'build-finish'
    ])
};
