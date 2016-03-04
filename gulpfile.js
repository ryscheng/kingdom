"use strict";

const path = require("path");
const gulp = require("gulp");
const eslint = require('gulp-eslint');
const jsdoc = require("gulp-jsdoc3");
const mocha = require("gulp-mocha");
const fs = require("fs-extra");

gulp.task("lint", () => {
  return gulp.src([ "src/**/*.js" ])
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task("mocha", () => {
  return gulp.src("./src/**/*.spec.js")
    .pipe(mocha({ reporter: "spec" }));
});

gulp.task("jsdoc", () => {
  return gulp.src("./src/**/*.js")
    .pipe(jsdoc("./build/doc"));
});

gulp.task("watch", () => {
  gulp.watch("src/**/*.js", [ "build" ]);
})
gulp.task("clean", () => {
  fs.removeSync("build/");
});
//gulp.task("init", [ "copy_client" ])
gulp.task("build", [ ]);
gulp.task("test", [ "lint", "mocha" ]);
gulp.task("default", [ "build", "test" ]);
