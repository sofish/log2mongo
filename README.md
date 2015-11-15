![build status](https://travis-ci.org/sofish/log2mongo.svg?branch=master)

# log2mongo

import JSON to mongodb, associate with [sofish/log2json](https://github.com/sofish/log2json) to manage nginx logs.

```php
$ npm install log2mongo -g
```

## Usage

It's a command line tool and should install with the `-g` flag.

```php
$ log2mongo config.js
```

The `config.js` should be a node module like this:

```js
module.exports = {
  "db": "db-name",
  "host": "127.0.0.1:27017",
  "collection": "collection",       // {function|string} collection to insert, or a function returns a string

  "dir": "dir/contains/logs",       // where to find logs
  "skip": skip(filename)            // {function} [optional] a function return Boolean, when True, file ignored
  "separator": "•-•",               // separator of your (nginx/apache/whatever) log fields
  "map": [],                        // map with log fields that create by `split(separator)`

  "username": "sofish",             // [optional] db username
  "password": "***"                 // [optional] db password
}
```

## Test

Simply run `npm test` to see what happens.
