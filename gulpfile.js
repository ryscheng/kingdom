var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");

gulp.task("babel", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("build"));
});

gulp.task("build", [ "babel" ]);
gulp.task("default", [ "build" ]);
