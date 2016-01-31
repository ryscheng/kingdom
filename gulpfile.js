var path = require("path");
var gulp = require("gulp");
var eslint = require('gulp-eslint');
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require("gulp-sourcemaps");
var uglify = require('gulp-uglify');
var concat = require("gulp-concat");
var fs = require("fs-extra");

gulp.task("browserify", function() {
  var entry = "./src/client/main.js";
  var dest = "./build/client/";
  var filename = path.basename(entry);
  var bundle = browserify({
    entries: [ entry ],
    debug: true
  }).bundle()
    .pipe(source(filename))
    .pipe(buffer());
  if (process.env.NODE_ENV === "production") {
    return bundle
      .pipe(sourcemaps.init({ loadMaps: true }))
      // --- Add transformation tasks to the pipeline here.
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest));
  } else {
    return bundle.pipe(gulp.dest(dest));
  }
});

gulp.task("copy_client", function() {
  fs.copySync("node_modules/speechkitt/test/vendor/annyang.min.js", "build/client/annyang.min.js")
  fs.copySync("node_modules/speechkitt/dist/speechkitt.min.js", "build/client/speechkitt.min.js")
  fs.copySync("node_modules/speechkitt/dist/themes/flat.css", "build/client/flat.css")
})

gulp.task("lint", function() {
  return gulp.src([ "src/**/*.js" ])
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task("clean", function() {
  fs.removeSync("build/");
});

gulp.task("watch", function() {
  gulp.watch("src/client/**/*.js", [ "build" ]);
})

gulp.task("init", [ "copy_client" ])
gulp.task("build", [ "browserify" ]);
gulp.task("test", [ "lint" ]);
gulp.task("default", [ "build", "test" ]);
