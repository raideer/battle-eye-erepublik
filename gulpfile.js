var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var sync = "C:\\Users\\Raideer\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\novzk6sa.default-1439382728599\\gm_scripts\\Battle_Eye_Live";

gulp.task('default', ['scripts']);

gulp.task('scripts', function() {
    return gulp.src(
        [
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
    gulp.watch('./src/**/*.js', ['scripts']);
});
