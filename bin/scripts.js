var pkg = require('../package.json');
var childProcess = require('child_process');
var util = require('util');
// devDependencies
var babel = require('babel');
var browserify = require('browserify');
var fse = require('fs-extra');
var nodeWatch = require('node-watch');
// http-server
var connect = require('connect');
var serveStatic = require('serve-static');
var serveFavicon = require('serve-favicon');

// CONFIG
// -----------------------------------------------
var srcDir = 'es6';
var distDir = 'dist';
var serverPort = 3000;
var bundleFile = 'bundle.js';

// options for babel
var babelOptions = {
  sourceMap: 'inline',
  modules: 'common',
  optional: ['runtime']
};

// options for browserify
var browserifyOptions = {
  debug: true
};

// colors for shell - for a more complete list
// cf. http://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux
var red   = '\033[0;31m';
var green = '\033[0;32m';
var blue  = '\033[0;34m';
var NC    = '\033[0m'; // No Color

// COMMAND INTERPRETER
// -----------------------------------------------
var command = process.argv[2];
// execute the correct function given the script
switch (command) {
  case '--watch':
    watch();
    break;
  case '--serve':
    serve();
    break;
  case '--bundle':
    bundle();
    break;
  case '--uglify':
    uglify();
    break;
  case '--transpile':
    transpileAll();
    break;
}

// HELPERS
// -----------------------------------------------

// create filename from src to dist
function createTargetName(filename) {
  // replace sourceDir with targetDir
  return filename.replace(new RegExp('^' + srcDir), distDir);
}

// SCRIPTS
// -----------------------------------------------

// watch source dir and launch a server which bundles js when requested
function watch() {
  nodeWatch(srcDir, function(filename) {
    transpile(filename);
  });

  // create an http which browserify on 'bundle.js' request
  serve(bundleMiddleWare);
}

function serve(middleware) {
  if (!middleware) {
    middleware = function(req, res, next) { next(); }
  }

  var app = connect();

  app.use(middleware);
  app.use(serveFavicon('./assets/favicon.ico'));
  app.use(serveStatic('.', { index: ['index.html'] }));

  app.listen(serverPort, function() {
    console.log(util.format(blue + 'server listen at http://127.0.0.1:%s' + NC, serverPort));
  });
}

function bundleMiddleWare(req, res, next) {
  if (req.url === '/' + bundleFile) {
    bundle(next); // rebundle
  } else {
    next();
  }
}

// create the `.umd.js` version
function bundle(next) {
  var src = './' + pkg.main;
  var target = bundleFile;
  var b = browserify(src, browserifyOptions);
  var error = false;

  try {
    stream = fse.createWriteStream(target)
    b
      .bundle()
      .on('error', function(err) {
        error = true;
        console.log(util.format(red + '=> ' + err.message));
        this.emit('end');
      })
      .pipe(stream);
    // is not called at the right place - streams are async
    stream.on('finish', function() {
      if (error) { return }
      console.log(util.format(green + '=> "%s" successfully created' + NC, target));
      if (next) { next(); }
    })
  } catch(e) {
    // return console.log(err.message);
    return console.log('blah blah');
  }

}

// transpile all files in `srcDir`
function transpileAll() {
  var cmd = 'find '+ srcDir +' -type f';

  childProcess.exec(cmd , function(err, stdout, stderr) {
    var fileList = stdout.split('\n');

    fileList.forEach(function(file) {
      if (!file) { return; }
      transpile(file);
    });
  });
}

// transpile one file
function transpile(src) {
  var target = createTargetName(src);

  babel.transformFile(src, babelOptions, function(err, res) {
    if (err) { return console.log(err.message); }

    fse.outputFile(target, res.code, function(err, res) {
      if (err) { return console.log(err.message); }

      console.log(util.format(green + '=> "%s" successfully transpiled to "%s"' + NC, src, target));
    });
  });
}
