var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sequence = require('gulp-sequence');

var sync = "/Users/kristofersozolins/Library/Application Support/Firefox/Profiles/d8luf1t1.default/gm_scripts/Battle_Eye_Live";

gulp.task('default', ['scripts']);

gulp.task('scripts', sequence('scripts1', 'scripts2'));

gulp.task('scripts1', function() {
    return gulp.src([
        './src/classes/DpsHandler.js',
        './src/classes/*.js',
        './src/main.js'
    ])
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    ;
});

gulp.task('scripts2', function() {
    return gulp.src([
        './src/meta.js',
        './dist/battle-eye-live.user.js'
    ])
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest(sync))
    ;
});

gulp.task('scriptsRaw', function() {
    return gulp.src([
        './src/meta.js',
        './src/classes/DpsHandler.js',
        './src/classes/*.js',
        './src/main.js'
    ])
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest(sync))
    ;
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['scriptsRaw']);
});