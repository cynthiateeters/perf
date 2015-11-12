var onError = function (err) {
    console.log(err);
};

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    csslint = require('gulp-csslint'),
    uncss = require('gulp-uncss'),
    nano = require('gulp-cssnano'),
    minifyCss = require('gulp-minify-css'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    pngquant = require('imagemin-pngquant'),
    responsive = require('gulp-responsive'),
    imageResize = require('gulp-image-resize'),
    sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('run-sequence'),
    del = require('del'),
    concat = require('gulp-concat');

var env,
    jsSources,
    scriptSources,
    sassSources,
    htmlSources,
    jsonSources,
    responsiveSources,
    imageSources,
    outputDir,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

htmlSources = [
    'builds/development/index.html',
    'builds/development/pizza.html',
    'builds/development/project-20148.html',
    'builds/development/project-mobile.html',
    'builds/development/project-webperf.html'
];

jsSources = [
    'components/scripts/main.js',
    'components/scripts/perfmatters.js'
];

sassSources = [
    'components/sass/style.scss',
    'components/sass/print.scss',
    'components/sass/style2.scss'
];

responsiveSources = [
    'builds/development/images/2048.png',
    'builds/development/images/pizza.png',
];

imageSources = [
    'builds/development/images/2048.png',
    'builds/development/images/cam_be_like.jpg',
    'builds/development/images/mobilewebdev.jpg',
    'builds/development/images/pizza.png',
    'builds/development/images/pizzeria.jpg',
    'builds/development/images/profilepic.jpg'
];
jsonSources = [outputDir + 'js/*.json'];

gulp.task('jshint', function () {
    del('jshint-output.html');
    return gulp.src(jsSources)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('gulp-jshint-html-reporter', {
            filename: 'jshint-output.html',
            createMissingFolders: false
        }));
});

gulp.task('csslint', function () {
    gulp.src('builds/development/css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
});

gulp.task('js', function () {
    gulp.src(jsSources)
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload());
    gulp.src(jsSources)
        .pipe(gulpif(env === 'development', gulp.dest(outputDir + 'js')))
        .pipe(connect.reload());
});

gulp.task('html', function () {
    gulp.src(htmlSources)
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload());
});

gulp.task('copy-css', function () {
    gulp.src('components/css/**/*.css')
        .pipe(gulp.dest(outputDir + 'css'));
});

gulp.task('compass', function () {
    gulp.src(sassSources)
        .pipe(compass({
                sass: 'components/sass',
                image: outputDir + 'images',
                style: sassStyle
            })
            .on('error', gutil.log))
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload());
});

gulp.task('minify-css', function () {
    gulp.src('builds/production/css/*.css')
        .pipe(gulpif(env === 'production', minifyCss({
            compatibility: 'ie8'
        })))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/css')))
        .pipe(connect.reload());
});

gulp.task('build-css', function () {
    runSequence('copy-css', 'compass',
        'minify-css');
});

gulp.task('responsive', function () {
    return gulp.src(responsiveSources)
        .pipe(responsive([{
            name: 'pizza.png',
            width: 100
        }, {
            name: '2048.png',
            width: 550
        }]))
        .pipe(gulp.dest(outputDir + '/images'));
});

gulp.task('resize', function () {
    gulp.src('builds/development/images/pizzeria.jpg')
        .pipe(imageResize({
            width: 100,
            upscale: false
        }))
        .pipe(gulp.dest(outputDir + '/images'));
});

gulp.task('suffix', function () {
    gulp.src('builds/development/images/**/*.*')
        .pipe(imageResize({
            width: 100
        }))
        .pipe(rename(function (path) {
            path.basename += '-thumbnail';
        }))
        .pipe(gulp.dest(outputDir + '/images'));
});

gulp.task('images', function () {
    gulp.src(imageSources)
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload());
});

gulp.task('json', function () {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(jsSources, ['js']);
    gulp.watch('components/sass/*.scss', ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
});

gulp.task('connect', function () {
    connect.server({
        root: outputDir,
        livereload: true
    });
});

// Use connect and watch when developing code for instant update to browser
//gulp.task('default', ['html', 'build-css', 'json', 'js', 'images', 'connect', 'watch']);

gulp.task('default', ['html', 'minify-css', 'json', 'js', 'images']);
