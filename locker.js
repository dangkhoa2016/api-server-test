var AsyncLock = require('async-lock');
var lock = new AsyncLock({ timeout: 5000 });
const key = 'file-log';

module.exports = function lock_for_write(cb, opts, done) {

  // Promise mode
  lock.acquire(key, cb, opts).then(function() {
    // lock released
    if (typeof done === 'function')
      done();
  }).catch(function(err) {
    console.log('Save log error', err.message); // output: error

    if (typeof done === 'function')
      done();
  });

}
