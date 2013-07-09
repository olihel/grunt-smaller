# grunt-smaller

> Grunt plugin wrapper for [Smaller](https://github.com/KnisterPeter/Smaller), a minification service for javascript and stylesheets.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-smaller --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-smaller');
```

## The "smaller" task

### Overview
In your project's Gruntfile, add a section named `smaller` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  smaller: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Usage Examples
```js
grunt.initConfig({
  smaller: {
    dist: {
      options: {
        // mandatory options:
        'host': 'localhost', // "smaller" server needs to be set up & running
        'in': 'sampleFiles/js/app.json,sampleFiles/css/app.less',
        'out': 'js/app-min.js,css/app-base64-min.css',
        'target': 'dist/',
        // further options with default values:
        'processor': 'closure,uglifyjs,lessjs,yuiCompressor,cssembed',
        'cleanup': true,  // clean up temp folder after running
        'port': 80,
        'protocol': 'http://',
        'options': 'output:out-only=true'
      },
      files: [
        {src: [
          'sampleFiles/js/**/*.js',
          'sampleFiles/css/*.less',
          'sampleFiles/img/**/*.*',
          '!**/*.bin',
          '!sampleFiles/js/*-min.js'
        ]}
      ]
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2013-07-08   v0.1.3   Use [node-temp](https://npmjs.org/package/temp) for temporary files
 * 2013-07-05   v0.1.2   Files handling improved
 * 2013-07-04   v0.1.1   Repo URL fixed
 * 2013-07-04   v0.1.0   Initial version

[![githalytics.com alpha](https://cruel-carlota.gopagoda.com/ac287546f236c15a03b83a640ca00faa "githalytics.com")](http://githalytics.com/olihel/grunt-smaller)

<sub>**Credits**</sub>  
<sub>Thanks to [SinnerSchrader](http://www.sinnerschrader.com/) for support and the time to work on this project.</sub>

<sub>**License**</sub>  
<sub>The MIT License (MIT)</sub>  
<sub>Copyright (c) 2013 Oliver Hellebusch</sub>

<sub>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</sub>

<sub>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</sub>

<sub>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</sub>

