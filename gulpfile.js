var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sequence = require('gulp-sequence');
// var sourcemaps = require('gulp-sourcemaps');

var sync = "C:\\Users\\Raideer\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\novzk6sa.default-1439382728599\\gm_scripts\\Battle_Eye_Live-1";

gulp.task('default', ['scripts']);

gulp.task('scripts', sequence('scripts1', 'scripts2'));

gulp.task('scripts1', function() {
    return gulp.src([
        './src/classes/DpsHandler.js',
        './src/classes/components/*.js',
        './src/classes/modules/Module.js',
        './src/classes/modules/*.js',
        './src/classes/*.js',
        './src/main.js'
    ])
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(babel({
        presets: ['react','es2015']
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
        './src/classes/components/*.js',
        './src/classes/modules/Module.js',
        './src/classes/modules/*.js',
        './src/classes/*.js',
        './src/main.js'
    ])
    // .pipe(sourcemaps.init())
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(babel({
        presets: ['react','es2017']
    }))
    .on('error', gutil.log)
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest(sync))
    ;
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['scriptsRaw']);
});
