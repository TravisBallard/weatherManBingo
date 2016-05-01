var gulp = require('gulp');

var app = {

	html: {
		minify: true,
		src: './src/**/*.html',
		dest: './dist',
		options: {
			collapseWhitespace: true
		}
	},

	json: {
		src: './src/inc/json/**/*.json',
		dest: './dist/inc/json'
	},

	sass: {
		src: './src/inc/sass/**/*.sass',
		dest: './dist/inc/css',
		options: {
			outputStyle: 'compressed',
			includePaths : './src/inc/compass/sass'
		}
	},

	js: {
		src: './src/inc/js/**/*.js',
		dest: './dist/inc/js'
	},

	imagemin: {
		src: './src/img/**/*',
		dest: './dist/img',
		options: {
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		}
	},

	fonts: {
		src: './src/fonts/**/*',
		dest: './dist/fonts'
	},

	sourcemaps: {
		dest: 'maps'
	},

	autoprefixer: {
		options: {
			browsers: [
				'last 2 versions',
				'safari 5',
				'ie 8',
				'ie 9',
				'opera 12.1',
				'ios 6',
				'android 4'
			]
		}
	},

	concat: {
		destJS: 'main.js'
	},

	bower: {
		src: './bower.json',
		destJS: './dist/inc/js',
		destCSS: './dist/inc/compass/css'
	}
};

// Include plugins
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*'],
	replaceString: /\bgulp[\-.]/
});

// HTML
gulp.task( 'html', function(){

	return app.html.minify ?

		gulp.src(app.html.src)
			.pipe(plugins.htmlmin(app.html.options))
			.pipe(gulp.dest(app.html.dest)) :

		gulp.src(app.html.src)
			.pipe(gulp.dest(app.html.dest));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src(app.js.src)
		.pipe(plugins.concat(app.concat.destJS))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest(app.js.dest));
});

// Bower
gulp.task('bower', function() {

	var jsFilter = plugins.filter('**/*.js', {restore: true}),
		cssFilter = plugins.filter('**/*.css', {restore: true});

	return gulp.src(app.bower.src)
		.pipe(plugins.mainBowerFiles())

		// js
		.pipe(jsFilter)
		.pipe(plugins.concat('vendor.js'))
		.pipe(plugins.uglify())
		.pipe(plugins.rename({suffix: ".min"}))
		.pipe(gulp.dest(app.bower.destJS))
		.pipe(jsFilter.restore)

		// css
		.pipe(cssFilter)
		.pipe(plugins.concat('vendor.css'))
		.pipe(plugins.cssnano())
		.pipe(plugins.rename({suffix: ".min"}))
		.pipe(gulp.dest(app.bower.destCSS))
		.pipe(cssFilter.restore);
});

// Compile CSS from Sass files
gulp.task('sass', function() {
	return gulp.src(app.sass.src)
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.sass(app.sass.options))
		.pipe(plugins.autoprefixer(app.autoprefixer.options))
		.pipe(plugins.sourcemaps.write(app.sourcemaps.dest))
		.pipe(gulp.dest(app.sass.dest));
});

// Minify Images
gulp.task('images', function() {
	return gulp.src(app.imagemin.src)
		.pipe(plugins.cache(plugins.imagemin(app.imagemin.options)))
		.pipe(gulp.dest(app.imagemin.dest));
});

// Fonts
gulp.task('fonts', function() {
	return gulp.src(app.fonts.src)
		.pipe(gulp.dest(app.fonts.dest));
});

// JSON
gulp.task('json', function() {
	return gulp.src(app.json.src)
		.pipe(gulp.dest(app.json.dest));
});



// Watch
gulp.task('watch', function() {
	gulp.watch(app.html.src, ['html']);
	gulp.watch(app.js.src, ['scripts']);
	gulp.watch(app.sass.src, ['sass']);
	gulp.watch(app.imagemin.src, ['images']);
});

// Default
gulp.task('default', ['html', 'fonts', 'json', 'scripts', 'bower', 'sass', 'images', 'watch']);
gulp.task('build', ['html', 'fonts', 'json', 'scripts', 'bower', 'sass', 'images']);