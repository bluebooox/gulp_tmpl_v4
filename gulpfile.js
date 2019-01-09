const gulp = require("gulp");
const $    = require('gulp-load-plugins')();
const plumber = require('gulp-plumber');
const notifier = require('node-notifier');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const pug = require('gulp-pug');
const cache = require('gulp-cached');
const browsersync = require("browser-sync").create();
const htmlv = require('gulp-html-validator');
const notify = require('gulp-notify');
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const csso = require('gulp-csso');
const csscomb = require('gulp-csscomb');
const packageImporter = require('node-sass-package-importer');
const csslint = require('gulp-csslint');
const eslint = require("gulp-eslint");
const htmlhint = require("gulp-htmlhint");

const errorHandler = function(error) {
  const err = error;
  notifier.notify({
    message: err.message,
    title: err.plugin
  }, function() {
    console.log(err.message);
  });
};

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dest/"
    },
    port: 8890
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss', !'./src/sass/_modules/*.scss')
    .pipe( $.plumber({
    errorHandler: errorHandler
    }))
    .pipe(cache())
    .pipe( sourcemaps.write('.'))
    .pipe(sass(
    ))
    .pipe(autoprefixer({
            browsers: ["last 1 versions", "ie >= 11", "Android >= 5","ios_saf >= 10"],
            cascade: false
    }))
    .pipe(csscomb())
    .pipe(gulp.dest('./src/css/'))
    .pipe(csslint({
      "adjoining-classes": false,
      "box-model": false,
      "box-sizing": false,
      "bulletproof-font-face": false,
      "compatible-vendor-prefixes": false,
      "empty-rules": false,
      "display-property-grouping": false,
      "duplicate-background-images": false,
      "duplicate-properties": false,
      "fallback-colors": false,
      "floats": false,
      "font-faces": false,
      "font-sizes": false,
      "gradients": false,
      "ids": false,
      "import": false,
      "important": false,
      "known-properties": false,
      "outline-none": false,
      "overqualified-elements": false,
      "qualified-headings": false,
      "regex-selectors": false,
      "shorthand": false,
      "star-property-hack": false,
      "text-indent": false,
      "underscore-property-hack": false,
      "unique-headings": false,
      "universal-selector": false,
      "unqualified-attributes": false,
      "vendor-prefix": false,
      "zero-units": false
    }))
    .pipe(csslint.formatter())
    .pipe(csso())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dest/'))
    .pipe(browsersync.stream())
    .pipe(notify({
            title: 'Sassをコンパイルしました。',
            message: new Date(),
            sound: 'Glass'
            // icon: 'logo.gif'
    }));
    done();
});

gulp.task('pug', function () {
  return gulp.src(['./src/pug/*.pug', './src/pug/**/*.pug', '!./src/pug/**/_*.pug'])
  .pipe( $.plumber({
  errorHandler: errorHandler
  }))
  .pipe(cache())
  .pipe(pug({
    pretty: true
  }))
    .pipe(gulp.dest('./dest'))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter())
    .pipe(browsersync.stream())
    .pipe(notify({
            title: 'pugをコンパイルしました。',
            message: new Date(),
            sound: 'Glass',
            // icon: 'logo.gif'
    }));
    done();
});

// html validation
gulp.task( 'valid', function () {
  return gulp.src('./dest/**/*.html')
//  .pipe( htmlv( { format: 'html'} ) )
  .pipe( htmlv() )
  // .pipe(browserSync.stream())
  .pipe( gulp.dest( './dest/**/*.html') );
});


// gulp.task('compress', function() {
//   return gulp.src(['./src/js/*.js'])
//     .pipe( $.plumber({
//     errorHandler: errorHandler
//     }))
//     .pipe(uglify())
//     .pipe(rename({suffix: '.min'}))
//     // .pipe(browserSync.stream())
//     .pipe(gulp.dest('./dest/common/js/'));
// });


//ESLint
gulp.task('lint', function () {
  return gulp.src(['Leaflet/dist/*.js']) // lint のチェック先を指定
    .pipe(plumber({
      // エラーをハンドル
      errorHandler: function (error) {
        var taskName = 'eslint';
        var title = '[task]' + taskName + ' ' + error.plugin;
        var errorMsg = 'error: ' + error.message;
        // ターミナルにエラーを出力
        console.error(title + '\n' + errorMsg);
        // エラーを通知
        notifier.notify({
          title: title,
          message: errorMsg,
          time: 3000
        });
      }
    }))
    .pipe(eslint({
      useEslintrc: true
    })) // .eslintrc を参照
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(plumber.stop());
});


gulp.task('default', gulp.series('sass', 'pug', 'lint'));


function watch() {
  browsersync.init({
    server: {
      baseDir: "./dest/"
    },
    port: 8890
  });
  gulp.watch(['./src/sass/**/*'], gulp.task('sass'));
  gulp.watch(['./src/pug/*.pug'], gulp.task('pug'));
};

exports.watch = watch