/*!
 * grunt-smaller
 * https://github.com/olihel/grunt-smaller.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license (https://raw.github.com/olihel/grunt-smaller/master/LICENSE-MIT)
 */

'use strict';

module.exports = function (grunt) {
  var fs = require('fs');
  var request = require('request');

  require('grunt-contrib-clean/tasks/clean')(grunt);
  require('grunt-contrib-copy/tasks/copy')(grunt);
  require('grunt-contrib-compress/tasks/compress')(grunt);
  require('grunt-zip/tasks/zip')(grunt);

  var TEMP_DIR = 'tmp.smaller/';
  var TEMP_DIR_REQUEST = TEMP_DIR + 'request/';
  var TEMP_DIR_RESPONSE = TEMP_DIR + 'response/';
  var TEMP_REQUEST_ZIP = TEMP_DIR_REQUEST + 'smaller.zip';
  var TEMP_RESPONSE_ZIP = TEMP_DIR_RESPONSE + 'smaller.zip';

  grunt.registerMultiTask('smaller', 'Your task description goes here.', function () {
    var options = this.options({
      'cleanup': true,
      'port': 80,
      'protocol': 'http://',
      'processor': 'closure,uglifyjs,lessjs,yuiCompressor,cssembed',
      'options': 'output:out-only=true'
    });

    grunt.verbose.writeflags(options, 'Options');

    if ((typeof options['in'] === undefined) || (options['in'] === '')) {
      grunt.log.error('"in" option is mandatory!');
      return false;
    } else {
      options['in'] = options['in'].split(',');
    }

    if ((typeof options.out === 'undefined') || (options.out === '')) {
      grunt.log.error('"out" option is mandatory!');
      return false;
    }

    if ((typeof options.host === 'undefined') || (options.host === '')) {
      grunt.log.error('"host" option is mandatory!');
      return false;
    }

    if (typeof options.target === 'undefined') {
      grunt.log.error('"target" option is mandatory!');
      return false;
    }

    grunt.config.set('clean', {
      temp: [TEMP_DIR]
    });

    grunt.config.set('copy', {
      sourceFiles: {
        files: (function getFiles(context) {
          var files = JSON.parse(JSON.stringify(context.files));
          files.push({src: options['in']});
          files.forEach(function (f) {
            f.dest = TEMP_DIR_REQUEST;
          });
          return files;
        }(this))
      }
    });

    grunt.config.set('create', {
      manifest: {
        options: {
          path: TEMP_DIR_REQUEST,
          data: {
            'tasks': [
              {
                'processor': options.processor,
                'in': options['in'],
                'out': options.out.split(','),
                'optionsDefinition': options.options,
                'options': null
              }
            ]
          }
        }
      }
    });

    grunt.config.set('compress', {
      requestFile: {
        options: {
          archive: TEMP_REQUEST_ZIP,
          mode: 'zip'
        },
        expand: true,
        cwd: TEMP_DIR_REQUEST,
        src: ['**/*'],
        dest: ''
      }
    });

    grunt.config.set('send', {
      data: {
        options: {
          url: options.protocol + options.host + ':' + options.port,
          requestZip: TEMP_REQUEST_ZIP,
          responseZip: TEMP_RESPONSE_ZIP,
          responseDir: TEMP_DIR_RESPONSE
        }
      }
    });

    grunt.config.set('unzip', {
        responseFile: {
          src: TEMP_RESPONSE_ZIP,
          dest: options.target
        }
      });

    grunt.task.run('clean:temp',
                   'copy:sourceFiles',
                   'create:manifest',
                   'compress:requestFile',
                   'send:data',
                   'unzip:responseFile');

    if (options.cleanup) {
      grunt.task.run('clean:temp');
    }
  });

  grunt.registerTask('create:manifest', function () {
    var options = grunt.config('create.manifest.options');
    var manifestDir = options.path + 'META-INF/';
    fs.existsSync(manifestDir) || fs.mkdirSync(manifestDir);
    fs.writeFileSync(manifestDir + 'MAIN.json', JSON.stringify(options.data));
  });

  grunt.registerTask('send:data', function () {
    var options = grunt.config('send.data.options');
    var done = this.async();
    fs.createReadStream(options.requestZip).pipe(request({
      url: options.url,
      encoding: null,
      method: 'POST',
      headers: {
        'Content-Length': fs.statSync(options.requestZip).size
      }
    }, function (error, response, body) {
      if (response && body) {
        grunt.verbose.writeflags(response.headers, 'Response headers');
        fs.existsSync(options.responseDir) || fs.mkdirSync(options.responseDir);
        fs.writeFile(options.responseZip, body, 'binary', function (err) {
          if (err) {
            grunt.log.error(err);
            done(false);
          }
          grunt.verbose.writeln('File saved.');
          done();
        });
      } else {
        grunt.log.error('No response from server! The "Smaller" server needs to be running at ' + options.url);
        done(false);
      }
    }));
  });
};
