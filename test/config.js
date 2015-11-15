module.exports = {
  db: 'log2mongo',
  host: '127.0.0.1:27017',
  collection: 'test',
  dir: './test',
  skip: function (filename) {
    return filename !== 'log';
  },

  map: [
    'createdAt', 'origin', 'xForwardFor', 'referrer', 'country', 'city', 'latitude|number', 'longitude|number',
    'query|url', 'userAgent', 'arr|array'],

  callback: (err, ret) => {
    if (err) throw err;
    if (ret) {
      console.log('✔  %d records inserted', ret.insertedCount);
      console.log('=  done!\n');
    }
  }
};