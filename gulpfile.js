var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var eslint = require('gulp-eslint');
var concat = require("gulp-concat");

gulp.task("babel", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("build"));
});

gulp.task("lint", function() {
  return gulp.src([ "src/**/*.js" ])
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task("build", [ "babel" ]);
gulp.task("test", [ "lint" ]);
gulp.task("default", [ "build", "test" ]);
