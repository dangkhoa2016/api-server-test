const express = require('express');
const cors = require('cors');
// require('dotenv').config();
var fs = require('fs');
const bodyParser = require('body-parser')
const app = express();
const upload_handler = require('./upload_handler');
const {
  ipMiddleware, authMiddleware, rateLimiterMiddleware
} = require('./middleware');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '500kb', extended: true }))

// parse application/json
app.use(bodyParser.json({ limit: '500kb' }))


// allow cross-origin requests
app.use(cors());
//check ip
app.use(ipMiddleware);

app.use('/api/*', [authMiddleware, rateLimiterMiddleware]);

app.post('/api/upload', upload_handler);

app.use('/ip', (req, res) => {
  res.send(req.clientIp);
});

app.use("/", (req, res) => {
  res.json({ msg: 'Welcome to Api server' });
});

// catch 404 Not found middleware
app.use((req, res, next) => {
  console.log("Not found", req.url);
  const err = new Error(`The page requested does not exist.`);
  res.status(404).json({ err });
});

//Global error middleware handler
app.use(function(err, req, res, next) {
  // console.log("Global error", err);
  if (err && err.status === 404) {
    err.message = `The page requested does not exist.`;
    res.status(404).json({ err });
  } else {
    if (!err.message)
      err.message = `Ooops! It looks like something went wrong on the server.`;
    res.status(err.status || 500).json({ err });
  }
});

module.exports = app;
