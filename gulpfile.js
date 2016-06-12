var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sequence = require('gulp-sequence');
var clean = require('gulp-clean');

var sync = "C:\\Users\\Raideer\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\novzk6sa.default-1439382728599\\gm_scripts\\Battle_Eye_Live";

gulp.task('default', ['scripts']);

gulp.task('scripts', sequence('scripts1', 'scripts2', 'scripts3'));

gulp.task('scripts1', function() {
    return gulp.src([
        './src/classes/DpsHandler.js',
        './src/classes/*.js',
        './src/main.js'
    ])
    .pipe(concat('temp.js'))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./src'))
    ;
});

gulp.task('scripts2', function() {
    return gulp.src([
        './src/meta.js',
        './src/temp.js'
    ])
    .pipe(concat('battle-eye-live.user.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest(sync))
    ;
});

gulp.task('scripts3', function() {
    return gulp.src('./src/temp.js').pipe(clean());
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.js', ['scripts']);
});
