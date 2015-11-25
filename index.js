'use strict';

const fs = require("fs");
const path = require("path");
const _extend = require('util')._extend;
const log2json = require('log2json');
const mongoimport = require('mongoimport');

var config = process.argv[2];
config = require(path.resolve(process.cwd(), config));
config = _extend({
  host: '127.0.0.1:27017',
  db: 'log2mongo',
  collection: 'test',
  separator: '•-•',
  map: [],
  callback: (err, ret) => {
    if(err) throw err;
    console.log(ret);
  },
  skip: filename => /^\./.test(filename)
}, config);

/* Example of config file: should be a node module
 *  module.exports = {
 *    "db": "db-name",
 *    "host": "127.0.0.1:27017",
 *    "collection": "collection",       // {function|string} collection to insert, or a function returns a string
 *
 *    "dir": "dir/contains/logs",       // where to find logs
 *    "skip": skip(filename)            // {function} [optional] a function return Boolean, when True, file ignored
 *    "separator": "•-•",               // separator of your (nginx/apache/whatever) log fields
 *    "map": [],                        // {function|array} map log fields; if it's a func, should always array
 *
 *    "username": "sofish",             // [optional] db username
 *    "password": "***"                 // [optional] db password
 *  }
 */

// read and process files
fs.readdir(config.dir, (err, files) => {
  if(err) throw err;

  files.forEach(file => {
    if(config.skip(file) || /^__inUse__/.test(file)) return config.callback(null);

    let oldPath = path.resolve(process.cwd(), config.dir, file);
    let inUseFile = '__inUse__' + file;
    let newPath = path.resolve(process.cwd(), config.dir, inUseFile);

    fs.renameSync(oldPath, newPath);
    render(newPath);
  });
});

// process with log2json
function render(file) {
  var map = typeof config.map === 'function' ? config.map(file) : config.map;

  log2json({
    map,
    separator: config.separator,
    src: file,
    removeSrc: false,

    // instead of create new file, pass it to importor fn
    dist: importor.bind(null, file)
  });
}

// import to mongodb
function importor(file, fields) {
  var collection = typeof config.collection === 'function' ?
      config.collection(file) : config.collection;

  mongoimport({
    collection, fields,
    db: config.db,
    host: config.host,
    username: config.username,
    password: config.password,
    callback: function(err, ret) {
      config.callback.apply(config, arguments);
    }
  });
}

process.on('uncaughtException', function(err) {
  // ignore duplicate key error from 3rd party mongodb module
  if(err.message.match(/E11000 duplicate key error index: perf\.(analy|perf)\./)) return;
});