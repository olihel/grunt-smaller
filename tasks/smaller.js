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

  grunt.registerMultiTask('smaller', 'Minify js & css via "Smaller" minification service', function () {
    var options = this.options({
      'cleanup': true,
      'port': 80,
      'protocol': 'http://',
      'processor': 'closure,uglifyjs,lessjs,yuiCompressor,cssembed',
      'options': 'output:out-only=true'
    });

    var tempDir = 'tmp.smaller/';
    var tempDir_request = tempDir + 'request/';
    var tempDir_response = tempDir + 'response/';
    var tempFile_requestZip = tempDir_request + 'smaller.zip';
    var tempFile_responseZip = tempDir_response + 'smaller.zip';

    grunt.verbose.writeflags(options, 'Options');
    grunt.verbose.writeflags(this.data, 'Data');

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

    var sourceFiles = (function (files) {
      files.push({
        src: options['in']
      });
      files.forEach(function (f) {
        f.dest = tempDir_request;
      });
      return files;
    }(this.data.files));

    grunt.config.set('clean', {
      temp: [tempDir]
    });

    grunt.config.set('copy', {
      sourceFiles: {
        files: sourceFiles
      }
    });

    grunt.config.set('create', {
      manifest: {
        options: {
          path: tempDir_request,
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
          archive: tempFile_requestZip,
          mode: 'zip'
        },
        expand: true,
        cwd: tempDir_request,
        src: ['**/*'],
        dest: ''
      }
    });

    grunt.config.set('send', {
      data: {
        options: {
          url: options.protocol + options.host + ':' + options.port,
          requestZip: tempFile_requestZip,
          responseZip: tempFile_responseZip,
          responseDir: tempDir_response
        }
      }
    });

    grunt.config.set('unzip', {
        responseFile: {
          src: tempFile_responseZip,
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
      if (response) {
        grunt.verbose.writeln('Status code: ', response.headers['x-smaller-status']);
        if (response.headers) {
          grunt.verbose.writeflags(response.headers, 'Response header');
          if (response.headers['x-smaller-status'] === 'OK') {
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
            grunt.log.error('"Smaller" service error: ' + response.headers['x-smaller-message']);
            done(false);
          }
        }
      } else {
        grunt.log.error('No response from server! The "Smaller" server needs to be running at ' + options.url);
        done(false);
      }
    }));
  });
};
