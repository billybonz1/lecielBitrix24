var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		cleanCSS    = require('gulp-clean-css'),
		browserSync  = require('browser-sync').create(),
		imagemin = require('gulp-imagemin'),
		pngquant    = require('imagemin-pngquant'),
		cache       = require('gulp-cache'),
		uglify       = require('gulp-uglify'),
		sourcemaps = require("gulp-sourcemaps"),
		babel = require("gulp-babel"),
		concat = require("gulp-concat");

gulp.task('img', function() {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('app/img'));
});

gulp.task('browser-sync', ['styles', 'scripts'], function() {
		browserSync.init({
				server: {
						baseDir: "./app"
				},
				notify: false
		});
});

gulp.task('es6browser-sync', ['es6'], function() {
	browserSync.init({
		server: {
			baseDir: "./es6test"
		},
		notify: false
	});
});

gulp.task('styles', function () {
	return gulp.src('scss/*.scss')
	.pipe(sass({
		includePaths: require('node-bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(autoprefixer({browsers: ['last 15 versions'], cascade: false}))
	.pipe(cleanCSS())
	.pipe(gulp.dest('./app/css'))
	.pipe(browserSync.stream());
});

gulp.task('scripts', function() {
	return gulp.src([
		'libs/jquery/dist/jquery.min.js',
		'libs/material-design-lite/material.min.js'
		])
		.pipe(concat('libs.js'))
		//.pipe(uglify()) //Minify libs.js
		.pipe(gulp.dest('./app/js/'));
});


gulp.task('ss', ['styles', 'scripts']);


gulp.task('common', function() {
  return gulp.src('./app/js/common.js')
    .pipe(uglify())
    .pipe(gulp.dest('./app/js/'));
});

gulp.task('es6',function () {
	return gulp.src("es6test/*.js")
		.pipe(sourcemaps.init())
		.pipe(babel()).on('error',  console.error.bind(console))
		.pipe(concat("all.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("es6test/dist"));
});

gulp.task('watch', function () {
	gulp.watch('scss/*.scss', ['styles']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('es6test/*.js', ['es6']);
	gulp.watch('es6test/*.js').on("change", browserSync.reload);
	gulp.watch('es6test/*.html').on('change', browserSync.reload);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['es6browser-sync', 'watch']);

