const gulp = require('gulp'),
	webpack = require('webpack'),
	webpackStream = require('webpack-stream'),
	webpackConfig = require('./webpack.config'),
	gsass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	changed = require('gulp-changed'),
	cache = require('gulp-cached'),
	progeny = require('gulp-progeny');
	rename = require("gulp-rename"),
	htmlmin = require('gulp-htmlmin'),
	cssmin = require('gulp-cssmin'),
	uglify = require('gulp-uglify'),
	phpMinify = require('@aquafadas/gulp-php-minify'),
	sourcemaps = require("gulp-sourcemaps");
	postcss = require('gulp-postcss'),
	assets = require('postcss-assets'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant');
const dir = {
	src: './htdocs/', // _srcフォルダ置き換え
	// dist: '../sample/dist' // destフォルダ置き換え
};

// ファイル監視
gulp.task('w', function () {
	gulp.watch(dir.src + '/**/*.html', ['reload']);
	gulp.watch(dir.src + '/js/**/*.js', ['reload']);
	gulp.watch(dir.src + '/scss/**/*.scss', ['postcss']);
});

// ローカルサーバ起動
gulp.task('server', function () {
	browserSync({
		port: 8282,
		notify: false,
		server: {
			baseDir: dir.src,
			index: 'index.html'
		}
	});
});

// ブラウザリロード
gulp.task('reload', function () {
	browserSync.reload();
});


// postcssを使用してSCSSを変換
gulp.task('postcss', function () {
	return gulp.src(dir.src + '/scss/**/*.scss')
		.pipe(cache('postcss'))
		.pipe(progeny())
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err.messageFormatted);
				this.emit('end');
			}
		}))
		.pipe(sourcemaps.init())
		.pipe(gsass())
		.pipe(autoprefixer({
			// メインブラウザの最新2バージョン、ie9以上、iOS 9以上、Android 5以上
			browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4'],
			cascade: false,
		}))
		.pipe(postcss([
			assets({
				loadPaths: [dir.src + 'img/'],	//対象ディレクトリ
				relative: true, // 相対パス
				// basePath: dir.src, // ルート相対パス
			})
		]))
		.pipe(sourcemaps.write('map'))
		.pipe(gulp.dest(dir.src + 'css'))
		.pipe(browserSync.stream());
});


// 画像圧縮処理
gulp.task('imagemin', function () {
	gulp.src([dir.src + '/img/**/*'])
		.pipe(imagemin(
			[pngquant({ quality: '65-80', speed: 1 })]
		))
		.pipe(imagemin()) // ←追加
		.pipe(gulp.dest('./htdocs_minify/minify/img'));
});


gulp.task('minify-html', function () {
	//html
	return gulp.src(dir.src + '/**/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		// .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./htdocs_minify/minify/'));
});

gulp.task('minify-css', function () {
	//css
	return gulp.src(dir.src + '/**/*.css')
		.pipe(cssmin())
		// .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./htdocs_minify/minify/css'));
});

gulp.task('minify-js', function () {
	//js
	return gulp.src(dir.src + '/**/*.js')
		.pipe(uglify())
		// .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./htdocs_minify/minify/js'));
});

// gulp.task('minify-php', () => gulp.src(dir.src + '/**/*.php', {read: false})
// 	//php
//   .pipe(phpMinify())
//   .pipe(gulp.dest('./htdocs_minify/minify/php'))
// );

//webpack
gulp.task('webpack', function () {
	webpackStream(webpackConfig, webpack)
	.pipe(plumber({
		errorHandler: function (err) {
			console.log(err.messageFormatted);
			this.emit('end');
		}
	}))
		.pipe(gulp.dest('./htdocs/js/'));    // 出力先のフォルダを相対パスで指定する
});


// 実行
gulp.task('default', ["w", "server"]);
//minify コマンド
gulp.task('minify', ['minify-html', 'minify-css', 'minify-js' , 'imagemin']);