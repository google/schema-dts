/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gulp = require('gulp');
const tsc = require('gulp-typescript');
const file = require('gulp-file');

const cpSpwan = require('child_process').spawn;
const through2 = require('through2');
function spawn(command, args = [], options = {}) {
  if (!options.env) {
    options.env = process.env;
  }
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  return through2.obj(function(file, _, flush) {
    const cp = cpSpwan(command, args, options);
    cp.stderr.on(
        'data', err => console.error(Buffer.from(err).toString('utf-8')));
    cp.on('error', err => console.log(err));

    file.contents = cp.stdout;
    this.push(file);
    cp.on('close', () => {
      flush();
    });
  });
}

const nodeProject = tsc.createProject('src/tsconfig.json');
gulp.task('build-generator', () => {
  return nodeProject.src().pipe(nodeProject()).pipe(gulp.dest('built/gen'));
});

gulp.task('generate-ts', gulp.series('build-generator', () => {
  return file('schema.ts', '', {src: true})
      .pipe(spawn('node', ['built/gen/cli/cli.js']))
      .pipe(gulp.dest('built/ts-schema'));
}));

gulp.task('generate-package', gulp.series('generate-ts', gulp.parallel(() => {
  return gulp.src('built/ts-schema/*.ts')
      .pipe(tsc({
        noImplicitAny: true,
        declaration: true,
      }))
      .pipe(gulp.dest('dist/schema'));
}, () => gulp.src('built/gen/**/*').pipe(gulp.dest('dist/gen')))));
