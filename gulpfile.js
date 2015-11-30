var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    path = require('path');


gulp.task('styles', function() {
  return gulp.src('public/stylesheets/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('public/dist/assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('public/dist/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function() {
  return gulp.src('public/javascripts/**/*.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist/assets/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src('public/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('public/dist/assets/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function(cb) {
    del(['public/dist/assets/css'], cb);
    del(['public/dist/assets/js'], cb);
    del(['public/dist/assets/images'], cb);
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles');
    gulp.start('scripts');
    gulp.start('images');
});

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('public/stylesheets/**/*.less', ['styles']);
  gulp.watch('public/javascripts/**/*.js', ['scripts']);
  gulp.watch('public/images/**/*', ['images']);
});
