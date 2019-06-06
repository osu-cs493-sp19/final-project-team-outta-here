const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');
const { connectToDB } = require('./lib/mongo')

const app = express();
const port = process.env.PORT || 8000;

//rate limiting
const redis = require('redis');

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST;
const redisClient = redis.createClient(redisPort, redisHost);
const rateLimitWindowMillis = 60000;
const rateLimitWindowMaxRequests = 5;

function getTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err);
      } else {
        if (tokenBucket) {
          tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        } else {
          tokenBucket = {
            tokens: rateLimitWindowMaxRequests,
            last: Date.now()
          };
        }
        resolve(tokenBucket);
      }
    });
  });
}

function saveTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getTokenBucket(req.ip);

    const timestamp = Date.now();
    const ellapsedMillis = timestamp - tokenBucket.last;
    const refreshRate = rateLimitWindowMaxRequests / rateLimitWindowMillis;
    tokenBucket.tokens += refreshRate * ellapsedMillis;
    tokenBucket.tokens = Math.min(rateLimitWindowMaxRequests, tokenBucket.tokens);
    tokenBucket.last = timestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      saveTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      saveTokenBucket(req.ip, tokenBucket);
      res.status(429).send({
        error: "Too many requests per minute"
      });
    }

  } catch (err) {
    console.error(err);
    next();
  }
}

app.use(rateLimit);




/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});



connectToDB(() => {
  app.listen(port, function() {
    console.log("== Server is running on port", port);
  });
});  
