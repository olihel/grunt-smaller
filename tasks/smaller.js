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
  var temp = require('temp');

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

    // use system temp folder for intermediate files if cleanup option is set (default),
    // switch to local temp folder if cleanup option is not set (for testing purpose)
    var tempDir = options.cleanup ? temp.path('smaller_') + '/' : 'tmp.smaller/';

    var tempDir_request = tempDir + 'request/';
    var tempDir_response = tempDir + 'response/';
    var tempFile_requestZip = tempDir_request + 'smaller.zip';
    var tempFile_responseZip = tempDir_response + 'smaller.zip';

    grunt.verbose.writeflags(options, 'Options');
    grunt.verbose.writeflags(this.data, 'Data');
    grunt.verbose.writeln('Temp folder: ' + tempDir);

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

    var mergeConfig = function (taskName, config) {
      var prop;
      var originalConfig = grunt.config.get(taskName) || {};
      for (prop in config) {
        if (config.hasOwnProperty(prop)) {
          originalConfig[prop] = config[prop];
        }
      }
      grunt.config.set(taskName, originalConfig);
    };

    var sourceFiles = (function (files) {
      files.push({
        src: options['in']
      });
      files.forEach(function (f) {
        f.dest = tempDir_request;
      });
      return files;
    }(this.data.files));

    mergeConfig('clean', {
      smallerTemp: {
        options: {
          force: true
        },
        src: [tempDir]
      }
    });

    mergeConfig('copy', {
      smallerSourceFiles: {
        files: sourceFiles
      }
    });

    mergeConfig('create', {
      smallerManifest: {
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

    mergeConfig('compress', {
      smallerRequestFile: {
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

    mergeConfig('send', {
      smallerData: {
        options: {
          url: options.protocol + options.host + ':' + options.port,
          requestZip: tempFile_requestZip,
          responseZip: tempFile_responseZip,
          responseDir: tempDir_response
        }
      }
    });

    mergeConfig('unzip', {
      smallerResponseFile: {
        src: tempFile_responseZip,
        dest: options.target
      }
    });

    grunt.task.run('clean:smallerTemp',
                   'copy:smallerSourceFiles',
                   'create:smallerManifest',
                   'compress:smallerRequestFile',
                   'send:smallerData',
                   'unzip:smallerResponseFile');

    if (options.cleanup) {
      grunt.task.run('clean:smallerTemp');
    }
  });

  grunt.registerTask('create:smallerManifest', function () {
    var options = grunt.config('create.smallerManifest.options');
    var manifestDir = options.path + 'META-INF/';
    fs.existsSync(manifestDir) || fs.mkdirSync(manifestDir);
    fs.writeFileSync(manifestDir + 'MAIN.json', JSON.stringify(options.data));
  });

  grunt.registerTask('send:smallerData', function () {
    var options = grunt.config('send.smallerData.options');
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
