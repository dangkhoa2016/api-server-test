
var fs = require('fs');
var path = require('path');
const lock_for_write = require('./locker');
const time_to_wait = 1000;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var handle = async function(req, res) {
  var { client, name, file } = req.body;
  if (!client)
    return res.status(422).json({ err: 'Please provide your client name.' });
  if (!name)
    return res.status(422).json({ err: 'Please provide your uploaded file.' });

  await timeout(time_to_wait);
  var date = new Date();

  lock_for_write(function() {
    var path_file = path.join(process.cwd(), `logs/${client || 'all'}.txt`);
    var log = `[${date}]: {${name}} --> ${file}\r\n`;

    fs.appendFileSync(path_file, log);
  }, null, function() {
    res.json({ msg: `Saved file [${name}].`, date });
  })
}

module.exports = handle;
