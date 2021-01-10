
const { RateLimiterMemory } = require('rate-limiter-flexible');
const requestIp = require('request-ip');
const SECRET = process.env.SECRET;

const ipMiddleware = function(req, res, next) {
  //  req.clientIp = req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress);
  req.clientIp = requestIp.getClientIp(req);

  next();
}

const authMiddleware = function(req, res, next) {
  var token = req.headers['token'];
  if (!token)
    return res.status(422).json({ err: 'Please provide your token.' });
  if (SECRET !== token)
    return res.status(422).json({ err: 'Not a valid token.' });
  var { client } = req.body;
  if (!client)
    return res.status(422).json({ err: 'Please provide your client name.' });
  req.userId = client;

  next();
}

const opts = {
  points: 8, // 6 points
  duration: 1, // Per second
  blockDuration: 60
};

const rateLimiter = new RateLimiterMemory(opts);

const rateLimiterMiddleware = (req, res, next) => {
  // req.userId should be set
  const key = req.userId ? req.userId : req.clientIp;
  const pointsToConsume = req.userId ? 2 : 4;
  rateLimiter.consume(key, pointsToConsume).then((rateLimiterRes) => {
    //  points consumed
    next();
  }).catch((rateLimiterRes) => {
    // Not enough points to consume
    const headers = {
      "Retry-After": rateLimiterRes.msBeforeNext / 1000,
      "X-RateLimit-Limit": opts.points,
      "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
      "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext)
    };
    res.set(headers);
    res.status(429).send('Too Many Requests');
  });
};


module.exports = {
  ipMiddleware, authMiddleware, rateLimiterMiddleware
}
