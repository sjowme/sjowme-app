"use strict";
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const babelify = require('babelify');
const uglifycss = require('gulp-uglifycss');

gulp.task('default', ['babel', 'less']);

gulp.task('babel', () => {
    let buildPath;
    let destPath;

    buildPath = `./client_src`;
    destPath = `./_public/assets/socket.io-file-client`;

    // script
    return browserify(`${buildPath}/file-client.js`)
        .transform(babelify, {
            presets: ["es2015"]
        })
        .bundle()
        .pipe(source('socket.io-file-client.js'))
        .pipe(buffer())
        .pipe(gulp.dest(`${destPath}`));
});

gulp.task('less', function () {
    console.log(process.env.SJ_ENV);
    if (process.env.SJ_ENV === 'development') {
        console.log('LESS for development');
        return gulp.src('client_src/less/styles/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest('./_public/assets/css'));
    } else {
        console.log('LESS for production');
        return gulp.src('client_src/less/styles/*.less')
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(uglifycss({
                "maxLineLen": 80,
                "uglyComments": true
            }))
            .pipe(gulp.dest('./_public/assets/css'));
    }
});

gulp.task('watch', function () {
    gulp.watch('./client_src/less/**/*.less', ['less']);
});
