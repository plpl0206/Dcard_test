var express = require('express');
var router = express.Router();
const { rateLimiter } = require('../middleware/rateLimiter');

router.get('/', rateLimiter, function(req, res, next) {
  res.send(res.locals.reqCount.toString());
});
 
module.exports = router;
