"use strict";

const fs = require("fs");
const path = require("path");
const _extend = require('util')._extend;
const log2json = require('log2json');
const mongoimport = require('mongoimport');

var defaults = {
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
};

var config = process.argv[2];
config = require(path.resolve(__dirname, config));
config = _extend(defaults, config);

/* Example of config file: should be a node module
 *  module.exports = {
 *    "db": "db-name",
 *    "host": "127.0.0.1:27017",
 *    "collection": "collection",       // {function|string} collection to insert, or a function returns a string
 *
 *    "dir": "dir/contains/logs",       // where to find logs
 *    "skip": skip(filename)            // {regexp} [optional] a function return Boolean, when True, file ignored
 *    "separator": "•-•",               // separator of your (nginx/apache/whatever) log fields
 *    "map": [],                        // map with log fields that create by `split(separator)`
 *
 *    "username": "sofish",             // [optional] db username
 *    "password": "***"                 // [optional] db password
 *  }
 */

// read and process files
fs.readdir(config.dir, (err, files) => {
  if(err) throw err;

  files.forEach(file => {
    if(config.skip(file)) return config.callback(null);
    render(path.resolve(process.cwd(), config.dir, file));
  });
});

// process with log2json
function render(file) {
  log2json({
    map: config.map,
    separator: config.separator,
    src: file,
    dist: importor // instead of create new file, pass it to importor fn
  });
}

// import to mongodb
function importor(fields) {
  mongoimport({
    fields,
    db: config.db,
    collection: config.collection,
    host: config.host,
    username: config.username,
    password: config.password,
    callback: config.callback
  });
}