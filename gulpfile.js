"use strict";

const gulp = require("gulp");
const tsc = require("gulp-typescript");

const nodeProject = tsc.createProject("parser/tsconfig.json");
gulp.task("build-parser", () => {
  return nodeProject
    .src()
    .pipe(nodeProject())
    .js.pipe(gulp.dest("built/parser"));
});
