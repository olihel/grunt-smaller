/*!
 * grunt-smaller
 * https://github.com/olihel/grunt-smaller.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license (https://raw.github.com/olihel/grunt-smaller/master/LICENSE-MIT)
 */

'use strict';

var fs = require('fs');

var TMP_FOLDER = 'tmp.smaller/';
var REQUEST_ZIP_FILE = TMP_FOLDER + 'request/smaller.zip';
var RESPONSE_ZIP_FILE = TMP_FOLDER + 'response/smaller.zip';
var MIN_CSS_FILE = TMP_FOLDER + 'dist/css/app-base64-min.css';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

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
    test.expect(1);
    test.ok(fs.existsSync(MIN_CSS_FILE), 'minified files exist');
    test.done();
  }
};
