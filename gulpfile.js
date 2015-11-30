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
    browserSync = require('browser-sync').create(),
    path = require('path');


gulp.task('styles', function() {
  return gulp.src('less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('scripts', function() {
  return gulp.src('src/**/*.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
  return gulp.src('images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/assets/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function(cb) {
    del(['dist/assets/css'], cb);
    del(['dist/assets/js'], cb);
    del(['dist/assets/images'], cb);
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles');
    gulp.start('scripts');
    gulp.start('images');
});

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('less/**/*.less', ['styles']);
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('images/**/*.png', ['images']);
});

gulp.task('browser-sync', function () {
   var files = [
      '*.html',
      'dist/assets/css/**/*.css',
      'dist/assets/images/**/*.png',
      'dist/assets/js/**/*.js'
   ];

   browserSync.init({
      server: {
         baseDir: './'
      }
   });
});