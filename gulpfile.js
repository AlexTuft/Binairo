const babel = require('gulp-babel')
const del = require("del")
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const optimizejs = require('gulp-optimize-js')
const uglyfyjs = require('gulp-terser')

const inputPattern = './src/*.js'
const outputDir = 'out/release/'

const babelConfig = {
  presets: ['@babel/env']
}

function clean () {
  return del([outputDir])
}

function lintJs () {
  return gulp.src(inputPattern)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function buildReleaseJs () {
  return gulp.src(inputPattern)
    .pipe(babel(babelConfig))
    .pipe(uglyfyjs())
    .pipe(optimizejs())
    .pipe(gulp.dest(outputDir))
}

exports.release = gulp.series(clean, lintJs, buildReleaseJs)
