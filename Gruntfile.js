/*!
 * grunt-smaller
 * https://github.com/olihel/grunt-smaller.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license (https://raw.github.com/olihel/grunt-smaller/master/LICENSE-MIT)
 */

'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    clean: {
      tests: ['tmp.smaller']
    },

    smaller: {
      test: {
        options: {
          'cleanup': false,
          'processor': 'closure,uglifyjs,lessjs,yuiCompressor,cssembed',
          'host': 'localhost', // "smaller" server needs to be set up & running
          'in': 'sampleFiles/js/app.json,sampleFiles/css/app.less',
          'out': 'js/app-min.js,css/app-base64-min.css',
          'target': 'tmp.smaller/dist/'
        },
        files: [
          {src: ['sampleFiles/js/**/*.js', 'sampleFiles/css/*.less', 'sampleFiles/img/**/*.*', '!**/*.bin', '!sampleFiles/js/*-min.js']}
        ]
      }
    },

    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', ['clean', 'smaller:test', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
};
