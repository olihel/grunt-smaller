/*!
 * grunt-smaller
 * https://github.com/olihel/grunt-smaller.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license (https://raw.github.com/olihel/grunt-smaller/master/LICENSE-MIT)
 */

var fs = require('fs');

var TMP_FOLDER = 'tmp.smaller/';
var REQUEST_ZIP_FILE = TMP_FOLDER + 'request/smaller.zip';
var RESPONSE_ZIP_FILE = TMP_FOLDER + 'response/smaller.zip';
var MIN_JS_FILE = TMP_FOLDER + 'dist/js/app-min.js';
var MIN_CSS_FILE = TMP_FOLDER + 'dist/css/app-base64-min.css';

exports.smaller = {
  setUp: function (done) {
    done();
  },
  checkRequestZipFile: function (test) {
    test.expect(1);
    test.ok(fs.existsSync(REQUEST_ZIP_FILE), 'request zip file exists');
    test.done();
  },
  checkResponseZipFile: function (test) {
    test.expect(1);
    test.ok(fs.existsSync(RESPONSE_ZIP_FILE), 'response zip file exists');
    test.done();
  },
  checkMinifiedFiles: function (test) {
    test.expect(2);
    test.ok(fs.existsSync(MIN_JS_FILE), 'minified js file exists');
    test.ok(fs.existsSync(MIN_CSS_FILE), 'minified css file exists');
    test.done();
  }
};
