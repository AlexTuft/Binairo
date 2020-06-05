const babel = require('gulp-babel')
const cssminify = require('cssnano')
const del = require("del")
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const optimizejs = require('gulp-optimize-js')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')
const scsslint = require('gulp-scss-lint')
const uglyfyjs = require('gulp-terser')
const webpack = require('webpack-stream')

const scriptsPattern = 'src/scripts/*.js'
const entryScript = 'src/scripts/index.js'
const stylesPattern = 'src/styles/*.scss'
const outputDir = 'out/release'

const babelConfig = {
  presets: ['@babel/env']
}

const webpackConfig = {
  output: {
    filename: 'index.js'
  }
}

function clean () {
  return del([outputDir])
}

function copyHtml () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest(outputDir))
}

function lintJs () {
  return gulp.src(scriptsPattern)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function buildReleaseJs () {
  return gulp.src(entryScript)
    .pipe(webpack({ ...webpackConfig, mode: 'production' }))
    .pipe(babel(babelConfig))
    .pipe(uglyfyjs())
    .pipe(optimizejs())
    .pipe(gulp.dest(outputDir))
}

function lintCss () {
  return gulp.src(stylesPattern)
    .pipe(scsslint({
      'config': '.scss-lint.yml'
    }))
    .pipe(scsslint.failReporter())
}

function buildReleaseCss () {
  return gulp.src(stylesPattern)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      cssminify({
        discardComments: {
          removeAll: true
        }
      })
    ]))
    .pipe(gulp.dest(outputDir))
}

exports.release = gulp.series(clean, gulp.parallel(
  copyHtml,
  gulp.series(lintJs, buildReleaseJs),
  gulp.series(lintCss, buildReleaseCss)))
