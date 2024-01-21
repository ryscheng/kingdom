"use strict";

const path = require("path");
const gulp = require("gulp");
const eslint = require('gulp-eslint');
const jsdoc = require("gulp-jsdoc3");
const mocha = require("gulp-mocha");
const istanbul = require('gulp-istanbul');
const fs = require("fs-extra");
const connect = require("gulp-connect");
const runSequence = require("run-sequence");

gulp.task("start-serve", function() {
  connect.server({
    "root": "public/",
    "port": "3000"
  });
});

gulp.task("stop-serve", function() {
  connect.serverClose();
});

gulp.task("lint", function() {
  return gulp.src([ "src/**/*.js" ])
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format());
    //.pipe(eslint.failOnError());
});

gulp.task("mocha", function() {
  return gulp.src("./src/**/*.spec.js")
    .pipe(mocha({ reporter: "spec" }));
});

gulp.task("pre-coverage", function() {
  return gulp.src([ 'src/**/*.js', "!src/**/*.spec.js" ])
    // Covering files 
    .pipe(istanbul())
    // Force `require` to return covered files 
    .pipe(istanbul.hookRequire());
});

gulp.task("coverageTest", [ "pre-coverage" ], function() {
  return gulp.src(["./src/**/*.spec.js"])
    .pipe(mocha({ reporter: "spec" }))
    // Creating the reports after tests ran 
    .pipe(istanbul.writeReports({ dir: "./build/coverage" }))
    // Enforce a coverage of at least 90% 
    //.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task("jsdoc", function() {
  const jsdocConfig = {
    "opts": {
      "destination": "./build/doc"
    }
  };
  return gulp.src("./src/**/*.js", { read:false })
    .pipe(jsdoc(jsdocConfig));
});

gulp.task("watch", function() {
  gulp.watch("src/**/*.js", [ "build" ]);
})
gulp.task("clean", function() {
  fs.removeSync("build/");
});
//gulp.task("init", [ "copy_client" ])
gulp.task("build", [ ]);
gulp.task("coverage", function(done) {
  runSequence("start-serve", "coverageTest", "stop-serve", done);
});
gulp.task("test", function(done) {
  runSequence("start-serve", "mocha", "stop-serve", done);
});
gulp.task("default", [ "build", "lint", "test" ]);
